import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PhoneFrame } from "@/components/consent/PhoneFrame";
import { BottomNav } from "@/components/consent/BottomNav";
import { useSession } from "@/lib/consent-store";
import { AuthScreen } from "@/components/consent/AuthScreen";
import { ShieldCheck, Smartphone, Webhook } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stage px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Перейдите на главную, чтобы продолжить работу с Consent OS.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Consent OS — управление согласиями на персональные данные" },
      {
        name: "description",
        content:
          "Прототип национальной системы управления согласиями: контролируйте, какие сервисы видят ваши данные, и отзывайте доступ в один клик.",
      },
      { name: "author", content: "Consent OS" },
      { property: "og:title", content: "Consent OS — управление согласиями на персональные данные" },
      {
        property: "og:description",
        content:
          "Контролируйте, какие сервисы видят ваши персональные данные. Один клик — и доступ отозван.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Consent OS — управление согласиями на персональные данные" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { isAuthenticated } = useSession();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="stage-bg min-h-screen">
        <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-4 py-8 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          {/* Левая колонка — бренд */}
          <aside className="hidden lg:block">
            <BrandPanel />
          </aside>

          {/* Центр — телефон */}
          <main className="flex justify-center">
            <PhoneFrame>
              {isAuthenticated ? (
                <>
                  <Outlet />
                  <BottomNav />
                </>
              ) : (
                <AuthScreen />
              )}
            </PhoneFrame>
          </main>

          {/* Правая колонка — фичи */}
          <aside className="hidden lg:block">
            <FeaturesPanel />
          </aside>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}

function BrandPanel() {
  return (
    <div className="space-y-6 pl-4">
      <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Прототип • Hackathon 2026
      </div>
      <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
        Ваши данные.
        <br />
        <span className="bg-gradient-to-br from-primary to-[oklch(0.6_0.22_320)] bg-clip-text text-transparent">
          Ваш контроль.
        </span>
      </h1>
      <p className="max-w-md text-base text-muted-foreground">
        Consent OS — единая операционная система согласий. Вы видите, кто что просит, и
        отзываете доступ в один тап. Сервисы получают webhook и обязаны прекратить обработку.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        {["152-ФЗ", "GDPR-ready", "Open API", "ЕСИА"].map((t) => (
          <span
            key={t}
            className="rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturesPanel() {
  const items = [
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Mobile-first",
      desc: "Интерфейс рассчитан на встройку в мобильное приложение Госуслуг.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Гранулярные согласия",
      desc: "Отзыв одного поля, а не всего сервиса целиком.",
    },
    {
      icon: <Webhook className="h-5 w-5" />,
      title: "Webhook-уведомления",
      desc: "Оператор данных мгновенно узнаёт об отзыве согласия.",
    },
  ];
  return (
    <div className="space-y-4 pr-4">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-2xl border bg-background/70 p-4 backdrop-blur transition-colors hover:bg-background"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              {it.icon}
            </span>
            <h3 className="text-sm font-semibold">{it.title}</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{it.desc}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-dashed bg-background/40 p-4 text-xs text-muted-foreground backdrop-blur">
        <p className="font-medium text-foreground">Демо-аккаунты</p>
        <p className="mt-1">nurken.kad@gmail.com / 12345678</p>
        <p>bayet.zh@gmail.com / 12345678</p>
      </div>
    </div>
  );
}
