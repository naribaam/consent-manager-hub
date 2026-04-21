export type RiskLevel = "low" | "medium" | "high";
export type ServiceStatus = "active" | "revoked";

export interface DataPoint {
  id: string;
  label: string;
  /** true = передаётся сейчас, false = пользователь отозвал именно этот пункт */
  granted: boolean;
  /** ключевой пункт — нельзя отозвать без отзыва всего сервиса (например, идентификатор аккаунта) */
  required?: boolean;
}

export interface ConsentService {
  id: string;
  name: string;
  icon: string; // emoji
  category: string;
  description: string;
  dataPoints: DataPoint[];
  risk: RiskLevel;
  riskExplanation: string;
  status: ServiceStatus;
  grantedAt: string; // ISO
  revokedAt?: string;
  /** цвет-акцент карточки (HSL/oklch token) — задаёт визуальную идентичность */
  accent: string;
}

export type HistoryAction =
  | "granted"
  | "revoked"
  | "restored"
  | "field_revoked"
  | "field_restored";

export interface HistoryEvent {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  action: HistoryAction;
  timestamp: string;
  /** для field_* — конкретное поле; для granted/revoked/restored — снимок всех полей */
  dataPoints: string[];
}

export interface User {
  id: string;
  email: string;
  /** demo-only, plain — это прототип, локальное хранилище */
  password: string;
  name: string;
}
