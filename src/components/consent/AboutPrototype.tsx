import { ChevronRight } from "lucide-react";

export function AboutPrototype() {
  return (
    <section className="mt-16 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
      <h2 className="text-lg font-semibold">О прототипе</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Это демонстрационный прототип национальной системы управления согласиями на обработку
        персональных данных. Все данные хранятся локально в браузере (localStorage). Webhook-вызовы
        симулируются через httpbin.org — посмотрите консоль при отзыве доступа.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Что нужно для продакшена</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {[
              "Backend: реестр согласий с неизменяемым аудит-логом",
              "OAuth 2.0 / OIDC для каждого сервиса-оператора ПДн",
              "Webhook-шина для уведомления операторов об отзыве",
              "Юридически значимая подпись действий (УКЭП / ПЭП)",
              "Шифрование PII at-rest и in-transit",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Масштабирование до национальной системы</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {[
              "Авторизация через ЕСИА (Госуслуги)",
              "Госреестр согласий на базе ГИС с резервированием",
              "Открытое API для всех операторов ПДн (152-ФЗ)",
              "Регулятор (Роскомнадзор) как наблюдатель с read-only доступом",
              "Mobile-first интерфейс + интеграция в приложение Госуслуг",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
