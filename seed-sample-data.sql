-- ==================== サンプルデータ ====================
-- プロトタイプ用のデモデータ

-- ==================== 1. ナレッジ管理 ====================

-- 社史カテゴリ (category_id = 1: company_history)
INSERT INTO knowledge_base (category_id, title, content, category, status, value_score, recognition_rate) VALUES
(1, '創業の原点', '2005年、渋谷の小さなオフィスで3人からスタート。「テクノロジーで人々の生活を豊かにする」という理念のもと、最初のプロダクトを開発。創業メンバーの田中、山田、佐藤は大学の同期で、学生時代からアプリ開発に情熱を注いでいた。', 'company_history', 'published', 5, 78),
(1, '上場への道のり', '2015年、創業10年目に東証マザーズ上場を達成。社員数50名から300名へと成長。IPO時の時価総額は500億円。この成功の裏には、2012年の主力サービスローンチと、2014年の大型資金調達があった。', 'company_history', 'published', 5, 65),
(1, '社名の由来', '「イノベーション」と「コネクション」を組み合わせた造語。人と人、技術と生活をつなげるという思いが込められている。創業時に100以上の候補から、創業メンバー3人の投票で決定された。', 'company_history', 'published', 4, 82),
(1, '初代オフィスの思い出', '創業時のオフィスは渋谷のマンションの一室。6畳の部屋に3人が詰め込んで開発していた。エアコンが故障した夏、窓全開で汗だくになりながらコーディングしたエピソードは今も語り草。', 'company_history', 'published', 3, 45),
(1, 'ロゴマークの変遷', '創立以来3回のロゴ変更を経験。初代は手書き風、2代目はシンプルな文字ロゴ、現在の3代目は「つながり」を表現した円形デザイン。各ロゴにはその時代の会社の姿勢が反映されている。', 'company_history', 'published', 3, 55);

-- ナレッジカテゴリ（業務知識）(category_id = 2: knowledge)
INSERT INTO knowledge_base (category_id, title, content, category, status, value_score, recognition_rate) VALUES
(2, '経費精算のルール', '経費申請は月末締め翌月10日払い。5,000円以上は領収書必須。交通費はICカード履歴でもOK。接待費は事前申請が必要。申請漏れは翌月以降でも可能だが、3ヶ月以上経過すると部長承認が必要。', 'knowledge', 'published', 5, 92),
(2, '有給休暇の取得方法', '申請は3営業日前まで。半休は午前休（9:00-13:00）と午後休（14:00-18:00）の2種類。時間有給は1時間単位で取得可能。年間5日以上の取得が義務付けられている。', 'knowledge', 'published', 5, 88),
(2, '会議室予約システム', 'Googleカレンダーから予約。大会議室（20名）は2週間前から、小会議室（6名）は1週間前から予約可能。30分以上の遅延は自動キャンセル。Webex/Zoomの自動発行機能あり。', 'knowledge', 'published', 4, 75),
(2, 'リモートワーク規定', '週3日まで在宅勤務可能。申請は前日17時まで。コアタイム（10:00-15:00）はオンライン必須。通信費補助として月額3,000円支給。セキュリティ研修の受講が必須条件。', 'knowledge', 'published', 4, 70),
(2, '備品購入フロー', '1万円未満は部署予算から直接購入可。1万円以上5万円未満は課長承認。5万円以上は部長承認が必要。発注はAmazonビジネスまたは指定業者から。納品は原則オフィス受け取り。', 'knowledge', 'published', 3, 60),
(2, '新入社員研修プログラム', '入社後2週間は集合研修。ビジネスマナー、会社理念、各部署紹介。3週目からOJT開始。メンター制度あり。3ヶ月後にフォローアップ研修。入社1年後に振り返り面談を実施。', 'knowledge', 'published', 4, 55);

