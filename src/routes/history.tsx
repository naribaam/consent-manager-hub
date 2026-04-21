import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useUserData } from "@/lib/consent-store";
import { CheckCircle2, ShieldOff, RotateCcw, Clock, Minus, Plus } from "lucide-react";
import type { HistoryAction } from "@/lib/consent-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "История согласий — Consent OS" },
      {
        name: "description",
        content: "Хронология выдачи и отзыва согласий на обработку персональных данных.",
      },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { id: "all" | HistoryAction; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "granted", label: "Выдачи" },
  { id: "revoked", label: "Отзывы" },
  { id: "field_revoked", label: "Отзыв поля" },
];

const ACTION_META: Record<
  HistoryAction,
  { label: string; icon: React.ReactNode; bg: string; text: string }
> = {
  granted: {
    label: "Согласие выдано",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "bg-risk-low-bg",
    text: "text-risk-low",
  },
  revoked: {
    label: "Доступ отозван",
    icon: <ShieldOff className="h-3.5 w-3.5" />,
    bg: "bg-risk-high-bg",
    text: "text-risk-high",
  },
  restored: {
    label: "Доступ восстановлен",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    bg: "bg-accent",
    text: "text-accent-foreground",
  },
  field_revoked: {
    label: "Поле отозвано",
    icon: <Minus className="h-3.5 w-3.5" />,
    bg: "bg-risk-medium-bg",
    text: "text-risk-medium",
  },
  field_restored: {
    label: "Поле возобновлено",
    icon: <Plus className="h-3.5 w-3.5" />,
    bg: "bg-risk-low-bg",
    text: "text-risk-low",
  },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const { history } = useUserData();
  const [filter, setFilter] = useState<"all" | HistoryAction>("all");

  const items = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return filter === "all" ? sorted : sorted.filter((i) => i.action === filter);
  }, [history, filter]);

  return (
    <div className="px-4 pb-6">
      <header className="pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Журнал
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">
          История согласий
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          В продакшене — юридически значимый неизменяемый лог.
        </p>
      </header>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
          <Clock className="mx-auto mb-2 h-5 w-5 opacity-50" />
          Пока нет событий
        </div>
      ) : (
        <ol className="mt-5 relative border-l border-border pl-5">
          {items.map((evt) => {
            const meta = ACTION_META[evt.action];
            return (
              <li key={evt.id} className="relative pb-5 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background",
                    meta.bg,
                    meta.text,
                  )}
                >
                  {meta.icon}
                </span>
                <div className="rounded-xl border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="text-base" aria-hidden>
                        {evt.serviceIcon}
                      </span>
                      <p className="truncate text-sm font-semibold">{evt.serviceName}</p>
                    </div>
                    <time className="shrink-0 text-[10px] text-muted-foreground">
                      {fmt(evt.timestamp)}
                    </time>
                  </div>
                  <p className={cn("mt-1.5 text-[11px] font-medium", meta.text)}>
                    {meta.label}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {evt.dataPoints.map((d) => (
                      <span
                        key={d}
                        className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
