-- 予測クイズの改善マイグレーション

-- prediction_answersテーブルに自由入力用カラムを追加
ALTER TABLE prediction_answers ADD COLUMN free_text_answer TEXT;

-- questionsテーブルに参加期限と答え発表時刻を追加
ALTER TABLE questions ADD COLUMN participation_deadline DATETIME;
ALTER TABLE questions ADD COLUMN answer_reveal_time DATETIME;

-- questionsテーブルに回答タイプを追加（multiple_choice or free_text）
ALTER TABLE questions ADD COLUMN answer_type TEXT DEFAULT 'multiple_choice';

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_questions_deadlines 
ON questions(participation_deadline, answer_reveal_time);

-- コメント
-- free_text_answer: 自由入力の回答（「12:30」「カレー」など）
-- participation_deadline: 参加期限（この時刻まで回答可能）
-- answer_reveal_time: 答え発表時刻
-- answer_type: 'multiple_choice'（4択）または 'free_text'（記入式）
