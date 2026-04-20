
/*
  # Consent OS — Full Schema

  ## Overview
  Sets up the full data model for Consent OS:
  - `services` — global catalog of all available services (seeded with demo data)
  - `service_data_points` — data points each service can request
  - `user_consents` — which services a user has granted consent to
  - `consent_data_points` — granular per-data-point consent status per user
  - `consent_history` — immutable audit log of all consent changes

  ## Security
  - RLS enabled on all tables
  - Users can only read/modify their own consent records
  - Services catalog is publicly readable
*/

-- =====================
-- SERVICES CATALOG
-- =====================
CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are publicly readable"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- =====================
-- SERVICE DATA POINTS
-- =====================
CREATE TABLE IF NOT EXISTS service_data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id text NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text DEFAULT '',
  sort_order int DEFAULT 0
);

ALTER TABLE service_data_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Data points are publicly readable"
  ON service_data_points FOR SELECT
  TO authenticated
  USING (true);

-- =====================
-- USER CONSENTS
-- =====================
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id text NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE(user_id, service_id)
);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- CONSENT DATA POINTS (granular)
-- =====================
CREATE TABLE IF NOT EXISTS consent_data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id text NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  data_point_id uuid NOT NULL REFERENCES service_data_points(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, data_point_id)
);

ALTER TABLE consent_data_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data point consents"
  ON consent_data_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data point consents"
  ON consent_data_points FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data point consents"
  ON consent_data_points FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- CONSENT HISTORY
-- =====================
CREATE TABLE IF NOT EXISTS consent_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id text NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  service_icon text NOT NULL,
  action text NOT NULL CHECK (action IN ('granted', 'revoked', 'restored', 'data_point_revoked', 'data_point_restored')),
  data_points text[] DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE consent_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON consent_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON consent_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- SEED SERVICES
-- =====================
INSERT INTO services (id, name, icon, category, description, risk_level, risk_explanation) VALUES
  ('sberbank',       'СберБанк',         '🏦', 'Банк',        'Доступ к финансовым данным для скоринга и переводов',               'high',   'Полный доступ к финансовой жизни: счета, транзакции и кредитная история. Утечка может привести к мошенничеству.'),
  ('gosuslugi',      'Госуслуги',         '🏛️', 'Госсервис',   'Идентификация личности и доступ к госуслугам',                       'medium', 'Идентифицирующие данные. Необходимы для работы с госорганами, но при утечке используются для оформления документов.'),
  ('yandex-eda',     'Яндекс Еда',        '🍔', 'Доставка',    'Доставка еды и персональные рекомендации',                          'low',    'Контактные и поведенческие данные. Минимальный финансовый риск, но раскрывает образ жизни и адреса.'),
  ('steam',          'Steam',             '🎮', 'Игры',        'Игровая платформа, покупки и профиль',                              'low',    'Игровые предпочтения и история покупок. Риск низкий, однако данные карты могут быть под угрозой.'),
  ('netflix',        'Netflix',           '📺', 'Развлечения', 'Стриминг фильмов и сериалов',                                       'low',    'История просмотров и предпочтения. Минимальный риск, данные используются для рекомендаций.'),
  ('duolingo',       'Duolingo',          '🦉', 'Учёба',       'Изучение языков и отслеживание прогресса',                         'low',    'Прогресс обучения и пользовательские данные. Риск минимален.'),
  ('coursera',       'Coursera',          '🎓', 'Учёба',       'Онлайн-образование и сертификаты',                                  'medium', 'Академические данные и платёжная информация. Средний риск при утечке.'),
  ('vk',             'ВКонтакте',         '💬', 'Соцсети',     'Социальная сеть, сообщения и публикации',                          'high',   'Личные сообщения, контакты, местоположение. Высокий риск — большой объём личной жизни.'),
  ('tinkoff',        'Т-Банк',            '💳', 'Банк',        'Мобильный банк и инвестиции',                                       'high',   'Финансовые транзакции и инвестиционный портфель. Высокий риск мошенничества.'),
  ('yandex-market',  'Яндекс Маркет',     '🛒', 'Магазины',    'Покупки и сравнение товаров',                                       'medium', 'История покупок и адреса доставки. Средний риск.'),
  ('spotify',        'Spotify',           '🎵', 'Музыка',      'Стриминг музыки и подкасты',                                        'low',    'Музыкальные предпочтения. Очень низкий риск.'),
  ('google-edu',     'Google Workspace',  '📚', 'Учёба',       'Облачные инструменты для учёбы и работы',                          'medium', 'Документы, письма, календарь. Средний риск — широкий доступ к рабочей жизни.'),
  ('avito',          'Авито',             '🏷️', 'Маркетплейс', 'Покупка и продажа товаров',                                         'medium', 'Адрес, телефон, история сделок. Средний риск контактных данных.'),
  ('mos-ru',         'Mos.ru',            '🏙️', 'Госсервис',   'Городские услуги Москвы',                                           'medium', 'Адрес регистрации и городские данные. Средний риск.'),
  ('zoom',           'Zoom',              '📹', 'Учёба/Работа','Видеоконференции и вебинары',                                        'medium', 'Записи встреч и контакты. Средний риск.')
