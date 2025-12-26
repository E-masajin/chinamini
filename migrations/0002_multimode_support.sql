-- イベントモード追加、最低参加人数追加
ALTER TABLE events ADD COLUMN mode TEXT DEFAULT 'individual' CHECK(mode IN ('individual', 'team', 'company'));
ALTER TABLE events ADD COLUMN min_participants INTEGER DEFAULT 1;

-- ユーザーにチーム・企業情報追加
ALTER TABLE users ADD COLUMN team_name TEXT;
ALTER TABLE users ADD COLUMN company_name TEXT;

-- 回答記録に開始時間・終了時間追加
ALTER TABLE user_event_status ADD COLUMN started_at DATETIME;
ALTER TABLE user_event_status ADD COLUMN answer_duration INTEGER; -- 秒単位

-- チーム集計ビュー用のインデックス
CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_name);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_name);

-- 管理者テーブル
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- デフォルト管理者（パスワード: admin123）
INSERT INTO admins (username, password_hash) 
VALUES ('admin', 'admin123');
