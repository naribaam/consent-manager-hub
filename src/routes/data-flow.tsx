import { createFileRoute } from "@tanstack/react-router";
import { useUserData, useSession } from "@/lib/consent-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ConsentService, RiskLevel } from "@/lib/consent-types";

export const Route = createFileRoute("/data-flow")({
  head: () => ({
    meta: [
      { title: "Карта данных — Consent OS" },
      {
        name: "description",
        content: "Визуализация того, какие сервисы получают ваши персональные данные.",
      },
    ],
  }),
  component: DataFlowPage,
});

const RISK_STROKE: Record<RiskLevel, string> = {
  low: "var(--risk-low)",
  medium: "var(--risk-medium)",
  high: "var(--risk-high)",
};

function DataFlowPage() {
  const { services } = useUserData();
  const { user } = useSession();

  // граф под мобильный экран
  const W = 360;
  const H = 360;
  const CX = W / 2;
  const CY = H / 2;
  const R = 130;

  const positioned = services.map((s, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(services.length, 1);
    const x = CX + Math.cos(angle) * R;
    const y = CY + Math.sin(angle) * R;
    return { service: s, x, y };
  });

  return (
    <div className="px-4 pb-6">
      <header className="pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Визуализация
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">
          Карта данных
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Куда уходят ваши данные. Цвет — риск, пунктир — отозванный доступ.
        </p>
      </header>

      <div className="mt-4 overflow-hidden rounded-2xl border bg-card p-3">
        <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Граф потоков данных"
          >
            <defs>
              {(["low", "medium", "high"] as RiskLevel[]).map((r) => (
                <marker
                  key={r}
                  id={`arrow-${r}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={RISK_STROKE[r]} />
                </marker>
              ))}
              <radialGradient id="centerGrad">
                <stop offset="0%" stopColor="oklch(0.6 0.24 285)" />
                <stop offset="100%" stopColor="oklch(0.4 0.22 285)" />
              </radialGradient>
            </defs>

            {positioned.map(({ service, x, y }) => {
              const revoked = service.status === "revoked";
              const stroke = RISK_STROKE[service.risk];
              return (
                <Tooltip key={service.id} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <line
                      x1={CX}
                      y1={CY}
                      x2={x}
                      y2={y}
                      stroke={stroke}
                      strokeWidth={revoked ? 1 : 2}
                      strokeDasharray={revoked ? "4 4" : undefined}
                      opacity={revoked ? 0.35 : 0.85}
                      markerEnd={revoked ? undefined : `url(#arrow-${service.risk})`}
                      className="cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p className="font-medium">
                      {service.icon} {service.name}
                    </p>
                    <p className="mt-1 text-[11px] opacity-80">
                      {revoked
                        ? "Доступ отозван"
                        : service.dataPoints
                            .filter((d) => d.granted)
                            .map((d) => d.label)
                            .join(", ")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Центр */}
            <circle cx={CX} cy={CY} r={32} fill="url(#centerGrad)" />
            <text
              x={CX}
              y={CY + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="white"
            >
              {user?.name ?? "Я"}
            </text>
          </svg>

          {positioned.map(({ service, x, y }) => (
            <ServiceNode
              key={service.id}
              service={service}
              style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
            />
          ))}
        </div>

        <Legend />
      </div>
    </div>
  );
}

function ServiceNode({ service, style }: { service: ConsentService; style: React.CSSProperties }) {
  const revoked = service.status === "revoked";
  return (
    <div className="absolute flex flex-col items-center" style={{ ...style, transform: "translate(-50%, -50%)" }}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-lg shadow-sm ${
          revoked ? "opacity-50 grayscale" : ""
        }`}
        style={
          !revoked
            ? { background: `linear-gradient(135deg, oklch(${service.accent} / 0.15), white)` }
            : undefined
        }
      >
        {service.icon}
      </div>
      <p className="mt-0.5 max-w-[60px] truncate text-center text-[9px] font-medium">
        {service.name}
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-[10px] text-muted-foreground">
      <LegendItem color="var(--risk-low)" label="Низкий" />
      <LegendItem color="var(--risk-medium)" label="Средний" />
      <LegendItem color="var(--risk-high)" label="Высокий" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-0.5 w-4" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
