import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { login, register } from "@/lib/consent-store";
import { Shield, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * AuthScreen — экран входа/регистрации внутри телефона.
 * Демо-аккаунты можно подставить одним тапом.
 */
export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    // легкая задержка чтобы показать spinner
    await new Promise((r) => setTimeout(r, 350));
    const res =
      mode === "login" ? login(email, password) : register(email, password, name);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(mode === "login" ? "С возвращением!" : "Аккаунт создан");
    navigate({ to: "/" });
  };

  const fillDemo = (acc: 1 | 2) => {
    setMode("login");
    setEmail(acc === 1 ? "nurken.kad@gmail.com" : "bayet.zh@gmail.com");
    setPassword("12345678");
  };

  return (
    <div className="flex min-h-full flex-col px-6 pb-6 pt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.65_0.22_320)] text-primary-foreground shadow-lg">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Consent OS</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Управляйте своими данными в одном месте
        </p>
      </div>

      <div className="mt-7 flex rounded-full bg-secondary p-1 text-xs font-medium">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-full py-2 transition-all",
              mode === m
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {m === "login" ? "Войти" : "Регистрация"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        {mode === "register" && (
          <Field icon={<UserIcon className="h-4 w-4" />}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
        )}
        <Field icon={<Mail className="h-4 w-4" />}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Field>
        <Field icon={<Lock className="h-4 w-4" />}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            minLength={6}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.24_310)] text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-center text-[11px] uppercase tracking-wider text-muted-foreground">
          Демо-аккаунты
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <DemoButton onClick={() => fillDemo(1)} name="Нуркен" hint="Финансы + работа" />
          <DemoButton onClick={() => fillDemo(2)} name="Баят" hint="Учёба + развлечения" />
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-secondary/50 px-4 py-3.5">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  );
}

function DemoButton({ onClick, name, hint }: { onClick: () => void; name: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border bg-card p-3 text-left transition-colors hover:border-primary/40"
    >
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </button>
  );
}
