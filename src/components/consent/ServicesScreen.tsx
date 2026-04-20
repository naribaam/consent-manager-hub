import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchUserServices, revokeServiceConsent, restoreServiceConsent, toggleDataPoint } from "@/lib/consent-api";
import type { ServiceWithConsent } from "@/lib/db-types";
import { Search, ChevronDown, ShieldOff, ShieldCheck, RotateCcw, X, Loader as Loader2, TriangleAlert as AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RISK_LABEL: Record<string, string> = { low: "Низкий", medium: "Средний", high: "Высокий" };
const RISK_CLASS: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};
const RISK_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

export function ServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<ServiceWithConsent | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchUserServices(user.id);
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const filtered = useMemo(() => {
    if (!query.trim()) return services;
    const q = query.toLowerCase();
    return services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [services, query]);

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter((s) => s.consent?.status === "active").length,
    revoked: services.filter((s) => s.consent?.status === "revoked").length,
  }), [services]);

  const handleRevokeAll = async (svc: ServiceWithConsent) => {
    if (!user) return;
    setActionPending(svc.id);
    const labels = svc.dataPoints.map((dp) => dp.label);
    try {
      if (svc.consent?.status === "active") {
        await revokeServiceConsent(user.id, svc.id, svc.name, svc.icon, labels);
        toast.success(`Доступ для «${svc.name}» отозван`);
      } else {
        await restoreServiceConsent(user.id, svc.id, svc.name, svc.icon, labels);
        toast.success(`Доступ для «${svc.name}» восстановлен`);
      }
      await load();
      setExpanded(null);
    } catch {
      toast.error("Не удалось выполнить действие");
    } finally {
      setActionPending(null);
      setConfirmRevoke(null);
    }
  };

  const handleToggleDP = async (svc: ServiceWithConsent, dpId: string, dpLabel: string, currentStatus: "active" | "revoked") => {
    if (!user || svc.consent?.status === "revoked") return;
    setActionPending(`${svc.id}-${dpId}`);
    try {
      await toggleDataPoint(user.id, svc.id, svc.name, svc.icon, dpId, dpLabel, currentStatus);
      toast.success(currentStatus === "active" ? `«${dpLabel}» — доступ ограничен` : `«${dpLabel}» — доступ восстановлен`);
      await load();
    } catch {
      toast.error("Ошибка при изменении доступа");
    } finally {
      setActionPending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pb-5 pt-4 text-primary-foreground">
        <p className="text-lg font-bold">Мои сервисы</p>
        <div className="mt-3 flex gap-2">
          <StatPill label="Всего" value={stats.total} />
          <StatPill label="Активных" value={stats.active} accent />
          <StatPill label="Отозвано" value={stats.revoked} muted />
        </div>
        {/* Search */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2">
          <Search className="h-4 w-4 text-primary-foreground/70 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск сервисов..."
            className="flex-1 bg-transparent text-sm text-primary-foreground placeholder-primary-foreground/50 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="h-4 w-4 text-primary-foreground/70" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {filtered.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Ничего не найдено
          </div>
        )}
        {filtered.map((svc) => {
          const isRevoked = svc.consent?.status === "revoked";
          const isExpanded = expanded === svc.id;
          const isPending = actionPending === svc.id;

          return (
            <div
              key={svc.id}
              className={cn(
                "rounded-2xl border bg-card overflow-hidden transition-all duration-200",
                isRevoked && "opacity-60"
              )}
            >
              {/* Card header */}
              <button
                className="flex w-full items-center gap-3 p-3 text-left"
                onClick={() => setExpanded(isExpanded ? null : svc.id)}
              >
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl", isRevoked && "grayscale")}>
                  {svc.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{svc.name}</p>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", RISK_CLASS[svc.risk_level])}>
                      <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", RISK_DOT[svc.risk_level])} />
                      {RISK_LABEL[svc.risk_level]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{svc.category}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isRevoked ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {isRevoked ? "Отозван" : "Активен"}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </button>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t px-3 pb-3 pt-2">
                  <p className="mb-2 text-xs text-muted-foreground">{svc.description}</p>

                  {/* Data points */}
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Данные
                  </p>
                  <div className="space-y-1">
                    {svc.dataPoints.map((dp) => {
                      const dpc = svc.dataPointConsents.find((c) => c.data_point_id === dp.id);
                      const dpStatus = dpc?.status ?? "active";
                      const dpPending = actionPending === `${svc.id}-${dp.id}`;

                      return (
                        <div key={dp.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5">
                          <span className={cn("text-xs", dpStatus === "revoked" && "line-through text-muted-foreground")}>
                            {dp.label}
                          </span>
                          <button
                            onClick={() => handleToggleDP(svc, dp.id, dp.label, dpStatus as "active" | "revoked")}
                            disabled={isRevoked || dpPending}
                            className={cn(
                              "relative h-5 w-9 rounded-full transition-colors disabled:cursor-not-allowed",
                              dpStatus === "active" ? "bg-primary" : "bg-muted-foreground/30"
                            )}
                          >
                            {dpPending ? (
                              <Loader2 className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
                            ) : (
                              <span className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                dpStatus === "active" ? "translate-x-4" : "translate-x-0.5"
                              )} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => isRevoked ? handleRevokeAll(svc) : setConfirmRevoke(svc)}
                    disabled={isPending}
                    className={cn(
                      "mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
                      isRevoked
                        ? "bg-primary text-primary-foreground"
                        : "bg-red-50 text-red-600 border border-red-200"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isRevoked ? (
                      <><ShieldCheck className="h-3.5 w-3.5" /> Восстановить доступ</>
                    ) : (
                      <><ShieldOff className="h-3.5 w-3.5" /> Отозвать весь доступ</>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      {confirmRevoke && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setConfirmRevoke(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full rounded-t-3xl bg-background p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                {confirmRevoke.icon}
              </div>
              <div>
                <p className="font-semibold">Отозвать доступ?</p>
                <p className="text-sm text-muted-foreground">{confirmRevoke.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Сервис больше не сможет видеть ваши данные. Вы сможете восстановить доступ позже.</p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="flex-1 rounded-xl border py-3 text-sm font-medium text-foreground"
              >
                Отмена
              </button>
              <button
                onClick={() => handleRevokeAll(confirmRevoke)}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white"
              >
                Отозвать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, accent, muted }: { label: string; value: number; accent?: boolean; muted?: boolean }) {
  return (
    <div className={cn(
      "flex-1 rounded-xl px-2 py-1.5 text-center",
      accent ? "bg-white/20" : muted ? "bg-white/10" : "bg-white/15"
    )}>
      <p className="text-base font-bold text-primary-foreground">{value}</p>
      <p className="text-[10px] text-primary-foreground/70">{label}</p>
    </div>
  );
}
