export type RiskLevel = "low" | "medium" | "high";
export type ConsentStatus = "active" | "revoked";
export type HistoryAction = "granted" | "revoked" | "restored" | "data_point_revoked" | "data_point_restored";

export interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  risk_level: RiskLevel;
  risk_explanation: string;
}

export interface ServiceDataPoint {
  id: string;
  service_id: string;
  label: string;
  description: string;
  sort_order: number;
}

export interface UserConsent {
  id: string;
  user_id: string;
  service_id: string;
  status: ConsentStatus;
  granted_at: string;
  revoked_at?: string;
}

export interface ConsentDataPoint {
  id: string;
  user_id: string;
  service_id: string;
  data_point_id: string;
  status: ConsentStatus;
  updated_at: string;
}

export interface ConsentHistory {
  id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  service_icon: string;
  action: HistoryAction;
  data_points: string[];
  timestamp: string;
}

// Enriched service with user consent state
export interface ServiceWithConsent extends Service {
  consent: UserConsent | null;
  dataPoints: ServiceDataPoint[];
  dataPointConsents: ConsentDataPoint[];
}
