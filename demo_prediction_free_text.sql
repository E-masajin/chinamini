-- 既存のデモデータをクリア
DELETE FROM prediction_answers;
DELETE FROM questions WHERE event_id IN (SELECT id FROM events WHERE quiz_type = 'prediction');
DELETE FROM events WHERE quiz_type = 'prediction';

-- =====================================================
-- 1. 田中君のランチ予測（記入式）
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '田中君のランチ予測',
    '田中君が今日のランチで何を食べるか予測しよう！',
    datetime('now'),
    datetime('now', '+7 days'),
    'individual',
    'prediction',
    1,
    3,
    1
);

-- 記入式の問題（自由入力）
INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified, participation_deadline, answer_reveal_time, answer_type)
VALUES 
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6, 
     '田中君は今日12:30のランチで何を食べるでしょうか？（自由記入）', '', '', '', '', '', 
     '正解は「カレー」でした', 1, datetime('now', '+2 hours'), 'manual', 0, 
     datetime('now', '+1 hours', '+30 minutes'), datetime('now', '+2 hours'), 'free_text'),
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6,
     '田中君は今日のランチにいくら使うでしょうか？（数字で入力、例: 800）', '', '', '', '', '',
     '正解は「750円」でした', 1, datetime('now', '+2 hours'), 'manual', 0,
     datetime('now', '+1 hours', '+30 minutes'), datetime('now', '+2 hours'), 'free_text'),
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6,
     '田中君はランチに出発する時刻は何時何分でしょうか？（例: 12:15）', '', '', '', '', '',
     '正解は「12:05」でした', 1, datetime('now', '+2 hours'), 'manual', 0,
     datetime('now', '+1 hours', '+30 minutes'), datetime('now', '+2 hours'), 'free_text');

-- =====================================================
-- 2. 明日の天気予測（記入式）
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '明日の天気予測',
    '明日の天気を予測しよう！気象予報士気分で挑戦！',
    datetime('now'),
    datetime('now', '+7 days'),
    'individual',
    'prediction',
    1,
    3,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified, participation_deadline, answer_reveal_time, answer_type)
VALUES 
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の東京の最高気温は何度でしょうか？（数字のみ、例: 15）', '', '', '', '', '',
     '正解は「13度」でした', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0,
     datetime('now', '+1 day'), datetime('now', '+1 day', '+12 hours'), 'free_text'),
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の降水確率は何％でしょうか？（数字のみ、例: 30）', '', '', '', '', '',
     '正解は「10%」でした', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0,
     datetime('now', '+1 day'), datetime('now', '+1 day', '+12 hours'), 'free_text'),
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の最低気温は何度でしょうか？（数字のみ、例: 5）', '', '', '', '', '',
     '正解は「4度」でした', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0,
     datetime('now', '+1 day'), datetime('now', '+1 day', '+12 hours'), 'free_text');

-- =====================================================
-- 3. 営業成績予測（記入式）
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '営業チームの今日の成績予測',
    '営業チームは今日何件の受注を獲得する？',
    datetime('now'),
    datetime('now', '+1 day'),
    'individual',
    'prediction',
    1,
    2,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified, participation_deadline, answer_reveal_time, answer_type)
VALUES 
    ((SELECT id FROM events WHERE name = '営業チームの今日の成績予測' ORDER BY id DESC LIMIT 1), 6,
     '営業チームは今日何件の受注を獲得するでしょうか？（数字のみ）', '', '', '', '', '',
     '正解は「7件」でした', 1, datetime('now', '+8 hours'), 'manual', 0,
     datetime('now', '+6 hours'), datetime('now', '+8 hours'), 'free_text'),
    ((SELECT id FROM events WHERE name = '営業チームの今日の成績予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の総売上金額は？（万円単位、例: 120）', '', '', '', '', '',
     '正解は「85万円」でした', 1, datetime('now', '+8 hours'), 'manual', 0,
     datetime('now', '+6 hours'), datetime('now', '+8 hours'), 'free_text');
