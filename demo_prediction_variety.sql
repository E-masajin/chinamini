-- デモ用：多様な未来予測型クイズ（5種類）
-- ユーザーが色々な予測クイズを選択できるようにします

-- =====================================================
-- 1. 田中君のランチ予測（既存）
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '田中君のランチ予測',
    '田中君が今日のランチで何を食べるか予測しよう！当たった人にはプチ賞品あり🎁',
    datetime('now'),
    datetime('now', '+7 days'),
    'individual',
    'prediction',
    1,
    3,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES 
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6, 
     '田中君は今日12:30のランチで何を食べるでしょうか？', 'ラーメン', 'カレー', 'そば', 'おにぎり', 'A', 
     '田中君は毎週月曜日はラーメンを食べることが多い傾向があります。', 1, datetime('now', '+2 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6,
     '田中君は今日のランチにいくら使うでしょうか？', '500円以下', '501〜800円', '801〜1000円', '1001円以上', 'B',
     '田中君の平均ランチ予算は700円前後です。', 1, datetime('now', '+2 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '田中君のランチ予測' ORDER BY id DESC LIMIT 1), 6,
     '田中君はランチに出発する時刻は何時でしょうか？', '12:00〜12:15', '12:16〜12:30', '12:31〜12:45', '12:46以降', 'A',
     '田中君はお腹が空くと早めに行動します。', 1, datetime('now', '+2 hours'), 'manual', 0);

-- =====================================================
-- 2. 明日の天気予測
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '明日の天気予測',
    '明日の天気はどうなる？気象予報士になった気分で予測してみよう！☀️🌧️',
    datetime('now'),
    datetime('now', '+7 days'),
    'individual',
    'prediction',
    1,
    4,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES 
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の東京の最高気温は何度でしょうか？', '10度未満', '10〜15度', '16〜20度', '21度以上', 'B',
     '1月の東京の平均最高気温は10〜15度程度です。', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0),
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の東京の天気は？', '晴れ', '曇り', '雨', '雪', 'A',
     '冬の関東は晴天が多い季節です。', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0),
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の降水確率は？', '0〜20%', '21〜50%', '51〜80%', '81〜100%', 'A',
     '冬の関東は乾燥している日が多いです。', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0),
    ((SELECT id FROM events WHERE name = '明日の天気予測' ORDER BY id DESC LIMIT 1), 6,
     '明日の最低気温は何度でしょうか？', '0度未満', '0〜5度', '6〜10度', '11度以上', 'B',
     '1月の東京の最低気温は5度前後が多いです。', 1, datetime('now', '+1 day', '+12 hours'), 'weather_api', 0);

-- =====================================================
-- 3. 営業チームの今日の成績予測
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '営業チームの今日の成績予測',
    '営業チームは今日何件の受注を獲得する？目標達成なるか！📊',
    datetime('now'),
    datetime('now', '+1 day'),
    'individual',
    'prediction',
    1,
    3,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES 
    ((SELECT id FROM events WHERE name = '営業チームの今日の成績予測' ORDER BY id DESC LIMIT 1), 6,
     '営業チームは今日何件の受注を獲得するでしょうか？', '0〜2件', '3〜5件', '6〜8件', '9件以上', 'C',
     '月曜日は週初めで活動が活発です。', 1, datetime('now', '+8 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '営業チームの今日の成績予測' ORDER BY id DESC LIMIT 1), 6,
     '今日のトップセールスは誰でしょうか？', '佐藤さん', '鈴木さん', '高橋さん', '田中さん', 'A',
     '佐藤さんは今月好調です。', 1, datetime('now', '+8 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '営業チームの今日の成績予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の総売上金額は？', '50万円未満', '50〜100万円', '101〜200万円', '201万円以上', 'B',
     '平均的な日の売上は50〜100万円程度です。', 1, datetime('now', '+8 hours'), 'manual', 0);

-- =====================================================
-- 4. 自販機人気ランキング予測
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '自販機人気ランキング予測',
    '今日の休憩時間、自販機で何が一番売れる？人気商品を当てよう！☕',
    datetime('now'),
    datetime('now', '+1 day'),
    'individual',
    'prediction',
    1,
    4,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES 
    ((SELECT id FROM events WHERE name = '自販機人気ランキング予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の休憩時間（15時）、自販機で一番売れる飲み物は？', 'コーヒー', 'お茶', 'コーラ', 'エナジードリンク', 'A',
     '午後の休憩時間はコーヒーが人気です。', 1, datetime('now', '+6 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '自販機人気ランキング予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の自販機での購入数は何本でしょうか？', '10本未満', '10〜20本', '21〜30本', '31本以上', 'B',
     '社員30人の会社では15本前後が平均です。', 1, datetime('now', '+6 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '自販機人気ランキング予測' ORDER BY id DESC LIMIT 1), 6,
     '今日、一番最初に自販機を使うのは誰でしょうか？', '山田さん', '佐々木さん', '伊藤さん', '渡辺さん', 'A',
     '山田さんは毎朝早く出社します。', 1, datetime('now', '+1 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '自販機人気ランキング予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の自販機売上TOP3に入るのは？', 'コーヒー、お茶、水', 'コーヒー、コーラ、お茶', 'お茶、水、コーヒー', 'エナジードリンク、コーヒー、お茶', 'B',
     'コーヒーとコーラは常に人気です。', 1, datetime('now', '+6 hours'), 'manual', 0);

-- =====================================================
-- 5. 会議終了時刻予測
-- =====================================================
INSERT INTO events (name, description, start_date, end_date, mode, quiz_type, is_active, questions_per_user, min_participants)
VALUES (
    '会議終了時刻予測',
    '今日の全社会議、予定通り終わる？それとも延長？⏰',
    datetime('now'),
    datetime('now', '+1 day'),
    'individual',
    'prediction',
    1,
    3,
    1
);

INSERT INTO questions (event_id, category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, detailed_explanation, pool_group, prediction_date, verification_source, is_verified)
VALUES 
    ((SELECT id FROM events WHERE name = '会議終了時刻予測' ORDER BY id DESC LIMIT 1), 6,
     '14時開始の営業会議は何時に終わるでしょうか？（予定は15時）', '14:30〜14:45', '14:46〜15:00', '15:01〜15:15', '15:16以降', 'C',
     '会議は予定より5〜15分延びることが多いです。', 1, datetime('now', '+4 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '会議終了時刻予測' ORDER BY id DESC LIMIT 1), 6,
     '今日の会議で一番長く話すのは誰でしょうか？', '部長', '課長', '主任', 'プロジェクトリーダー', 'A',
     '部長は報告事項が多いです。', 1, datetime('now', '+4 hours'), 'manual', 0),
    ((SELECT id FROM events WHERE name = '会議終了時刻予測' ORDER BY id DESC LIMIT 1), 6,
     '会議での最初の議題は何でしょうか？', '先月の売上報告', '新商品の企画', '人事異動の発表', '予算の見直し', 'A',
     '月初は前月の振り返りから始まることが多いです。', 1, datetime('now', '+2 hours'), 'manual', 0);

-- 実行後の確認クエリ
-- SELECT name, description, quiz_type, questions_per_user FROM events WHERE quiz_type = 'prediction' ORDER BY id;
-- SELECT COUNT(*) as total_questions FROM questions WHERE event_id IN (SELECT id FROM events WHERE quiz_type = 'prediction');
