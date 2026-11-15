-- ==============================================================================
-- СХЕМА БАЗЫ ДАННЫХ SUPABASE ДЛЯ «НОВОГОДНИЙ ДВИЖ 2027»
-- ==============================================================================

-- Включаем расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Таблица групп (пространств планирования)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Новогодний движ 2027',
  subtitle TEXT DEFAULT 'Планируем праздники вместе',
  organizer_id UUID NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🚀',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  client_token TEXT NOT NULL, -- Секретный токен сессии в браузере
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, client_token)
);

-- 3. Таблица мероприятий
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'party' CHECK (category IN ('party', 'food', 'games', 'cinema', 'trip', 'home', 'ny', 'other')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'voting', 'confirmed', 'cancelled', 'completed')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_emoji TEXT NOT NULL DEFAULT '🚀',
  confirmed_date DATE,
  time_start TIME,
  time_end TIME,
  location TEXT,
  location_url TEXT,
  description TEXT,
  budget_per_person NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Варианты дат для голосования (если предложено несколько дат)
CREATE TABLE IF NOT EXISTS event_date_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_start TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, date)
);

-- 5. Голоса за варианты дат (1 голос на пользователя за конкретную дату)
CREATE TABLE IF NOT EXISTS event_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  date_option_id UUID REFERENCES event_date_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_emoji TEXT NOT NULL DEFAULT '🚀',
  vote TEXT NOT NULL CHECK (vote IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date_option_id, user_id)
);

-- 6. Подтверждение участия (RSVP) в подтвержденных мероприятиях
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_emoji TEXT NOT NULL DEFAULT '🚀',
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 7. Комментарии и обсуждения к мероприятию
CREATE TABLE IF NOT EXISTS event_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_emoji TEXT NOT NULL DEFAULT '🚀',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрой фильтрации и поиска
CREATE INDEX IF NOT EXISTS idx_events_group_status ON events(group_id, status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(confirmed_date);
CREATE INDEX IF NOT EXISTS idx_votes_event ON event_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_event ON event_comments(event_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- ==============================================================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_date_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Публичный доступ на чтение для участников группы по ID группы
CREATE POLICY "Public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public update groups" ON groups FOR UPDATE USING (true);

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public insert events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update events" ON events FOR UPDATE USING (true);
CREATE POLICY "Public delete events" ON events FOR DELETE USING (true);

CREATE POLICY "Public read date options" ON event_date_options FOR SELECT USING (true);
CREATE POLICY "Public insert date options" ON event_date_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete date options" ON event_date_options FOR DELETE USING (true);

CREATE POLICY "Public read votes" ON event_votes FOR SELECT USING (true);
CREATE POLICY "Public manage votes" ON event_votes FOR ALL USING (true);

CREATE POLICY "Public read rsvps" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Public manage rsvps" ON event_rsvps FOR ALL USING (true);

CREATE POLICY "Public read comments" ON event_comments FOR SELECT USING (true);
CREATE POLICY "Public insert comments" ON event_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete comments" ON event_comments FOR DELETE USING (true);

-- Включение Supabase Realtime для мгновенной синхронизации между друзьями
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_date_options;
ALTER PUBLICATION supabase_realtime ADD TABLE event_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps;
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
