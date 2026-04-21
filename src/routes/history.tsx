import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useConsentStore } from "@/lib/consent-store";
import { CheckCircle2, ShieldOff, RotateCcw, Clock } from "lucide-react";
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
      { property: "og:title", content: "История согласий — Consent OS" },
      {
        property: "og:description",
        content: "Хронология всех изменений ваших согласий.",
      },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { id: "all" | HistoryAction; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "granted", label: "Выдачи" },
  { id: "revoked", label: "Отзывы" },
  { id: "restored", label: "Восстановления" },
];

const ACTION_META: Record<
  HistoryAction,
  { label: string; icon: React.ReactNode; bg: string; text: string }
> = {
  granted: {
    label: "Согласие выдано",
    icon: <CheckCircle2 className="h-4 w-4" />,
    bg: "bg-risk-low-bg",
    text: "text-risk-low",
  },
  revoked: {
    label: "Доступ отозван",
    icon: <ShieldOff className="h-4 w-4" />,
    bg: "bg-risk-high-bg",
    text: "text-risk-high",
  },
  restored: {
    label: "Доступ восстановлен",
    icon: <RotateCcw className="h-4 w-4" />,
    bg: "bg-accent",
    text: "text-accent-foreground",
  },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const { history } = useConsentStore();
  const [filter, setFilter] = useState<"all" | HistoryAction>("all");

  const items = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return filter === "all" ? sorted : sorted.filter((i) => i.action === filter);
  }, [history, filter]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">История согласий</h1>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">
        Полная хронология действий с вашими согласиями. В продакшене этот лог будет неизменяемым и
        юридически значимым.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          <Clock className="mx-auto mb-2 h-6 w-6 opacity-50" />
          Пока нет событий по выбранному фильтру.
        </div>
      ) : (
        <ol className="mt-8 relative border-l border-border pl-6">
          {items.map((evt) => {
            const meta = ACTION_META[evt.action];
            return (
              <li key={evt.id} className="relative pb-8 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[34px] top-0 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background",
                    meta.bg,
                    meta.text,
                  )}
                >
                  {meta.icon}
                </span>
                <div className="rounded-xl border bg-card p-4 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        {evt.serviceIcon}
                      </span>
                      <p className="font-medium">{evt.serviceName}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          meta.bg,
                          meta.text,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <time className="text-xs text-muted-foreground">{fmt(evt.timestamp)}</time>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {evt.dataPoints.map((d) => (
                      <span
                        key={d}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
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
    </main>
  );
}
