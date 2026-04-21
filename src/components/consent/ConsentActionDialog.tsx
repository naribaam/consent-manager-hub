import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import type { ConsentService } from "@/lib/consent-types";

export function ConsentActionDialog({
  open,
  onOpenChange,
  service,
  mode,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: ConsentService;
  mode: "revoke" | "restore";
  pending: boolean;
  onConfirm: () => void;
}) {
  const isRevoke = mode === "revoke";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-2xl">
            {service.icon}
          </div>
          <DialogTitle className="text-base">
            {isRevoke ? "Отозвать всё у" : "Восстановить доступ"} «{service.name}»?
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isRevoke
              ? "Сервис получит webhook и обязан прекратить обработку всех ваших данных."
              : "Сервис снова сможет запрашивать перечисленные категории данных."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex gap-3 rounded-xl border p-3 ${
            isRevoke
              ? "border-risk-high/30 bg-risk-high-bg/50"
              : "border-risk-low/30 bg-risk-low-bg/50"
          }`}
        >
          {isRevoke ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-risk-high" />
          ) : (
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-risk-low" />
          )}
          <p className="text-xs text-muted-foreground">
            {isRevoke
              ? "Действие можно откатить в течение 30 дней через журнал."
              : "Все категории данных будут возобновлены."}
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Затронутые данные
          </p>
          <div className="flex flex-wrap gap-1">
            {service.dataPoints.map((d) => (
              <span
                key={d.id}
                className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="flex-1 rounded-xl border bg-background py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 ${
              isRevoke
                ? "bg-gradient-to-r from-risk-high to-[oklch(0.55_0.22_15)]"
                : "bg-gradient-to-r from-primary to-[oklch(0.55_0.24_310)]"
            }`}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRevoke ? "Отозвать" : "Восстановить"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
