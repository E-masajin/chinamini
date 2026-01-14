-- セキュリティ強化マイグレーション
-- 管理者パスワードのハッシュ化、セッション管理の追加

-- 既存のadminsテーブルにカラムを追加
ALTER TABLE admins ADD COLUMN password_salt TEXT;
ALTER TABLE admins ADD COLUMN updated_at DATETIME;
ALTER TABLE admins ADD COLUMN last_login_at DATETIME;
ALTER TABLE admins ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE admins ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN locked_until DATETIME;

-- 管理者セッションテーブル
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  is_valid INTEGER DEFAULT 1,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- CSRFトークンテーブル
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  admin_id INTEGER,
  user_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- 監査ログテーブル（セキュリティイベントの記録）
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'admin_action', etc.
  admin_id INTEGER,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  old_value TEXT,
  new_value TEXT,
  success INTEGER DEFAULT 1,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token ON csrf_tokens(token);
CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires ON csrf_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);

-- 既存の管理者アカウントを更新（is_activeとupdated_atを設定）
UPDATE admins SET is_active = 1, updated_at = datetime('now') WHERE is_active IS NULL;
