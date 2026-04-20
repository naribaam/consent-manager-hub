export type RiskLevel = "low" | "medium" | "high";
export type ServiceStatus = "active" | "revoked";

export interface ConsentService {
  id: string;
  name: string;
  icon: string; // emoji
  category: string;
  description: string;
  dataPoints: string[];
  risk: RiskLevel;
  riskExplanation: string;
  status: ServiceStatus;
  grantedAt: string; // ISO
  revokedAt?: string;
}

export type HistoryAction = "granted" | "revoked" | "restored";

export interface HistoryEvent {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  action: HistoryAction;
  timestamp: string; // ISO
  dataPoints: string[];
}
