-- デモ用：未来予測型クイズ「田中君のランチ予測」
-- このSQLを実行すると、テストデータが作成されます

-- 1. 予測イベントを作成
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '田中君のランチ予測',
    '田中君が今日のランチで何を食べるか予測しよう！当たった人にはプチ賞品あり🎁',
    datetime('now'),
    datetime('now', '+1 day'),
    'individual',
    'prediction',
    1,
    3,
    1
);

-- 2. 問題を作成（event_idは自動で最後のIDが使われる想定）
-- 問題1: 田中君のランチメニュー
INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES (
    (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
    6,  -- 未来予測カテゴリ
    '田中君は今日12:30のランチで何を食べるでしょうか？',
    'ラーメン',
    'カレー',
    'そば',
    'おにぎり',
    'A',  -- 仮の正解
    '田中君は毎週月曜日はラーメンを食べることが多い傾向があります。',
    1,  -- pool_group
    datetime('now', '+2 hours'),
    'manual',
    0
);

-- 問題2: ランチの予算
INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES (
    (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
    6,
    '田中君は今日のランチにいくら使うでしょうか？',
    '500円以下',
    '501〜800円',
    '801〜1000円',
    '1001円以上',
    'B',
    '田中君の平均ランチ予算は700円前後です。',
    1,  -- pool_group
    datetime('now', '+2 hours'),
    'manual',
    0
);

-- 問題3: ランチに行く時間
INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES (
    (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
    6,
    '田中君はランチに出発する時刻は何時でしょうか？',
    '12:00〜12:15',
    '12:16〜12:30',
    '12:31〜12:45',
    '12:46以降',
    'A',
    '田中君はお腹が空くと早めに行動します。',
    1,  -- pool_group
    datetime('now', '+2 hours'),
    'manual',
    0
);

-- 3. テストユーザーの予測回答を作成（オプション）
-- ユーザーID 'USER001'が予測した場合
INSERT INTO prediction_answers (user_id, event_id, question_id, predicted_answer, confidence_level, predicted_at)
VALUES 
    ('USER001', 
     (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
     (SELECT id FROM questions WHERE question_text LIKE '田中君は今日12:30のランチで%' ORDER BY id DESC LIMIT 1),
     'B',  -- カレーと予測
     4,    -- 自信度4
     datetime('now')
    ),
    ('USER001',
     (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
     (SELECT id FROM questions WHERE question_text LIKE '田中君は今日のランチにいくら%' ORDER BY id DESC LIMIT 1),
     'B',  -- 501〜800円と予測
     5,    -- 自信度5
     datetime('now')
    ),
    ('USER001',
     (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1),
     (SELECT id FROM questions WHERE question_text LIKE '田中君はランチに出発%' ORDER BY id DESC LIMIT 1),
     'A',  -- 12:00〜12:15と予測
     3,    -- 自信度3
     datetime('now')
    );

-- 実行後の確認クエリ
-- SELECT * FROM events WHERE quiz_type = 'prediction';
-- SELECT * FROM questions WHERE event_id = (SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1);
-- SELECT * FROM prediction_answers WHERE user_id = 'USER001';
