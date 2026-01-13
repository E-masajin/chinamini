-- user_event_statusテーブルにhas_participatedカラムを追加

ALTER TABLE user_event_status ADD COLUMN has_participated INTEGER DEFAULT 0;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_event_status_participated 
ON user_event_status(user_id, event_id, has_participated);
