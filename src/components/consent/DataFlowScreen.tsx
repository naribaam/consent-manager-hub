import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchUserServices } from "@/lib/consent-api";
import type { ServiceWithConsent } from "@/lib/db-types";
import { Loader as Loader2 } from "lucide-react";

const RISK_COLOR: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function DataFlowScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchUserServices(user.id).then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const W = 320;
  const H = 360;
  const CX = W / 2;
  const CY = H / 2;
  const R = 120;
  const count = services.length;

  const positioned = services.map((s, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(count, 1);
    return { service: s, x: CX + Math.cos(angle) * R, y: CY + Math.sin(angle) * R };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="bg-primary px-4 pb-4 pt-4 text-primary-foreground">
        <p className="text-lg font-bold">Потоки данных</p>
        <p className="mt-0.5 text-xs text-primary-foreground/70">Куда уходят ваши данные</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative mx-auto" style={{ width: W, height: H }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
            <defs>
              {["low","medium","high"].map((r) => (
                <marker key={r} id={`df-arrow-${r}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={RISK_COLOR[r]} />
                </marker>
              ))}
            </defs>
            {positioned.map(({ service, x, y }) => {
              const revoked = service.consent?.status === "revoked";
              const color = RISK_COLOR[service.risk_level];
              const isHov = hovered === service.id;
              return (
                <line
                  key={service.id}
                  x1={CX} y1={CY} x2={x} y2={y}
                  stroke={color}
                  strokeWidth={isHov ? 3 : revoked ? 1.5 : 2}
                  strokeDasharray={revoked ? "5 5" : undefined}
                  opacity={revoked ? 0.35 : isHov ? 1 : 0.7}
                  markerEnd={!revoked ? `url(#df-arrow-${service.risk_level})` : undefined}
                />
              );
            })}
            {/* Center node */}
            <circle cx={CX} cy={CY} r={28} fill="var(--primary)" />
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">Вы</text>
          </svg>

          {/* Service nodes */}
          {positioned.map(({ service, x, y }) => {
            const revoked = service.consent?.status === "revoked";
            return (
              <div
                key={service.id}
                className="absolute flex flex-col items-center cursor-pointer"
                style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                onMouseEnter={() => setHovered(service.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-card text-lg shadow-sm transition-transform ${hovered === service.id ? "scale-110" : ""} ${revoked ? "opacity-40 grayscale" : ""}`}>
                  {service.icon}
                </div>
                <p className="mt-0.5 max-w-[60px] truncate text-center text-[9px] font-medium leading-tight">
                  {service.name.split(" ")[0]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hovered detail */}
        {hovered && (() => {
          const svc = services.find((s) => s.id === hovered);
          if (!svc) return null;
          return (
            <div className="mx-3 mb-3 rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{svc.icon}</span>
                <p className="font-semibold text-sm">{svc.name}</p>
                <span className={`ml-auto text-[10px] font-medium rounded-full px-2 py-0.5 ${svc.consent?.status === "revoked" ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700"}`}>
                  {svc.consent?.status === "revoked" ? "Отозван" : "Активен"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {svc.dataPoints.map((dp) => (
                  <span key={dp.id} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{dp.label}</span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="mx-3 mb-3 flex flex-wrap gap-3 rounded-xl bg-muted/40 p-3">
          {["low","medium","high"].map((r) => (
            <div key={r} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="h-2 w-6 rounded-full" style={{ backgroundColor: RISK_COLOR[r] }} />
              {r === "low" ? "Низкий" : r === "medium" ? "Средний" : "Высокий"} риск
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" /></svg>
            Отозван
          </div>
        </div>
      </div>
    </div>
  );
}
