import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useConsentStore } from "@/lib/consent-store";
import { ServiceCard } from "@/components/consent/ServiceCard";
import { AboutPrototype } from "@/components/consent/AboutPrototype";
import { ShieldCheck, ShieldOff, Layers, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мои сервисы — Consent OS" },
      {
        name: "description",
        content:
          "Список сервисов с доступом к вашим персональным данным. Управляйте согласиями в один клик.",
      },
      { property: "og:title", content: "Мои сервисы — Consent OS" },
      {
        property: "og:description",
        content: "Список сервисов с доступом к вашим персональным данным.",
      },
    ],
  }),
  component: Dashboard,
});

const RISK_WEIGHT = { low: 1, medium: 2, high: 3 } as const;

function Dashboard() {
  const { services } = useConsentStore();

  const stats = useMemo(() => {
    const active = services.filter((s) => s.status === "active");
    const revoked = services.filter((s) => s.status === "revoked");
    const avg =
      active.length === 0
        ? 0
        : active.reduce((acc, s) => acc + RISK_WEIGHT[s.risk], 0) / active.length;
    const portfolioRisk =
      avg >= 2.34 ? "Высокий" : avg >= 1.67 ? "Средний" : avg > 0 ? "Низкий" : "—";
    return { total: services.length, active: active.length, revoked: revoked.length, portfolioRisk };
  }, [services]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Мои сервисы</h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Сервисы, которым вы дали согласие на обработку персональных данных. Отзывайте доступ в
          один клик — Consent OS уведомит оператора через защищённый webhook.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Layers className="h-4 w-4" />} label="Всего" value={stats.total} />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4 text-risk-low" />}
          label="Активных"
          value={stats.active}
        />
        <StatCard
          icon={<ShieldOff className="h-4 w-4 text-muted-foreground" />}
          label="Отозвано"
          value={stats.revoked}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4 text-risk-medium" />}
          label="Риск портфеля"
          value={stats.portfolioRisk}
        />
      </div>

      {services.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          Загрузка демо-данных…
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}

      <AboutPrototype />
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">{value}</p>
    </div>
  );
}
