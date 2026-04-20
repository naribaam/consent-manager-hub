import { supabase } from "./supabase";
import type { ServiceWithConsent, ConsentHistory } from "./db-types";

export async function fetchUserServices(userId: string): Promise<ServiceWithConsent[]> {
  const [{ data: consents }, { data: services }, { data: dataPoints }, { data: dpConsents }] =
    await Promise.all([
      supabase.from("user_consents").select("*").eq("user_id", userId),
      supabase.from("services").select("*").order("name"),
      supabase.from("service_data_points").select("*").order("sort_order"),
      supabase.from("consent_data_points").select("*").eq("user_id", userId),
    ]);

  if (!services) return [];

  // Only return services the user has a consent for
  const consentMap = new Map((consents ?? []).map((c) => [c.service_id, c]));
  const userServiceIds = new Set(consentMap.keys());

  return services
    .filter((s) => userServiceIds.has(s.id))
    .map((s) => ({
      ...s,
      consent: consentMap.get(s.id) ?? null,
      dataPoints: (dataPoints ?? []).filter((dp) => dp.service_id === s.id),
      dataPointConsents: (dpConsents ?? []).filter((dpc) => dpc.service_id === s.id),
    }));
}

export async function fetchHistory(userId: string): Promise<ConsentHistory[]> {
  const { data } = await supabase
    .from("consent_history")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });
  return data ?? [];
}

export async function revokeServiceConsent(userId: string, serviceId: string, serviceName: string, serviceIcon: string, dataPointLabels: string[]) {
  const now = new Date().toISOString();

  await supabase.from("user_consents").update({ status: "revoked", revoked_at: now }).eq("user_id", userId).eq("service_id", serviceId);

  await supabase.from("consent_data_points").update({ status: "revoked", updated_at: now }).eq("user_id", userId).eq("service_id", serviceId);

  await supabase.from("consent_history").insert({
    user_id: userId,
    service_id: serviceId,
    service_name: serviceName,
    service_icon: serviceIcon,
    action: "revoked",
    data_points: dataPointLabels,
    timestamp: now,
  });

  // Fire webhook
  fetch("https://httpbin.org/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: serviceId, action: "revoke", timestamp: now }),
  }).then(() => console.log(`[Consent OS] Webhook -> ${serviceName}`)).catch(() => {});
}

export async function restoreServiceConsent(userId: string, serviceId: string, serviceName: string, serviceIcon: string, dataPointLabels: string[]) {
  const now = new Date().toISOString();

  await supabase.from("user_consents").update({ status: "active", revoked_at: null, granted_at: now }).eq("user_id", userId).eq("service_id", serviceId);

  await supabase.from("consent_data_points").update({ status: "active", updated_at: now }).eq("user_id", userId).eq("service_id", serviceId);

  await supabase.from("consent_history").insert({
    user_id: userId,
    service_id: serviceId,
    service_name: serviceName,
    service_icon: serviceIcon,
    action: "restored",
    data_points: dataPointLabels,
    timestamp: now,
  });

  fetch("https://httpbin.org/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: serviceId, action: "restore", timestamp: now }),
  }).then(() => console.log(`[Consent OS] Webhook -> ${serviceName}`)).catch(() => {});
}

export async function toggleDataPoint(
  userId: string,
  serviceId: string,
  serviceName: string,
  serviceIcon: string,
  dataPointId: string,
  dataPointLabel: string,
  currentStatus: "active" | "revoked"
) {
  const newStatus = currentStatus === "active" ? "revoked" : "active";
  const now = new Date().toISOString();

  await supabase
    .from("consent_data_points")
    .update({ status: newStatus, updated_at: now })
    .eq("user_id", userId)
    .eq("data_point_id", dataPointId);

  await supabase.from("consent_history").insert({
    user_id: userId,
    service_id: serviceId,
    service_name: serviceName,
    service_icon: serviceIcon,
    action: newStatus === "revoked" ? "data_point_revoked" : "data_point_restored",
    data_points: [dataPointLabel],
    timestamp: now,
  });
}
