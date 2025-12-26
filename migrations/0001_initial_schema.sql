-- イベント（大会）テーブル
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  questions_per_user INTEGER DEFAULT 10,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 問題プールテーブル
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK(correct_answer IN ('A', 'B', 'C', 'D')),
  pool_group INTEGER NOT NULL, -- 0-9の問題群グループ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL, -- 社員番号などのID
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 回答記録テーブル
CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  user_answer TEXT NOT NULL CHECK(user_answer IN ('A', 'B', 'C', 'D')),
  is_correct INTEGER NOT NULL,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- ユーザーごとのイベント参加状態テーブル
CREATE TABLE IF NOT EXISTS user_event_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  has_completed INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  completed_at DATETIME,
  UNIQUE(user_id, event_id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_questions_event_pool ON questions(event_id, pool_group);
CREATE INDEX IF NOT EXISTS idx_answers_user_event ON answers(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_status_lookup ON user_event_status(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