-- コミュニケーション（人物情報）カテゴリ (category_id = 3: communication)
INSERT INTO knowledge_base (category_id, title, content, category, status, value_score, recognition_rate) VALUES
(3, '山田部長の特徴', '営業部部長。毎朝7時出社、コーヒーは必ずブラック。趣味は登山とマラソン。休日は家族と過ごすことが多い。部下思いで、月1回は必ず1on1を実施。「まず動け、考えるのはその後」が口癖。', 'communication', 'published', 4, 68),
(3, '佐藤さんの専門分野', '開発部のテックリード。フロントエンド専門でReactのエキスパート。社内勉強会を月1で主催。質問には丁寧に答えてくれる。好物はカレーで、週3でカレーを食べている。', 'communication', 'published', 4, 72),
(3, '田中課長への相談方法', '経理課長。数字に厳しいが、事前相談には柔軟に対応してくれる。メールより直接相談を好む。お昼は必ず12時ジャストに取る。甘いものが好きで、デスクにはいつもお菓子がある。', 'communication', 'published', 3, 58),
(3, '鈴木さんとの関わり方', '人事部採用担当。新卒・中途採用の窓口。面接対応で忙しい曜日は火・木。相談は月・水・金の午前中がベスト。趣味はヨガで、社内サークル「朝ヨガ部」の部長。', 'communication', 'published', 3, 45);

-- コンプライアンス (category_id = 5: compliance)
INSERT INTO knowledge_base (category_id, title, content, category, status, value_score, recognition_rate) VALUES
(5, '情報セキュリティ基本方針', 'パスワードは12文字以上、3ヶ月毎に変更。社外へのファイル送信は暗号化必須。USBメモリの使用は原則禁止。不審メールは開かずに情報システム部へ報告。違反時は厳重注意、重大な場合は懲戒対象。', 'compliance', 'published', 5, 85),
(5, 'SNS利用ガイドライン', '社名を出した投稿は原則禁止。業務情報の投稿は厳禁。プライベートアカウントでも会社への批判は控える。インフルエンサー活動は事前申請が必要。炎上時は広報部へ即連絡。', 'compliance', 'published', 4, 70);

-- ==================== 2. いつでもクイズ用サンプル問題 ====================

-- 既存のテストイベント（ID:1）に問題を追加
INSERT OR IGNORE INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group, category_id, source_material, detailed_explanation) VALUES
-- 社史問題
(1, '当社が創業したのは何年ですか？', '2003年', '2005年', '2007年', '2010年', 'B', 0, 1, '創業の原点', '渋谷の小さなオフィスで3人からスタートしました。'),
(1, '創業メンバーは何人でしたか？', '2人', '3人', '4人', '5人', 'B', 1, 1, '創業の原点', '田中、山田、佐藤の3人が大学の同期として創業しました。'),
(1, '上場したのは創業何年目ですか？', '5年目', '8年目', '10年目', '12年目', 'C', 2, 1, '上場への道のり', '2015年、創業10年目に東証マザーズ上場を達成しました。'),

-- 業務知識問題
(1, '経費申請で領収書が必須となる金額はいくら以上ですか？', '1,000円', '3,000円', '5,000円', '10,000円', 'C', 3, 2, '経費精算のルール', '5,000円以上の経費には領収書が必要です。'),
(1, '有給休暇の申請は何営業日前までに必要ですか？', '当日', '1営業日前', '3営業日前', '1週間前', 'C', 4, 2, '有給休暇の取得方法', '申請は3営業日前までに行う必要があります。'),
(1, 'リモートワークは週何日まで可能ですか？', '1日', '2日', '3日', '5日', 'C', 5, 2, 'リモートワーク規定', '週3日まで在宅勤務が可能です。'),
(1, '備品購入で課長承認が必要となる金額範囲は？', '5千円〜1万円', '1万円〜5万円', '5万円〜10万円', '10万円以上', 'B', 6, 2, '備品購入フロー', '1万円以上5万円未満は課長承認が必要です。'),

