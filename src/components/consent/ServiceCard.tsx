import { useState } from "react";
import { Loader2, ShieldOff, ShieldCheck, ChevronDown, Lock } from "lucide-react";
import type { ConsentService } from "@/lib/consent-types";
import { revokeService, restoreService, toggleField } from "@/lib/consent-store";
import { RiskBadge } from "./RiskBadge";
import { ConsentActionDialog } from "./ConsentActionDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * ServiceCard — карточка сервиса в виде "iOS-приложения":
 * акцентная цветная иконка, заголовок, аккордеон с пермишенами и кнопка отзыва.
 */
export function ServiceCard({ service }: { service: ConsentService }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const isRevoked = service.status === "revoked";
  const grantedCount = service.dataPoints.filter((d) => d.granted).length;
  const totalCount = service.dataPoints.length;

  const handleConfirm = async () => {
    setPending(true);
    try {
      if (isRevoked) {
        await restoreService(service.id);
        toast.success(`Доступ для «${service.name}» восстановлен`);
      } else {
        await revokeService(service.id);
        toast.success(`Доступ для «${service.name}» отозван`);
      }
      setOpen(false);
    } catch (e) {
      toast.error("Не удалось выполнить действие");
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  const handleToggleField = async (fieldId: string, label: string, willGrant: boolean) => {
    setPendingField(fieldId);
    try {
      await toggleField(service.id, fieldId);
      toast.success(willGrant ? `Поле «${label}» возобновлено` : `Поле «${label}» отозвано`);
    } catch {
      toast.error("Ошибка");
    } finally {
      setPendingField(null);
    }
  };

  return (
    <>
      <article
        className={cn(
          "overflow-hidden rounded-2xl border bg-card transition-all",
          isRevoked && "opacity-60",
        )}
      >
        {/* Шапка карточки с цветной плашкой иконки */}
        <header className="flex items-start gap-3 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
            style={{
              background: `linear-gradient(135deg, oklch(${service.accent} / 0.18), oklch(${service.accent} / 0.06))`,
            }}
            aria-hidden
          >
            {service.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold leading-tight">
                  {service.name}
                </h3>
                <p className="text-[11px] text-muted-foreground">{service.category}</p>
              </div>
              <RiskBadge level={service.risk} explanation={service.riskExplanation} />
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {service.description}
            </p>
          </div>
        </header>

        {/* Сводка пермишенов */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between border-t bg-secondary/40 px-4 py-2.5 text-left text-xs transition-colors hover:bg-secondary"
        >
          <span className="font-medium">
            {isRevoked
              ? "Все доступы отозваны"
              : `${grantedCount} из ${totalCount} доступов активны`}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        {/* Список пермишенов с переключателями */}
        {expanded && (
          <div className="space-y-1 border-t bg-card px-2 py-2">
            {service.dataPoints.map((field) => {
              const disabled =
                isRevoked || (field.required && field.granted) || pendingField === field.id;
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {field.required && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
                    <span
                      className={cn(
                        "truncate text-xs",
                        !field.granted && "text-muted-foreground line-through",
                      )}
                    >
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase text-muted-foreground">
                        обязат.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.granted}
                    disabled={disabled}
                    onClick={() =>
                      handleToggleField(field.id, field.label, !field.granted)
                    }
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
                      field.granted
                        ? "bg-gradient-to-r from-primary to-[oklch(0.6_0.22_300)]"
                        : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                        field.granted ? "translate-x-[22px]" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Футер */}
        <footer className="flex items-center justify-between gap-2 border-t bg-card px-4 py-3">
          <span className="text-[11px] text-muted-foreground">
            {isRevoked && service.revokedAt
              ? `Отозван ${fmtDate(service.revokedAt)}`
              : `С ${fmtDate(service.grantedAt)}`}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              isRevoked
                ? "bg-secondary text-foreground hover:bg-secondary/70"
                : "bg-risk-high-bg text-risk-high hover:bg-risk-high/15",
            )}
          >
            {isRevoked ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> Восстановить
              </>
            ) : (
              <>
                <ShieldOff className="h-3.5 w-3.5" /> Отозвать всё
              </>
            )}
          </button>
        </footer>

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </article>

      <ConsentActionDialog
        open={open}
        onOpenChange={setOpen}
        service={service}
        mode={isRevoked ? "restore" : "revoke"}
        pending={pending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
