import { useEffect, useSyncExternalStore } from "react";
import type {
  ConsentService,
  HistoryAction,
  HistoryEvent,
} from "./consent-types";

const SERVICES_KEY = "consent-os:services";
const HISTORY_KEY = "consent-os:history";

// ---------- Demo seed ----------
const now = new Date();
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const DEMO_SERVICES: ConsentService[] = [
  {
    id: "sberbank",
    name: "СберБанк",
    icon: "🏦",
    category: "Банк",
    description: "Доступ к финансовым данным для скоринга и переводов",
    dataPoints: ["Паспортные данные", "Банковские счета", "История транзакций", "Кредитная история"],
    risk: "high",
    riskExplanation:
      "Полный доступ к финансовой жизни: счета, транзакции и кредитная история. Утечка может привести к мошенничеству.",
    status: "active",
    grantedAt: daysAgo(120),
  },
  {
    id: "gosuslugi",
    name: "Госуслуги",
    icon: "🏛️",
    category: "Госсервис",
    description: "Идентификация личности и доступ к госуслугам",
    dataPoints: ["ФИО", "СНИЛС", "Адрес регистрации", "ИНН"],
    risk: "medium",
    riskExplanation:
      "Идентифицирующие данные. Необходимы для работы с госорганами, но при утечке используются для оформления документов от вашего имени.",
    status: "active",
    grantedAt: daysAgo(340),
  },
  {
    id: "yandex-eda",
    name: "Яндекс Еда",
    icon: "🍔",
    category: "Доставка",
    description: "Доставка еды и персональные рекомендации",
    dataPoints: ["Телефон", "Геолокация", "История заказов"],
    risk: "low",
    riskExplanation:
      "Контактные и поведенческие данные. Минимальный финансовый риск, но раскрывает образ жизни и адреса.",
    status: "active",
    grantedAt: daysAgo(45),
  },
];

const DEMO_HISTORY: HistoryEvent[] = DEMO_SERVICES.map((s) => ({
  id: `seed-${s.id}`,
  serviceId: s.id,
  serviceName: s.name,
  serviceIcon: s.icon,
  action: "granted" as HistoryAction,
  timestamp: s.grantedAt,
  dataPoints: s.dataPoints,
}));

// ---------- Store ----------
interface State {
  services: ConsentService[];
  history: HistoryEvent[];
}

let state: State = { services: [], history: [] };
let initialized = false;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function loadFromStorage(): State {
  if (!isBrowser()) return { services: [], history: [] };
  try {
    const sRaw = localStorage.getItem(SERVICES_KEY);
    const hRaw = localStorage.getItem(HISTORY_KEY);
    const services: ConsentService[] = sRaw ? JSON.parse(sRaw) : [];
    const history: HistoryEvent[] = hRaw ? JSON.parse(hRaw) : [];
    if (services.length === 0) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(DEMO_SERVICES));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(DEMO_HISTORY));
      return { services: DEMO_SERVICES, history: DEMO_HISTORY };
    }
    return { services, history };
  } catch (e) {
    console.error("[consent-os] failed to load storage", e);
    return { services: DEMO_SERVICES, history: DEMO_HISTORY };
  }
}

function persist() {
  if (!isBrowser()) return;
  localStorage.setItem(SERVICES_KEY, JSON.stringify(state.services));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
}

function emit() {
  for (const l of listeners) l();
}

function ensureInit() {
  if (initialized || !isBrowser()) return;
  state = loadFromStorage();
  initialized = true;
}

function subscribe(listener: () => void) {
  ensureInit();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: State = { services: [], history: [] };
function getSnapshot(): State {
  ensureInit();
  return state;
}
function getServerSnapshot(): State {
  return EMPTY;
}

// ---------- Mock webhook (simulates real API integration) ----------
async function sendWebhook(service: ConsentService, action: HistoryAction) {
  const payload = {
    service: service.id,
    serviceName: service.name,
    action,
    timestamp: new Date().toISOString(),
  };
  try {
    // Демонстрация: реальный POST на mock-эндпоинт
    await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(`[Consent OS] Webhook отправлен в ${service.name}`, payload);
  } catch (e) {
    // Не блокируем UX, если httpbin недоступен — продакшен будет иметь свой webhook bus
    console.warn(`[Consent OS] Webhook к ${service.name} не доставлен (демо)`, e);
  }
}

// ---------- Actions ----------
export async function revokeService(id: string): Promise<ConsentService | null> {
  ensureInit();
  const svc = state.services.find((s) => s.id === id);
  if (!svc) return null;
  await sendWebhook(svc, "revoked");
  const ts = new Date().toISOString();
  state = {
    services: state.services.map((s) =>
      s.id === id ? { ...s, status: "revoked", revokedAt: ts } : s,
    ),
    history: [
      {
        id: `evt-${ts}-${id}`,
        serviceId: svc.id,
        serviceName: svc.name,
        serviceIcon: svc.icon,
        action: "revoked",
        timestamp: ts,
        dataPoints: svc.dataPoints,
      },
      ...state.history,
    ],
  };
  persist();
  emit();
  return state.services.find((s) => s.id === id) ?? null;
}

export async function restoreService(id: string): Promise<ConsentService | null> {
  ensureInit();
  const svc = state.services.find((s) => s.id === id);
  if (!svc) return null;
  await sendWebhook(svc, "restored");
  const ts = new Date().toISOString();
  state = {
    services: state.services.map((s) =>
      s.id === id ? { ...s, status: "active", revokedAt: undefined, grantedAt: ts } : s,
    ),
    history: [
      {
        id: `evt-${ts}-${id}`,
        serviceId: svc.id,
        serviceName: svc.name,
        serviceIcon: svc.icon,
        action: "restored",
        timestamp: ts,
        dataPoints: svc.dataPoints,
      },
      ...state.history,
    ],
  };
  persist();
  emit();
  return state.services.find((s) => s.id === id) ?? null;
}

export function resetDemo() {
  if (!isBrowser()) return;
  localStorage.removeItem(SERVICES_KEY);
  localStorage.removeItem(HISTORY_KEY);
  state = loadFromStorage();
  emit();
}

// ---------- Hook ----------
export function useConsentStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Force re-init on mount in case SSR returned EMPTY
  useEffect(() => {
    if (!initialized) {
      ensureInit();
      emit();
    }
  }, []);
  return snap;
}
