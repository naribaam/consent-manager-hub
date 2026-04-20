import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchHistory } from "@/lib/consent-api";
import type { ConsentHistory, HistoryAction } from "@/lib/db-types";
import { CircleCheck as CheckCircle2, ShieldOff, RotateCcw, Clock, EyeOff, Eye, Loader as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | HistoryAction; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "granted", label: "Выдачи" },
  { id: "revoked", label: "Отзывы" },
  { id: "restored", label: "Восстановлены" },
];

const ACTION_META: Record<HistoryAction, { label: string; icon: React.ReactNode; cls: string }> = {
  granted:              { label: "Выдан",           icon: <CheckCircle2 className="h-4 w-4" />, cls: "bg-emerald-100 text-emerald-700" },
  revoked:              { label: "Отозван",          icon: <ShieldOff className="h-4 w-4" />,    cls: "bg-red-100 text-red-600" },
  restored:             { label: "Восстановлен",     icon: <RotateCcw className="h-4 w-4" />,    cls: "bg-blue-100 text-blue-700" },
  data_point_revoked:   { label: "Данные скрыты",    icon: <EyeOff className="h-4 w-4" />,       cls: "bg-amber-100 text-amber-700" },
  data_point_restored:  { label: "Данные открыты",   icon: <Eye className="h-4 w-4" />,          cls: "bg-teal-100 text-teal-700" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function HistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ConsentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | HistoryAction>("all");

  useEffect(() => {
    if (!user) return;
    fetchHistory(user.id).then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, [user?.id]);

  const items = useMemo(() => {
    return filter === "all" ? history : history.filter((i) => i.action === filter);
  }, [history, filter]);

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
      <div className="bg-primary px-4 pb-4 pt-4 text-primary-foreground">
        <p className="text-lg font-bold">История</p>
        <p className="mt-0.5 text-xs text-primary-foreground/70">Хронология всех изменений</p>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">Нет событий</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-3 pl-4 space-y-3">
            {items.map((evt) => {
              const meta = ACTION_META[evt.action] ?? ACTION_META.granted;
              return (
                <div key={evt.id} className="relative">
                  <div className={cn(
                    "absolute -left-[29px] top-2 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-background",
                    meta.cls
                  )}>
                    {meta.icon}
                  </div>
                  <div className="rounded-xl border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{evt.service_icon}</span>
                        <div>
                          <p className="text-xs font-semibold">{evt.service_name}</p>
                          <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5", meta.cls)}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                      <time className="shrink-0 text-[10px] text-muted-foreground">{fmt(evt.timestamp)}</time>
                    </div>
                    {evt.data_points.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {evt.data_points.slice(0, 4).map((d) => (
                          <span key={d} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{d}</span>
                        ))}
                        {evt.data_points.length > 4 && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{evt.data_points.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
