import { useEffect, useSyncExternalStore } from "react";
import type {
  ConsentService,
  HistoryAction,
  HistoryEvent,
  User,
} from "./consent-types";
import { DEMO_USERS, getServicesForUser } from "./seed-data";

const USERS_KEY = "consent-os:users";
const SESSION_KEY = "consent-os:session";
const dataKey = (uid: string) => `consent-os:data:${uid}`;

interface UserData {
  services: ConsentService[];
  history: HistoryEvent[];
}

interface State {
  users: User[];
  currentUserId: string | null;
  data: Record<string, UserData>;
}

let state: State = { users: [], currentUserId: null, data: {} };
let initialized = false;
const listeners = new Set<() => void>();

const isBrowser = () => typeof window !== "undefined";

// ---------- persistence ----------
function loadUsers(): User[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  try {
    const stored: User[] = JSON.parse(raw);
    // дополняем недостающими демо-пользователями (на случай старого кэша)
    const merged = [...stored];
    for (const demo of DEMO_USERS) {
      if (!merged.find((u) => u.email === demo.email)) merged.push(demo);
    }
    if (merged.length !== stored.length) {
      localStorage.setItem(USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return DEMO_USERS;
  }
}

function loadUserData(userId: string): UserData {
  if (!isBrowser()) return { services: [], history: [] };
  const raw = localStorage.getItem(dataKey(userId));
  if (raw) {
    try {
      return JSON.parse(raw) as UserData;
    } catch {
      /* fallthrough */
    }
  }
  // первый вход — создаём из seed
  const services = getServicesForUser(userId);
  const history: HistoryEvent[] = services.map((s) => ({
    id: `seed-${userId}-${s.id}`,
    serviceId: s.id,
    serviceName: s.name,
    serviceIcon: s.icon,
    action: "granted" as HistoryAction,
    timestamp: s.grantedAt,
    dataPoints: s.dataPoints.map((d) => d.label),
  }));
  const data = { services, history };
  localStorage.setItem(dataKey(userId), JSON.stringify(data));
  return data;
}

function persistUserData(userId: string) {
  if (!isBrowser()) return;
  const d = state.data[userId];
  if (d) localStorage.setItem(dataKey(userId), JSON.stringify(d));
}

function persistSession() {
  if (!isBrowser()) return;
  if (state.currentUserId) {
    localStorage.setItem(SESSION_KEY, state.currentUserId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function ensureInit() {
  if (initialized || !isBrowser()) return;
  const users = loadUsers();
  const sessionId = localStorage.getItem(SESSION_KEY);
  const currentUserId = sessionId && users.find((u) => u.id === sessionId) ? sessionId : null;
  const data: Record<string, UserData> = {};
  if (currentUserId) data[currentUserId] = loadUserData(currentUserId);
  state = { users, currentUserId, data };
  initialized = true;
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  ensureInit();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: State = { users: [], currentUserId: null, data: {} };
const getSnapshot = (): State => {
  ensureInit();
  return state;
};
const getServerSnapshot = (): State => EMPTY;

// ---------- mock webhook ----------
async function sendWebhook(serviceName: string, action: string, fields?: string[]) {
  const payload = {
    service: serviceName,
    action,
    fields,
    timestamp: new Date().toISOString(),
  };
  console.log(
    `%c[WEBHOOK] → ${serviceName}: ${action}${fields ? ` [${fields.join(", ")}]` : ""}`,
    "color:#7c3aed;font-weight:600",
    payload,
  );
  try {
    await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // прототип не блокируем
  }
}

// ---------- auth ----------
export function login(email: string, password: string): { ok: true } | { ok: false; error: string } {
  ensureInit();
  const u = state.users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
  if (!u) return { ok: false, error: "Пользователь с таким email не найден" };
  if (u.password !== password) return { ok: false, error: "Неверный пароль" };
  state = {
    ...state,
    currentUserId: u.id,
    data: { ...state.data, [u.id]: loadUserData(u.id) },
  };
  persistSession();
  emit();
  return { ok: true };
}

export function register(
  email: string,
  password: string,
  name: string,
): { ok: true } | { ok: false; error: string } {
  ensureInit();
  const trimmed = email.toLowerCase().trim();
  if (!trimmed.includes("@")) return { ok: false, error: "Некорректный email" };
  if (password.length < 6) return { ok: false, error: "Пароль должен быть от 6 символов" };
  if (state.users.find((u) => u.email.toLowerCase() === trimmed)) {
    return { ok: false, error: "Пользователь с таким email уже существует" };
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: trimmed,
    password,
    name: name || trimmed.split("@")[0],
  };
  const users = [...state.users, newUser];
  if (isBrowser()) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  state = {
    users,
    currentUserId: newUser.id,
    data: { ...state.data, [newUser.id]: loadUserData(newUser.id) },
  };
  persistSession();
  emit();
  return { ok: true };
}

export function logout() {
  ensureInit();
  state = { ...state, currentUserId: null };
  persistSession();
  emit();
}

// ---------- mutations ----------
function withCurrentData(mutator: (d: UserData, uid: string) => UserData) {
  ensureInit();
  const uid = state.currentUserId;
  if (!uid) return;
  const next = mutator(state.data[uid] ?? { services: [], history: [] }, uid);
  state = { ...state, data: { ...state.data, [uid]: next } };
  persistUserData(uid);
  emit();
}

export async function revokeService(serviceId: string) {
  const cur = state.currentUserId ? state.data[state.currentUserId] : null;
  const svc = cur?.services.find((s) => s.id === serviceId);
  if (!svc) return;
  await sendWebhook(svc.name, "revoke_all");
  const ts = new Date().toISOString();
  withCurrentData((d) => ({
    services: d.services.map((s) =>
      s.id === serviceId
        ? {
            ...s,
            status: "revoked",
            revokedAt: ts,
            dataPoints: s.dataPoints.map((p) => ({ ...p, granted: false })),
          }
        : s,
    ),
    history: [
      {
        id: `evt-${ts}-${serviceId}`,
        serviceId: svc.id,
        serviceName: svc.name,
        serviceIcon: svc.icon,
        action: "revoked",
        timestamp: ts,
        dataPoints: svc.dataPoints.map((p) => p.label),
      },
      ...d.history,
    ],
  }));
}

export async function restoreService(serviceId: string) {
  const cur = state.currentUserId ? state.data[state.currentUserId] : null;
  const svc = cur?.services.find((s) => s.id === serviceId);
  if (!svc) return;
  await sendWebhook(svc.name, "restore_all");
  const ts = new Date().toISOString();
  withCurrentData((d) => ({
    services: d.services.map((s) =>
      s.id === serviceId
        ? {
            ...s,
            status: "active",
            revokedAt: undefined,
            grantedAt: ts,
            dataPoints: s.dataPoints.map((p) => ({ ...p, granted: true })),
          }
        : s,
    ),
    history: [
      {
        id: `evt-${ts}-${serviceId}`,
        serviceId: svc.id,
        serviceName: svc.name,
        serviceIcon: svc.icon,
        action: "restored",
        timestamp: ts,
        dataPoints: svc.dataPoints.map((p) => p.label),
      },
      ...d.history,
    ],
  }));
}

export async function toggleField(serviceId: string, fieldId: string) {
  const cur = state.currentUserId ? state.data[state.currentUserId] : null;
  const svc = cur?.services.find((s) => s.id === serviceId);
  const field = svc?.dataPoints.find((p) => p.id === fieldId);
  if (!svc || !field || svc.status === "revoked") return;
  if (field.required && field.granted) return; // обязательное нельзя отключить
  const willGrant = !field.granted;
  await sendWebhook(svc.name, willGrant ? "field_restore" : "field_revoke", [field.label]);
  const ts = new Date().toISOString();
  withCurrentData((d) => ({
    services: d.services.map((s) =>
      s.id === serviceId
        ? {
            ...s,
            dataPoints: s.dataPoints.map((p) =>
              p.id === fieldId ? { ...p, granted: willGrant } : p,
            ),
          }
        : s,
    ),
    history: [
      {
        id: `evt-${ts}-${serviceId}-${fieldId}`,
        serviceId: svc.id,
        serviceName: svc.name,
        serviceIcon: svc.icon,
        action: willGrant ? "field_restored" : "field_revoked",
        timestamp: ts,
        dataPoints: [field.label],
      },
      ...d.history,
    ],
  }));
}

export function resetCurrentUserData() {
  ensureInit();
  const uid = state.currentUserId;
  if (!uid || !isBrowser()) return;
  localStorage.removeItem(dataKey(uid));
  state = { ...state, data: { ...state.data, [uid]: loadUserData(uid) } };
  emit();
}

// ---------- hooks ----------
export function useSession() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    if (!initialized) {
      ensureInit();
      emit();
    }
  }, []);
  const user = snap.users.find((u) => u.id === snap.currentUserId) ?? null;
  return { user, isAuthenticated: !!user };
}

export function useUserData(): UserData {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!snap.currentUserId) return { services: [], history: [] };
  return snap.data[snap.currentUserId] ?? { services: [], history: [] };
}
