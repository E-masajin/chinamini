-- 問題カテゴリテーブル
CREATE TABLE IF NOT EXISTS question_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- アイコン名（社史、ナレッジなど）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 問題テーブルにカテゴリと詳細情報を追加
ALTER TABLE questions ADD COLUMN category_id INTEGER REFERENCES question_categories(id);
ALTER TABLE questions ADD COLUMN source_material TEXT; -- 元資料（AI生成時のソース）
ALTER TABLE questions ADD COLUMN detailed_explanation TEXT; -- 深い知識・詳細説明
ALTER TABLE questions ADD COLUMN importance_level INTEGER DEFAULT 3; -- 重要度（1-5）

-- 問題統計テーブル（分析用）
CREATE TABLE IF NOT EXISTS question_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  total_answers INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate REAL DEFAULT 0.0, -- 正解率
  avg_answer_time INTEGER DEFAULT 0, -- 平均回答時間（秒）
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, event_id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- ナレッジベーステーブル（資産化されたコンテンツ）
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_question_id INTEGER, -- 元になった問題
  recognition_rate REAL, -- 認識度（正解率から算出）
  value_score INTEGER, -- 価値スコア（1-5）
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES question_categories(id),
  FOREIGN KEY (source_question_id) REFERENCES questions(id)
);

-- デフォルトカテゴリの挿入
INSERT INTO question_categories (name, description, icon) VALUES
  ('社史', '会社の歴史、創業エピソード、沿革', 'fa-building'),
  ('製品知識', '主力商品、サービス、技術', 'fa-box'),
  ('コンプライアンス', '規則、法令、社内ルール', 'fa-gavel'),
  ('人物', '社員プロフィール、趣味、経歴', 'fa-user'),
  ('業務知識', 'ワークフロー、ツール、ベストプラクティス', 'fa-briefcase'),
  ('その他', '一般知識、雑学', 'fa-question-circle');

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_question_statistics_accuracy ON question_statistics(accuracy_rate);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON knowledge_base(status);
