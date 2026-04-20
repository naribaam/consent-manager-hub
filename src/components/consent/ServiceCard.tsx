import { useState } from "react";
import { Loader2, ShieldOff, ShieldCheck } from "lucide-react";
import type { ConsentService } from "@/lib/consent-types";
import { revokeService, restoreService } from "@/lib/consent-store";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "./RiskBadge";
import { ConsentActionDialog } from "./ConsentActionDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ServiceCard({ service }: { service: ConsentService }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isRevoked = service.status === "revoked";

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

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition-all hover:shadow-card",
          isRevoked && "opacity-70",
        )}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl",
                isRevoked && "grayscale",
              )}
              aria-hidden
            >
              {service.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">{service.name}</h3>
              <p className="text-xs text-muted-foreground">{service.category}</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              isRevoked
                ? "bg-muted text-muted-foreground"
                : "bg-accent text-accent-foreground",
            )}
          >
            {isRevoked ? "Отозван" : "Активен"}
          </span>
        </header>

        <p className="mt-3 text-sm text-muted-foreground">{service.description}</p>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Запрошенные данные
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

        <div className="mt-4 flex items-center justify-between gap-2">
          <RiskBadge level={service.risk} explanation={service.riskExplanation} />
          <span className="text-xs text-muted-foreground">
            {isRevoked && service.revokedAt
              ? `Отозван ${formatDate(service.revokedAt)}`
              : `Выдан ${formatDate(service.grantedAt)}`}
          </span>
        </div>

        <div className="mt-5 border-t pt-4">
          <Button
            onClick={() => setOpen(true)}
            variant={isRevoked ? "outline" : "destructive"}
            className="w-full"
          >
            {isRevoked ? (
              <>
                <ShieldCheck className="h-4 w-4" /> Восстановить доступ
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" /> Отозвать доступ
              </>
            )}
          </Button>
        </div>

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