-- セキュリティ問題
(1, 'パスワードの最低文字数は何文字ですか？', '8文字', '10文字', '12文字', '16文字', 'C', 7, 5, '情報セキュリティ基本方針', 'パスワードは12文字以上が必要です。'),
(1, 'パスワードの変更頻度は？', '1ヶ月毎', '3ヶ月毎', '6ヶ月毎', '1年毎', 'B', 8, 5, '情報セキュリティ基本方針', '3ヶ月毎に変更が必要です。'),

-- 人物問題
(1, '山田部長の趣味は何ですか？', 'ゴルフとテニス', '登山とマラソン', '釣りとキャンプ', '読書と映画', 'B', 9, 3, '山田部長の特徴', '登山とマラソンが趣味で、休日は家族と過ごすことが多いです。');

-- ==================== 3. クイズ○○後用サンプルイベント・問題 ====================

-- 予測クイズイベント作成
INSERT OR IGNORE INTO events (id, name, description, start_date, end_date, questions_per_user, is_active, mode, min_participants, quiz_type) VALUES
(3, '田中君のランチ予測', '田中君の今日のランチを予測しよう！毎日答え合わせで盛り上がる！', datetime('now'), datetime('now', '+7 days'), 5, 1, 'individual', 1, 'prediction');

-- 予測問題（田中君のランチシリーズ）
INSERT OR IGNORE INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group, prediction_date, verification_source, is_verified, category_id, source_material) VALUES
(3, '田中君は今日のランチで何を食べるでしょうか？', 'ラーメン', 'カレー', 'そば', 'おにぎり', 'A', 0, datetime('now', '+2 hours'), 'manual', 1, 6, '予測問題'),
(3, '田中君は明日のランチで何を選ぶでしょうか？', 'ラーメン', '牛丼', 'パスタ', 'サラダ', 'PENDING', 0, datetime('now', '+1 day'), 'manual', 0, 6, '予測問題'),
(3, '田中君が今週一番食べそうなのは？', 'ラーメン', 'カレー', '定食', 'コンビニ弁当', 'PENDING', 0, datetime('now', '+5 days'), 'manual', 0, 6, '予測問題');

-- 別の予測イベント
INSERT OR IGNORE INTO events (id, name, description, start_date, end_date, questions_per_user, is_active, mode, min_participants, quiz_type) VALUES
(4, '今週の営業成績予測', '今週の営業チームの成績を予測！当たったらポイントゲット！', datetime('now'), datetime('now', '+7 days'), 3, 1, 'individual', 1, 'prediction');

INSERT OR IGNORE INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group, prediction_date, verification_source, is_verified, category_id, source_material) VALUES
(4, '今週の新規契約数は何件になるでしょうか？', '0〜2件', '3〜5件', '6〜8件', '9件以上', 'PENDING', 0, datetime('now', '+5 days'), 'manual', 0, 6, '予測問題'),
(4, '今週のMVPは誰になるでしょうか？', '山田さん', '佐藤さん', '鈴木さん', '高橋さん', 'PENDING', 0, datetime('now', '+5 days'), 'manual', 0, 6, '予測問題');

-- ==================== 4. コミュニケーション情報（人物プロフィール） ====================

-- 人物マスター
INSERT OR IGNORE INTO person_profiles (id, name, department) VALUES
(1, '田中', '営業部'),
(2, '山田', '営業部'),
(3, '佐藤', '開発部'),
(4, '鈴木', '人事部'),
(5, '高橋', '経理部');

-- 人物の特性（答え合わせ結果から蓄積されたイメージ）
INSERT OR IGNORE INTO person_traits (person_id, category, attribute, value, occurrence_count, first_observed_at, last_observed_at) VALUES
-- 田中さん
(1, 'lunch', 'food', 'ラーメン', 5, datetime('now', '-30 days'), datetime('now', '-1 day')),
(1, 'lunch', 'food', 'カレー', 2, datetime('now', '-20 days'), datetime('now', '-5 days')),
(1, 'preference', 'drink', 'コーヒー（ブラック）', 3, datetime('now', '-25 days'), datetime('now', '-2 days')),
(1, 'schedule', 'time', '12:30ランチ', 4, datetime('now', '-28 days'), datetime('now', '-1 day')),

