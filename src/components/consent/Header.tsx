import { Link } from "@tanstack/react-router";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resetDemo } from "@/lib/consent-store";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Мои сервисы" },
  { to: "/history", label: "История" },
  { to: "/data-flow", label: "Потоки данных" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Consent OS</p>
            <p className="text-[11px] text-muted-foreground">Управление согласиями</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  "bg-accent text-accent-foreground rounded-lg px-3 py-2 text-sm font-medium",
              }}
              inactiveProps={{
                className:
                  "text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetDemo();
              toast("Демо-данные сброшены");
            }}
          >
            Сбросить демо
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: "bg-accent text-accent-foreground rounded-lg px-3 py-2 text-sm font-medium",
                }}
                inactiveProps={{
                  className: "text-foreground rounded-lg px-3 py-2 text-sm font-medium",
                }}
              >
                {n.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                resetDemo();
                toast("Демо-данные сброшены");
                setOpen(false);
              }}
            >
              Сбросить демо
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
