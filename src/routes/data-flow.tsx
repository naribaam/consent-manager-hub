import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/data-flow")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  component: () => null,
});

const RISK_STROKE: Record<RiskLevel, string> = {
  low: "var(--risk-low)",
  medium: "var(--risk-medium)",
  high: "var(--risk-high)",
};

function DataFlowPage() {
  const { services } = useConsentStore();

  // Layout on a circle around the center
  const W = 720;
  const H = 520;
  const CX = W / 2;
  const CY = H / 2;
  const R = 200;

  const positioned = services.map((s, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / Math.max(services.length, 1);
    const x = CX + Math.cos(angle) * R;
    const y = CY + Math.sin(angle) * R;
    return { service: s, x, y };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Потоки данных</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
        Куда уходят ваши данные. Цвет линии — уровень риска. Пунктирная линия — доступ отозван.
        Наведите курсор на стрелку, чтобы увидеть, какие категории данных передаются.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card p-4 shadow-soft md:p-6">
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
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={RISK_STROKE[r]} />
                </marker>
              ))}
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
                      strokeWidth={revoked ? 1.5 : 2.5}
                      strokeDasharray={revoked ? "6 6" : undefined}
                      opacity={revoked ? 0.4 : 0.85}
                      markerEnd={revoked ? undefined : `url(#arrow-${service.risk})`}
                      className="cursor-pointer transition-opacity hover:opacity-100"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">
                      {service.icon} {service.name}
                    </p>
                    <p className="mt-1 text-xs opacity-80">
                      {revoked ? "Доступ отозван" : `Передаётся: ${service.dataPoints.join(", ")}`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Center node "Вы" */}
            <circle cx={CX} cy={CY} r={44} fill="var(--primary)" />
            <circle cx={CX} cy={CY} r={54} fill="none" stroke="var(--primary)" opacity={0.2} strokeWidth={2} />
            <text
              x={CX}
              y={CY + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="var(--primary-foreground)"
            >
              Вы
            </text>
          </svg>

          {/* Center icon overlay */}
          <div
            className="pointer-events-none absolute"
            style={{ left: `${(CX / W) * 100}%`, top: `${(CY / H) * 100}%`, transform: "translate(-50%, -130%)" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>

          {/* Service nodes */}
          {positioned.map(({ service, x, y }) => (
            <ServiceNode
              key={service.id}
              service={service}
              style={{
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
              }}
            />
          ))}
        </div>

        <Legend />
      </div>
    </main>
  );
}

function ServiceNode({
  service,
  style,
}: {
  service: ConsentService;
  style: React.CSSProperties;
}) {
  const revoked = service.status === "revoked";
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ ...style, transform: "translate(-50%, -50%)" }}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-2xl shadow-soft ${
          revoked ? "opacity-50 grayscale" : ""
        }`}
      >
        {service.icon}
      </div>
      <p className="mt-1 max-w-[110px] truncate text-center text-xs font-medium">
        {service.name}
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
      <LegendItem color="var(--risk-low)" label="Низкий риск" />
      <LegendItem color="var(--risk-medium)" label="Средний риск" />
      <LegendItem color="var(--risk-high)" label="Высокий риск" />
      <span className="ml-auto flex items-center gap-2">
        <svg width="32" height="6">
          <line x1="0" y1="3" x2="32" y2="3" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
        Доступ отозван
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-0.5 w-6" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