-- 山田さん
(2, 'hobby', 'activity', '登山', 3, datetime('now', '-60 days'), datetime('now', '-10 days')),
(2, 'schedule', 'time', '7:00出社', 6, datetime('now', '-90 days'), datetime('now', '-1 day')),
(2, 'preference', 'drink', 'コーヒー（ブラック）', 4, datetime('now', '-80 days'), datetime('now', '-3 days')),

-- 佐藤さん
(3, 'lunch', 'food', 'カレー', 8, datetime('now', '-45 days'), datetime('now', '-1 day')),
(3, 'hobby', 'activity', 'プログラミング勉強会', 4, datetime('now', '-60 days'), datetime('now', '-7 days')),
(3, 'preference', 'item', 'React', 5, datetime('now', '-90 days'), datetime('now', '-5 days')),

-- 鈴木さん
(4, 'hobby', 'activity', 'ヨガ', 6, datetime('now', '-120 days'), datetime('now', '-3 days')),
(4, 'schedule', 'time', '朝ヨガ 7:30', 5, datetime('now', '-100 days'), datetime('now', '-2 days')),

-- 高橋さん
(5, 'preference', 'food', '甘いもの', 4, datetime('now', '-50 days'), datetime('now', '-5 days')),
(5, 'schedule', 'time', '12:00ジャストランチ', 7, datetime('now', '-90 days'), datetime('now', '-1 day'));

-- 洞察（会話のきっかけ）
INSERT OR IGNORE INTO person_insights (person_id, insight_type, title, description, conversation_hints, confidence_score, trait_count) VALUES
-- 田中さんの洞察
(1, 'conversation_starter', 'ラーメン好き', '田中さんはランチでラーメンをよく食べます（5回確認）', '["田中さん、ラーメン好きなんですね！オススメの店ありますか？", "今度一緒にラーメン食べに行きませんか？", "近くに美味しいラーメン屋見つけたんですけど、行ってみません？"]', 1.0, 5),
(1, 'pattern', '12:30ランチ派', '田中さんは12:30頃にランチを取ることが多いです（4回確認）', '["田中さん、お昼一緒にどうですか？12:30くらいに行きません？"]', 0.8, 4),

-- 山田さんの洞察
(2, 'shared_interest', '登山好き', '山田部長の趣味は登山です（3回確認）', '["山田部長、最近どこか登りましたか？", "登山のオススメスポットありますか？", "今度の連休、山行く予定ありますか？"]', 0.6, 3),
(2, 'pattern', '早朝出社派', '山田部長は毎朝7時に出社します（6回確認）', '["山田部長、朝早いですね！秘訣ありますか？"]', 1.0, 6),

-- 佐藤さんの洞察
(3, 'conversation_starter', 'カレー大好き', '佐藤さんはカレーをよく食べます（8回確認）週3ペース！', '["佐藤さん、カレー好きですよね！オススメどこですか？", "神田のカレー屋さん知ってます？行ってみません？", "自分でカレー作ったりします？"]', 1.0, 8),
(3, 'shared_interest', 'Reactエキスパート', '佐藤さんはReactの専門家で勉強会も主催しています', '["React で困ってるんですけど、ちょっと聞いていいですか？", "今度の勉強会、参加していいですか？", "最近のReactのトレンドってどうなんですか？"]', 1.0, 5),

-- 鈴木さんの洞察
(4, 'shared_interest', 'ヨガインストラクター級', '鈴木さんはヨガが趣味で朝ヨガ部の部長です', '["鈴木さん、朝ヨガ部入れてもらえますか？", "ヨガ始めたいんですけど、初心者でも大丈夫ですか？", "体硬いんですけど、できますかね？"]', 1.0, 6),

