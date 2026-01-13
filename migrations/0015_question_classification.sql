-- 問題種別と保持ポリシーの追加

-- questionsテーブルに分類カラムを追加
ALTER TABLE questions ADD COLUMN question_type TEXT;
ALTER TABLE questions ADD COLUMN retention_policy TEXT;
ALTER TABLE questions ADD COLUMN ai_suggested_type TEXT;
ALTER TABLE questions ADD COLUMN ai_confidence REAL;
ALTER TABLE questions ADD COLUMN classification_reason TEXT;

-- eventsテーブルに分類カラムを追加
ALTER TABLE events ADD COLUMN event_type TEXT;
ALTER TABLE events ADD COLUMN retention_policy TEXT;

-- 既存データにデフォルト値を設定
UPDATE questions SET question_type = 'learning' WHERE question_type IS NULL;
UPDATE questions SET retention_policy = 'permanent' WHERE retention_policy IS NULL;
UPDATE events SET event_type = 'learning' WHERE event_type IS NULL;
UPDATE events SET retention_policy = 'permanent' WHERE retention_policy IS NULL;

-- questionsのインデックス追加
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_retention ON questions(retention_policy);

-- eventsのインデックス追加
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
