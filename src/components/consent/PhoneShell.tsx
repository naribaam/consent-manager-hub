import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthScreen } from "./AuthScreen";
import { ServicesScreen } from "./ServicesScreen";
import { HistoryScreen } from "./HistoryScreen";
import { DataFlowScreen } from "./DataFlowScreen";
import { ProfileScreen } from "./ProfileScreen";
import { ShieldCheck, History, GitBranch, User } from "lucide-react";

type Tab = "services" | "history" | "flow" | "profile";

export function PhoneShell() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("services");

  // Reset to services tab on login
  useEffect(() => {
    if (user) setTab("services");
  }, [user?.id]);

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "services", label: "Сервисы", icon: <ShieldCheck className="h-5 w-5" /> },
    { id: "history", label: "История", icon: <History className="h-5 w-5" /> },
    { id: "flow", label: "Потоки", icon: <GitBranch className="h-5 w-5" /> },
    { id: "profile", label: "Профиль", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="phone-frame">
      {/* Status bar */}
      <div className="phone-status-bar">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-sm bg-foreground/80" style={{ width: 3, height: 3 + i * 2 }} />
            ))}
          </div>
          <div className="text-xs">WiFi</div>
          <div className="flex h-3.5 w-6 items-center rounded-sm border border-foreground/60 px-0.5">
            <div className="h-2 w-4 rounded-xs bg-foreground/80" />
          </div>
        </div>
      </div>

      {/* Dynamic island */}
      <div className="phone-island" />

      {/* Content */}
      <div className="phone-content">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !user ? (
          <AuthScreen />
        ) : (
          <>
            <div className="h-full overflow-hidden">
              {tab === "services" && <ServicesScreen />}
              {tab === "history" && <HistoryScreen />}
              {tab === "flow" && <DataFlowScreen />}
              {tab === "profile" && <ProfileScreen />}
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      {user && (
        <nav className="phone-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`phone-nav-item ${tab === t.id ? "active" : ""}`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