-- 高橋さんの洞察
(5, 'conversation_starter', '甘党', '高橋課長は甘いものが好きでデスクにはいつもお菓子があります', '["高橋さん、そのお菓子美味しそうですね！どこのですか？", "駅前に新しいスイーツ屋できましたよ！", "お土産買ってきたんですけど、甘いもの大丈夫ですか？"]', 0.8, 4),
(5, 'pattern', '12時ジャストランチ', '高橋課長は必ず12時ジャストにランチを取ります', '["高橋さん、12時になったらお昼行きましょう！"]', 1.0, 7);

-- ==================== 5. 参加者・回答サンプル ====================

-- サンプルユーザー
INSERT OR IGNORE INTO users (user_id, name, team_name, company_name) VALUES
('user001', '山本太郎', 'Aチーム', '株式会社サンプル'),
('user002', '鈴木花子', 'Aチーム', '株式会社サンプル'),
('user003', '佐々木一郎', 'Bチーム', '株式会社サンプル'),
('user004', '田村美咲', 'Bチーム', '株式会社サンプル'),
('user005', '中村健太', 'Cチーム', '株式会社サンプル');

-- 参加状況
INSERT OR IGNORE INTO user_event_status (user_id, event_id, has_completed, score, completed_at, started_at, answer_duration, has_participated) VALUES
('user001', 1, 1, 8, datetime('now', '-2 days'), datetime('now', '-2 days', '-5 minutes'), 180, 1),
('user002', 1, 1, 7, datetime('now', '-1 day'), datetime('now', '-1 day', '-3 minutes'), 120, 1),
('user003', 1, 1, 9, datetime('now', '-3 days'), datetime('now', '-3 days', '-4 minutes'), 150, 1),
('user004', 1, 1, 6, datetime('now', '-1 day'), datetime('now', '-1 day', '-6 minutes'), 210, 1),
('user005', 1, 1, 10, datetime('now', '-4 hours'), datetime('now', '-4 hours', '-2 minutes'), 90, 1);

-- ユーザーポイント
INSERT OR IGNORE INTO user_total_points (user_id, total_points, weekly_points, monthly_points, last_updated) VALUES
('user001', 850, 150, 400, datetime('now')),
('user002', 720, 120, 350, datetime('now')),
('user003', 950, 200, 500, datetime('now')),
('user004', 580, 80, 280, datetime('now')),
('user005', 1100, 250, 600, datetime('now'));

-- バッジ付与
INSERT OR IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES
('user005', 1, datetime('now', '-1 day')),  -- クイズマスター
('user003', 2, datetime('now', '-2 days')), -- スピードスター
('user001', 3, datetime('now', '-3 days')); -- 連続正解

-- 予測回答サンプル
INSERT OR IGNORE INTO prediction_answers (user_id, question_id, event_id, predicted_answer, predicted_at, actual_answer, is_correct, verified_at, confidence_level) VALUES
('user001', (SELECT id FROM questions WHERE question_text LIKE '田中君は今日のランチ%' LIMIT 1), 3, 'A', datetime('now', '-2 hours'), 'A', 1, datetime('now', '-30 minutes'), 4),
('user002', (SELECT id FROM questions WHERE question_text LIKE '田中君は今日のランチ%' LIMIT 1), 3, 'B', datetime('now', '-2 hours'), 'A', 0, datetime('now', '-30 minutes'), 3),
('user003', (SELECT id FROM questions WHERE question_text LIKE '田中君は今日のランチ%' LIMIT 1), 3, 'A', datetime('now', '-1 hour'), 'A', 1, datetime('now', '-30 minutes'), 5);

-- 統計サンプル
INSERT OR IGNORE INTO prediction_statistics (user_id, event_id, total_predictions, correct_predictions, accuracy_rate, avg_confidence) VALUES
('user001', 3, 5, 4, 80.0, 4.2),
('user002', 3, 5, 2, 40.0, 3.0),
('user003', 3, 5, 5, 100.0, 4.8);
