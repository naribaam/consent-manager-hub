import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession, useUserData, logout, resetCurrentUserData } from "@/lib/consent-store";
import { LogOut, RotateCcw, Mail, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Профиль — Consent OS" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useSession();
  const { services, history } = useUserData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast("Вы вышли из аккаунта");
    navigate({ to: "/" });
  };

  const handleReset = () => {
    resetCurrentUserData();
    toast.success("Данные восстановлены к демо-состоянию");
  };

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-4 pb-6">
      <header className="pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Аккаунт
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight">Профиль</h1>
      </header>

      <div className="mt-5 flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-accent to-transparent p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.6_0.22_320)] text-lg font-bold text-primary-foreground shadow-lg">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{user?.name}</p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {user?.email}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Сервисов" value={services.length} />
        <Stat label="Событий" value={history.length} />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-card">
        <Row
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          title="Защита данных"
          subtitle="Webhook + аудит-лог"
        />
        <button
          onClick={handleReset}
          className="flex w-full items-center gap-3 border-t px-4 py-3.5 text-left hover:bg-secondary/50"
        >
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Сбросить демо-данные</p>
            <p className="text-[11px] text-muted-foreground">
              Вернуть исходный набор сервисов
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 border-t px-4 py-3.5 text-left text-risk-high hover:bg-risk-high-bg/50"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-sm font-medium">Выйти из аккаунта</span>
          <ChevronRight className="h-4 w-4 opacity-60" />
        </button>
      </div>

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        Consent OS • Прототип v0.2
      </p>
    </div>
  );
}

function Row({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
