import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shield, Eye, EyeOff, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast.error("Ошибка входа: " + error);
    } else {
      const { error } = await signUp(email, password);
      if (error) toast.error("Ошибка регистрации: " + error);
      else toast.success("Аккаунт создан! Проверьте почту.");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-primary px-6 pb-8 pt-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Consent OS</p>
            <p className="text-xs text-primary-foreground/70">Управление согласиями</p>
          </div>
        </div>
        <p className="mt-6 text-2xl font-bold leading-tight">
          {mode === "login" ? "С возвращением" : "Создать аккаунт"}
        </p>
        <p className="mt-1 text-sm text-primary-foreground/70">
          {mode === "login"
            ? "Войдите, чтобы управлять своими данными"
            : "Начните контролировать свои данные"}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto bg-background px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border bg-card px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-primary underline-offset-2 hover:underline"
          >
            {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>

        {/* Demo accounts hint */}
        {mode === "login" && (
          <div className="mt-6 rounded-xl border border-dashed bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Демо-аккаунты</p>
            <button
              type="button"
              onClick={() => { setEmail("nurken.kad@gmail.com"); setPassword("12345678"); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
            >
              <span className="font-medium">Нуркен</span>
              <span className="ml-2 text-muted-foreground">nurken.kad@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("bayet.zh@gmail.com"); setPassword("12345678"); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
            >
              <span className="font-medium">Байет</span>
              <span className="ml-2 text-muted-foreground">bayet.zh@gmail.com</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
