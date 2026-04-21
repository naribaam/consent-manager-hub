import type { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * PhoneFrame — рамка iPhone-подобного устройства, в которой живёт всё приложение.
 * Внутри — экран, который скроллится отдельно.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: "min(390px, 95vw)" }}>
      {/* Корпус */}
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

        {/* Экран */}
        <div
          className="relative overflow-hidden rounded-[2.5rem] bg-background"
          style={{ height: "min(820px, calc(100vh - 80px))" }}
        >
          {/* Status bar */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-7 pt-3 text-[12px] font-semibold text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5" />
              <Wifi className="h-3.5 w-3.5" />
              <BatteryFull className="h-4 w-4" />
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-2.5 z-40 h-7 w-[110px] -translate-x-1/2 rounded-full bg-black" />

          {/* Прокручиваемая область — оставляем место под status bar и нав-бар */}
          <div
            className="no-scrollbar absolute inset-0 overflow-y-auto"
            style={{ paddingTop: "44px", paddingBottom: "76px" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