ON CONFLICT (id) DO NOTHING;

-- =====================
-- SEED DATA POINTS
-- =====================
INSERT INTO service_data_points (service_id, label, sort_order) VALUES
  -- SberBank
  ('sberbank', 'Паспортные данные', 1),
  ('sberbank', 'Банковские счета', 2),
  ('sberbank', 'История транзакций', 3),
  ('sberbank', 'Кредитная история', 4),
  -- Gosuslugi
  ('gosuslugi', 'ФИО', 1),
  ('gosuslugi', 'СНИЛС', 2),
  ('gosuslugi', 'Адрес регистрации', 3),
  ('gosuslugi', 'ИНН', 4),
  -- Yandex Eda
  ('yandex-eda', 'Телефон', 1),
  ('yandex-eda', 'Геолокация', 2),
  ('yandex-eda', 'История заказов', 3),
  -- Steam
  ('steam', 'Email', 1),
  ('steam', 'История игр', 2),
  ('steam', 'История покупок', 3),
  ('steam', 'Список друзей', 4),
  -- Netflix
  ('netflix', 'Email', 1),
  ('netflix', 'История просмотров', 2),
  ('netflix', 'Платёжные данные', 3),
  -- Duolingo
  ('duolingo', 'Email', 1),
  ('duolingo', 'Прогресс обучения', 2),
  ('duolingo', 'Уведомления', 3),
  -- Coursera
  ('coursera', 'ФИО', 1),
  ('coursera', 'Email', 2),
  ('coursera', 'Сертификаты', 3),
  ('coursera', 'Платёжные данные', 4),
  -- VK
  ('vk', 'Имя и фамилия', 1),
  ('vk', 'Телефон', 2),
  ('vk', 'Личные сообщения', 3),
  ('vk', 'Геолокация', 4),
  ('vk', 'Список контактов', 5),
  -- Tinkoff
  ('tinkoff', 'Паспортные данные', 1),
  ('tinkoff', 'Счета и карты', 2),
  ('tinkoff', 'Инвестиции', 3),
  ('tinkoff', 'История операций', 4),
  -- Yandex Market
  ('yandex-market', 'Email', 1),
  ('yandex-market', 'Адрес доставки', 2),
  ('yandex-market', 'История покупок', 3),
  -- Spotify
  ('spotify', 'Email', 1),
  ('spotify', 'Музыкальные предпочтения', 2),
  ('spotify', 'История прослушиваний', 3),
  -- Google Edu
  ('google-edu', 'Email', 1),
  ('google-edu', 'Документы', 2),
  ('google-edu', 'Календарь', 3),
  ('google-edu', 'Контакты', 4),
  -- Avito
  ('avito', 'Телефон', 1),
  ('avito', 'Адрес', 2),
  ('avito', 'История сделок', 3),
  -- Mos.ru
  ('mos-ru', 'ФИО', 1),
  ('mos-ru', 'Адрес регистрации', 2),
  ('mos-ru', 'Городские карты', 3),
  -- Zoom
  ('zoom', 'Email', 1),
  ('zoom', 'Записи встреч', 2),
  ('zoom', 'Контакты', 3)
ON CONFLICT DO NOTHING;
