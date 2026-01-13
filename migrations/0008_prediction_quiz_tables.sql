-- 未来予測型クイズ専用のテーブル

-- 予測回答テーブル（通常のanswersとは別管理）
CREATE TABLE IF NOT EXISTS prediction_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    predicted_answer TEXT NOT NULL,
    predicted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actual_answer TEXT,
    is_correct INTEGER DEFAULT NULL,
    verified_at DATETIME,
    confidence_level INTEGER DEFAULT 3,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 予測問題の実データテーブル（答え合わせ用）
CREATE TABLE IF NOT EXISTS prediction_actual_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    data_source TEXT NOT NULL,
    actual_value TEXT NOT NULL,
    actual_option TEXT NOT NULL,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 予測精度の統計テーブル
CREATE TABLE IF NOT EXISTS prediction_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    event_id INTEGER NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    accuracy_rate REAL DEFAULT 0.0,
    avg_confidence REAL DEFAULT 0.0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_prediction_answers_user ON prediction_answers(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_prediction_answers_question ON prediction_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_prediction_answers_verified ON prediction_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_prediction_actual_data_question ON prediction_actual_data(question_id);
CREATE INDEX IF NOT EXISTS idx_prediction_statistics_user ON prediction_statistics(user_id);

-- コメント:
-- prediction_answers: ユーザーの予測回答を保存
--   - predicted_answer: 予測した回答（A/B/C/D）
--   - actual_answer: 実際の正解（答え合わせ後）
--   - is_correct: 正解かどうか（NULL: 未検証, 0: 不正解, 1: 正解）
--   - confidence_level: 予測の自信度（1-5）

-- prediction_actual_data: 外部APIから取得した実データ
--   - data_source: データソース（'weather_api', 'stock_api'など）
--   - actual_value: 取得した実際の値（例: "25.3度", "38500円"）
--   - actual_option: 対応する選択肢（A/B/C/D）
--   - raw_data: APIのレスポンスJSON（デバッグ用）

-- prediction_statistics: ユーザーごとの予測精度統計
