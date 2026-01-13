-- 問題バージョン管理システム

-- questionsテーブルにバージョン管理カラムを追加
ALTER TABLE questions ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN base_question_id INTEGER;
ALTER TABLE questions ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN deprecated_at DATETIME;
ALTER TABLE questions ADD COLUMN replaced_by INTEGER;
ALTER TABLE questions ADD COLUMN update_reason TEXT;
ALTER TABLE questions ADD COLUMN valid_from DATETIME;
ALTER TABLE questions ADD COLUMN valid_until DATETIME;

-- answersテーブルに学習履歴情報を追加
ALTER TABLE answers ADD COLUMN time_spent INTEGER DEFAULT 0;
ALTER TABLE answers ADD COLUMN question_version INTEGER DEFAULT 1;
ALTER TABLE answers ADD COLUMN learning_session_id TEXT;

-- 学習セッションテーブル（学習の文脈を保存）
CREATE TABLE IF NOT EXISTS learning_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  total_time_spent INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 組織学習統計テーブル（集計結果をキャッシュ）
CREATE TABLE IF NOT EXISTS organization_learning_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_rate REAL DEFAULT 0.0,
  avg_time_spent REAL DEFAULT 0.0,
  last_updated DATETIME
);

-- 個人学習統計テーブル
CREATE TABLE IF NOT EXISTS user_learning_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_rate REAL DEFAULT 0.0,
  avg_time_spent REAL DEFAULT 0.0,
  last_studied_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE(user_id, category)
);

-- インデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_questions_base_id ON questions(base_question_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_version ON questions(base_question_id, version);
CREATE INDEX IF NOT EXISTS idx_answers_learning ON answers(user_id, question_id, answered_at);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_user_learning_stats_user ON user_learning_stats(user_id, category);

-- 既存データにデフォルト値を設定
UPDATE questions SET is_active = 1 WHERE is_active IS NULL;
UPDATE questions SET version = 1 WHERE version IS NULL;
UPDATE questions SET valid_from = created_at WHERE valid_from IS NULL;
UPDATE answers SET question_version = 1 WHERE question_version IS NULL;
