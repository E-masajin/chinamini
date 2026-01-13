-- 未来予測型クイズなど複数クイズシステムをサポートするための拡張
-- quiz_typeカラムを追加してクイズのタイプを管理

-- eventsテーブルにquiz_typeカラムを追加
ALTER TABLE events ADD COLUMN quiz_type TEXT DEFAULT 'async';

-- quiz_typeの値:
-- 'async': 非同期参加型クイズ（現在実装中）
-- 'realtime': リアルタイム対戦型クイズ（未実装）
-- 'prediction': 未来予測型クイズ（計画中）
-- 'location': 地理クイズ型（未実装）
-- 'daily': 日替わりクイズ（未実装）

-- questionsテーブルにもquiz_type関連のフィールドを追加（未来予測型用）
ALTER TABLE questions ADD COLUMN prediction_date DATETIME;
ALTER TABLE questions ADD COLUMN verification_source TEXT;
ALTER TABLE questions ADD COLUMN is_verified INTEGER DEFAULT 0;

-- 未来予測型クイズ用のインデックス
CREATE INDEX IF NOT EXISTS idx_questions_prediction ON questions(prediction_date, is_verified);
CREATE INDEX IF NOT EXISTS idx_events_quiz_type ON events(quiz_type);

-- コメント:
-- prediction_date: 未来予測型クイズで、答え合わせを行う日時
-- verification_source: 答え合わせに使うデータソース（例: 'weather_api', 'stock_api', 'sensor_data'）
-- is_verified: 答え合わせが完了したかどうか（0: 未完了, 1: 完了）
