import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-2xl">
            {service.icon}
          </div>
          <DialogTitle>
            {isRevoke ? "Отозвать доступ" : "Восстановить доступ"} — {service.name}?
          </DialogTitle>
          <DialogDescription>
            {isRevoke
              ? "Подтвердите действие. Сервис получит уведомление и должен прекратить обработку ваших данных."
              : "Сервис снова сможет запрашивать ваши данные согласно списку ниже."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={`flex gap-3 rounded-xl border p-3.5 ${
            isRevoke
              ? "border-risk-high/30 bg-risk-high-bg/50"
              : "border-risk-low/30 bg-risk-low-bg/50"
          }`}
        >
          {isRevoke ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-risk-high" />
          ) : (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-risk-low" />
          )}
          <div className="text-sm">
            <p className="font-medium text-foreground">Последствия</p>
            <p className="mt-1 text-muted-foreground">
              {isRevoke
                ? "Сервис больше не сможет видеть ваши данные. Действие можно откатить в течение 30 дней."
                : "Сервис снова получит доступ к перечисленным категориям данных."}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Затронутые данные
          </p>
          <div className="flex flex-wrap gap-1.5">
            {service.dataPoints.map((d) => (
              <span
                key={d}
                className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Отмена
          </Button>
          <Button
            variant={isRevoke ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRevoke ? "Подтвердить отзыв" : "Восстановить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
