import { Link, useLocation } from "@tanstack/react-router";
import { Home, History, Network, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Сервисы", icon: Home },
  { to: "/history", label: "История", icon: History },
  { to: "/data-flow", label: "Карта", icon: Network },
  { to: "/account", label: "Профиль", icon: User },
] as const;

/**
 * BottomNav — нижняя навигация iOS-стиля, абсолютная внутри экрана телефона.
 */
export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="border-t border-border/70 bg-background/95 backdrop-blur-xl">
      <ul className="flex items-center justify-around px-2 py-2 pb-3">
        {NAV.map((n) => {
          const active = pathname === n.to;
          const Icon = n.icon;
          return (
            <li key={n.to}>
              <Link
                to={n.to}
                className={cn(
                  "flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
                <span className="text-[10px] font-medium">{n.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mx-auto mb-1 h-1 w-32 rounded-full bg-foreground/30" />
    </nav>
  );
}
