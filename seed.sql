-- テストイベント作成
INSERT INTO events (name, description, start_date, end_date, questions_per_user, is_active)
VALUES (
  'テストクイズ大会 2025',
  '期間限定・1回のみ回答可能なテストイベントです',
  datetime('now'),
  datetime('now', '+7 days'),
  10,
  1
);

-- サンプル問題（50問：問題群0-9に各5問ずつ）
-- 問題群0
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '日本の首都はどこですか？', '大阪', '東京', '京都', '名古屋', 'B', 0),
(1, '富士山の高さは約何メートルですか？', '2776m', '3776m', '4776m', '5776m', 'B', 0),
(1, '日本で一番大きい湖は？', '琵琶湖', '霞ヶ浦', '浜名湖', '猪苗代湖', 'A', 0),
(1, '日本の国花は？', '桜', '梅', '菊', 'バラ', 'A', 0),
(1, '日本の国鳥は？', 'ツル', 'キジ', 'スズメ', 'ハト', 'B', 0);

-- 問題群1
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '1+1の答えは？', '1', '2', '3', '4', 'B', 1),
(1, '円周率πの値に最も近いのは？', '2.14', '3.14', '4.14', '5.14', 'B', 1),
(1, '三角形の内角の和は？', '90度', '180度', '270度', '360度', 'B', 1),
(1, '2の3乗は？', '4', '6', '8', '10', 'C', 1),
(1, '正方形の辺の数は？', '3', '4', '5', '6', 'B', 1);

-- 問題群2
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, 'Pythonの作者は誰？', 'Guido van Rossum', 'Linus Torvalds', 'Dennis Ritchie', 'Bjarne Stroustrup', 'A', 2),
(1, 'HTMLの正式名称は？', 'HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'A', 2),
(1, 'JavaScriptが誕生した年は？', '1990', '1995', '2000', '2005', 'B', 2),
(1, 'GitHubが設立された年は？', '2006', '2008', '2010', '2012', 'B', 2),
(1, 'CSSの意味は？', 'Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets', 'B', 2);

-- 問題群3
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '地球は太陽系の何番目の惑星？', '2番目', '3番目', '4番目', '5番目', 'B', 3),
(1, '光の速度は約何km/秒？', '30万km/秒', '40万km/秒', '50万km/秒', '60万km/秒', 'A', 3),
(1, '水の化学式は？', 'CO2', 'H2O', 'O2', 'NaCl', 'B', 3),
(1, '人間の骨の数は約何本？', '106本', '206本', '306本', '406本', 'B', 3),
(1, '地球の赤道の長さは約何km？', '20,000km', '30,000km', '40,000km', '50,000km', 'C', 3);

-- 問題群4
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '東京オリンピックが開催された年は？（第一回）', '1964年', '1972年', '1984年', '1988年', 'A', 4),
(1, 'サッカーワールドカップの開催頻度は？', '2年ごと', '3年ごと', '4年ごと', '5年ごと', 'C', 4),
(1, 'オリンピックの五輪マークの色の数は？', '3色', '4色', '5色', '6色', 'C', 4),
(1, 'マラソンの距離は？', '32.195km', '42.195km', '52.195km', '62.195km', 'B', 4),
(1, '野球の1チームの人数は？', '8人', '9人', '10人', '11人', 'B', 4);

-- 問題群5
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '映画「タイタニック」の監督は？', 'スティーブン・スピルバーグ', 'ジェームズ・キャメロン', 'クリストファー・ノーラン', 'ジョージ・ルーカス', 'B', 5),
(1, '「千と千尋の神隠し」の監督は？', '宮崎駿', '細田守', '新海誠', '高畑勲', 'A', 5),
(1, 'ビートルズの出身国は？', 'アメリカ', 'イギリス', 'カナダ', 'オーストラリア', 'B', 5),
(1, '絵画「モナ・リザ」の作者は？', 'ピカソ', 'ゴッホ', 'ダ・ヴィンチ', 'モネ', 'C', 5),
(1, '「ハリー・ポッター」シリーズの作者は？', 'J.K.ローリング', 'スティーブン・キング', 'トールキン', 'C.S.ルイス', 'A', 5);

-- 問題群6
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '世界で最も人口が多い国は？', 'インド', '中国', 'アメリカ', 'インドネシア', 'A', 6),
(1, '世界で最も面積が広い国は？', 'カナダ', 'アメリカ', 'ロシア', '中国', 'C', 6),
(1, 'エッフェル塔がある都市は？', 'ロンドン', 'パリ', 'ローマ', 'ベルリン', 'B', 6),
(1, '自由の女神がある都市は？', 'ニューヨーク', 'ロサンゼルス', 'シカゴ', 'ボストン', 'A', 6),
(1, 'グレートバリアリーフがある国は？', 'ニュージーランド', 'オーストラリア', 'フィジー', 'タヒチ', 'B', 6);

-- 問題群7
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, '日本の元号「令和」が始まった年は？', '2017年', '2018年', '2019年', '2020年', 'C', 7),
(1, '第二次世界大戦が終結した年は？', '1943年', '1944年', '1945年', '1946年', 'C', 7),
(1, 'アメリカ合衆国の独立宣言は何年？', '1676年', '1776年', '1876年', '1976年', 'B', 7),
(1, '明治維新が起こった年は？', '1848年', '1858年', '1868年', '1878年', 'C', 7),
(1, 'ベルリンの壁が崩壊した年は？', '1985年', '1987年', '1989年', '1991年', 'C', 7);

-- 問題群8
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, 'コーヒーの原産地はどこ？', 'ブラジル', 'コロンビア', 'エチオピア', 'ベトナム', 'C', 8),
(1, '寿司のネタで「トロ」とは何の魚？', 'サーモン', 'マグロ', 'ブリ', 'タイ', 'B', 8),
(1, 'ワインの主な原料は？', 'リンゴ', 'ブドウ', 'イチゴ', '桃', 'B', 8),
(1, 'カレーの発祥国は？', '日本', 'タイ', 'インド', 'イギリス', 'C', 8),
(1, 'ピザの発祥国は？', 'イタリア', 'フランス', 'スペイン', 'ギリシャ', 'A', 8);

-- 問題群9
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_answer, pool_group)
VALUES 
(1, 'Amazon.comの創業者は？', 'イーロン・マスク', 'ビル・ゲイツ', 'ジェフ・ベゾス', 'マーク・ザッカーバーグ', 'C', 9),
(1, 'Appleの共同創業者は？', 'ラリー・ペイジ', 'スティーブ・ジョブズ', 'ビル・ゲイツ', 'ジェフ・ベゾス', 'B', 9),
(1, 'Teslaの創業者は？', 'イーロン・マスク', 'ジェフ・ベゾス', 'ビル・ゲイツ', 'ラリー・ペイジ', 'A', 9),
(1, 'Facebookの創業者は？', 'スティーブ・ジョブズ', 'ビル・ゲイツ', 'マーク・ザッカーバーグ', 'ラリー・ペイジ', 'C', 9),
(1, 'Googleの共同創業者の一人は？', 'イーロン・マスク', 'ラリー・ペイジ', 'ビル・ゲイツ', 'ジェフ・ベゾス', 'B', 9);
