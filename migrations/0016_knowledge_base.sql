-- 知識ベーステーブル（情報インプット用）

CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT,
  category_id INTEGER,
  uploaded_by TEXT,
  uploaded_at DATETIME,
  file_url TEXT,
  last_updated DATETIME
);

-- 知識ベースから生成された問題の関連付けテーブル
CREATE TABLE IF NOT EXISTS knowledge_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  knowledge_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  created_at DATETIME
);

-- knowledge_baseのインデックス追加
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category_id);

-- knowledge_questionsのインデックス追加
CREATE INDEX IF NOT EXISTS idx_knowledge_questions ON knowledge_questions(knowledge_id, question_id);
