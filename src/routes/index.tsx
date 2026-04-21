import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useUserData, useSession } from "@/lib/consent-store";
import { ServiceCard } from "@/components/consent/ServiceCard";
import { Search, ShieldCheck, AlertTriangle, X } from "lucide-react";
import type { RiskLevel } from "@/lib/consent-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мои сервисы — Consent OS" },
      {
        name: "description",
        content:
          "Список сервисов с доступом к вашим персональным данным. Управляйте согласиями в один клик.",
      },
    ],
  }),
  component: Dashboard,
});

const RISK_WEIGHT: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "revoked", label: "Отозванные" },
  { id: "high", label: "🔴 Риск" },
] as const;

function Dashboard() {
  const { user } = useSession();
  const { services } = useUserData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const stats = useMemo(() => {
    const active = services.filter((s) => s.status === "active");
    const avg =
      active.length === 0
        ? 0
        : active.reduce((acc, s) => acc + RISK_WEIGHT[s.risk], 0) / active.length;
    const portfolioRisk =
      avg >= 2.34 ? "Высокий" : avg >= 1.67 ? "Средний" : avg > 0 ? "Низкий" : "—";
    const totalFields = active.reduce((acc, s) => acc + s.dataPoints.filter((p) => p.granted).length, 0);
    return { active: active.length, total: services.length, portfolioRisk, totalFields };
  }, [services]);

  const filtered = useMemo(() => {
    let list = services;
    if (filter === "active") list = list.filter((s) => s.status === "active");
    if (filter === "revoked") list = list.filter((s) => s.status === "revoked");
    if (filter === "high") list = list.filter((s) => s.risk === "high");
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.dataPoints.some((p) => p.label.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [services, filter, query]);

  return (
    <div className="px-4 pb-6">
      {/* Greeting */}
      <header className="pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Привет, {user?.name ?? "гость"}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">
          Ваши согласия
        </h1>
      </header>

      {/* Стат-плитки в две колонки */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatTile
          label="Активные"
          value={stats.active}
          sub={`из ${stats.total}`}
          icon={<ShieldCheck className="h-4 w-4 text-risk-low" />}
          tint="from-emerald-50 to-transparent"
        />
        <StatTile
          label="Риск портфеля"
          value={stats.portfolioRisk}
          sub={`${stats.totalFields} полей данных`}
          icon={<AlertTriangle className="h-4 w-4 text-risk-medium" />}
          tint="from-amber-50 to-transparent"
        />
      </div>

      {/* Поиск */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border bg-secondary/60 px-3.5 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти сервис, категорию, данные…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Очистить">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Список */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
          Ничего не найдено
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
  tint,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3.5", tint)}>
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
