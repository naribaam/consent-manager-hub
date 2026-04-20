import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/consent/PhoneShell";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="app-bg">
      <div className="app-bg-orb app-bg-orb-1" />
      <div className="app-bg-orb app-bg-orb-2" />

      {/* Left panel */}
      <aside className="app-side-panel">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-xl">
              🔐
            </div>
            <div>
              <p className="font-bold text-xl leading-tight">Consent OS</p>
              <p className="text-sm text-muted-foreground">Управление данными</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Единая точка контроля над тем, кто и какие ваши данные использует.
            Отзывайте доступ отдельно по каждому типу данных.
          </p>
        </div>

        <div className="space-y-1.5">
          <FeatureItem icon="🛡️" title="Гранулярный контроль" desc="Отзыв по каждому типу данных" />
          <FeatureItem icon="⚡" title="Мгновенный отзыв" desc="Webhook-уведомление операторам" />
          <FeatureItem icon="📋" title="Аудит-лог" desc="Полная история изменений" />
          <FeatureItem icon="🔍" title="Потоки данных" desc="Визуальная карта передачи" />
        </div>

        <div className="mt-8 rounded-2xl bg-muted/50 border p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2.5">Демо-аккаунты</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Нуркен</span>
              <span className="text-muted-foreground">nurken.kad@gmail.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Байет</span>
              <span className="text-muted-foreground">bayet.zh@gmail.com</span>
            </div>
            <p className="mt-1 text-muted-foreground/60">Пароль для обоих: 12345678</p>
          </div>
        </div>
      </aside>

      {/* Phone */}
      <main className="app-main">
        <PhoneShell />
      </main>

      {/* Right panel */}
      <aside className="app-side-panel app-side-panel-right">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Категории</p>
        <div className="space-y-1">
          {CATEGORIES.map(({ icon, name, desc }) => (
            <div key={name} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition-colors cursor-default">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-muted/40 transition-colors">
      <span className="text-lg mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { icon: "🏦", name: "Финансы", desc: "Банки и платежи" },
  { icon: "🏛️", name: "Госсервисы", desc: "Госуслуги, МФЦ" },
  { icon: "🎮", name: "Игры", desc: "Steam, консоли" },
  { icon: "📺", name: "Медиа", desc: "Стриминг, музыка" },
  { icon: "🎓", name: "Учёба", desc: "Coursera, Duolingo" },
  { icon: "🛒", name: "Магазины", desc: "Маркетплейсы" },
  { icon: "💬", name: "Соцсети", desc: "VK, мессенджеры" },
];
