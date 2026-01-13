-- CHECK制約を削除するためにquestionsテーブルを再作成

-- 一時テーブルに既存データをコピー（既存のカラムのみ）
CREATE TABLE questions_backup AS SELECT 
  id, event_id, question_text, option_a, option_b, option_c, option_d,
  correct_answer, pool_group, created_at, category_id, source_material,
  detailed_explanation, importance_level, category, prediction_date,
  verification_source, is_verified, participation_deadline, answer_reveal_time,
  answer_type
FROM questions;

-- 古いテーブルを削除
DROP TABLE questions;

-- 新しいテーブル（CHECK制約なし、option/correct_answerをNULL許可）を作成
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  pool_group INTEGER NOT NULL, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  category_id INTEGER REFERENCES question_categories(id),
  source_material TEXT,
  detailed_explanation TEXT,
  importance_level INTEGER DEFAULT 3,
  category TEXT DEFAULT 'knowledge',
  prediction_date DATETIME,
  verification_source TEXT,
  is_verified INTEGER DEFAULT 0,
  participation_deadline DATETIME,
  answer_reveal_time DATETIME,
  answer_type TEXT DEFAULT 'multiple_choice',
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- データを戻す（全カラムを明示的に指定）
INSERT INTO questions (
  id, event_id, question_text, option_a, option_b, option_c, option_d,
  correct_answer, pool_group, created_at, category_id, source_material,
  detailed_explanation, importance_level, category, prediction_date,
  verification_source, is_verified, participation_deadline, answer_reveal_time,
  answer_type
)
SELECT * FROM questions_backup;

-- バックアップを削除
DROP TABLE questions_backup;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_questions_prediction ON questions(prediction_date, is_verified);
CREATE INDEX IF NOT EXISTS idx_questions_deadlines ON questions(participation_deadline, answer_reveal_time);
