import { useAuth } from "@/lib/auth-context";
import { LogOut, Shield, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast("Вы вышли из аккаунта");
  };

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <div className="bg-primary px-4 pb-8 pt-4 text-primary-foreground">
        <p className="text-lg font-bold">Профиль</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div>
            <p className="font-semibold">{user?.user_metadata?.full_name ?? "Пользователь"}</p>
            <p className="text-sm text-primary-foreground/70">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {/* About */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">О системе</p>
          </div>
          <div className="divide-y">
            <InfoRow icon="🔒" label="Шифрование" value="TLS 1.3" />
            <InfoRow icon="📋" label="Стандарт" value="152-ФЗ" />
            <InfoRow icon="🌐" label="Webhook" value="httpbin.org (демо)" />
            <InfoRow icon="💾" label="Хранение" value="Supabase (PostgreSQL)" />
          </div>
        </div>

        {/* Production roadmap */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Для продакшена</p>
          </div>
          <ul className="space-y-1.5">
            {[
              "Авторизация через ЕСИА",
              "Реальный webhook-bus",
              "УКЭП / ПЭП для действий",
              "Регулятор как наблюдатель",
              "Неизменяемый аудит-лог",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-all active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
