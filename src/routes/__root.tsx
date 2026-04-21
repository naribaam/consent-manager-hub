import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/consent/Header";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
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
      { name: "description", content: "Consent Manager Hub is a web application for managing personal data consents across various services." },
      { property: "og:description", content: "Consent Manager Hub is a web application for managing personal data consents across various services." },
      { name: "twitter:description", content: "Consent Manager Hub is a web application for managing personal data consents across various services." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a011b99f-081c-4d9a-bfd9-acbcf5988b56/id-preview-ab7ca664--2010eb45-5998-4196-b9a7-22ed9ada53a3.lovable.app-1776697289443.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a011b99f-081c-4d9a-bfd9-acbcf5988b56/id-preview-ab7ca664--2010eb45-5998-4196-b9a7-22ed9ada53a3.lovable.app-1776697289443.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
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
  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <Header />
        <Outlet />
      </div>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}
