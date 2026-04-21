import type { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * PhoneFrame — рамка iPhone, экран = flex-колонка:
 *   [status bar] [scrollable content (flex-1)] [bottom nav slot]
 * Нав-бар передаётся отдельным prop'ом, чтобы не уезжать при скролле.
 */
export function PhoneFrame({
  children,
  bottomNav,
}: {
  children: ReactNode;
  bottomNav?: ReactNode;
}) {
  return (
    <div className="relative mx-auto" style={{ width: "min(390px, 95vw)" }}>
      <div
        className="relative rounded-[3rem] p-[10px]"
        style={{
          background: "linear-gradient(160deg, oklch(0.22 0.03 265), oklch(0.12 0.02 265))",
          boxShadow: "var(--shadow-phone)",
        }}
      >
        {/* Боковые кнопки */}
        <span className="absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -left-[3px] top-[170px] h-12 w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -left-[3px] top-[230px] h-12 w-[3px] rounded-l bg-neutral-700" />
        <span className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r bg-neutral-700" />

        {/* Экран — flex-колонка */}
        <div
          className="relative flex flex-col overflow-hidden rounded-[2.5rem] bg-background"
          style={{ height: "min(820px, calc(100vh - 80px))" }}
        >
          {/* Status bar (фиксированная высота) */}
          <div className="relative z-30 flex h-11 shrink-0 items-center justify-between px-7 pt-3 text-[12px] font-semibold text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <BatteryFull className="h-4 w-4" />
            </div>
            {/* Dynamic Island поверх status bar */}
            <div className="pointer-events-none absolute left-1/2 top-2.5 h-7 w-[110px] -translate-x-1/2 rounded-full bg-black" />
          </div>

          {/* Прокручиваемая область */}
          <div className="no-scrollbar relative flex-1 overflow-y-auto">{children}</div>

          {/* Нижняя навигация в потоке (не absolute) */}
          {bottomNav && <div className="shrink-0">{bottomNav}</div>}
        </div>
      </div>
    </div>
  );
}
