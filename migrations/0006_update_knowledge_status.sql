-- knowledge_baseテーブルのステータス制約を更新
-- 既存のテーブルを削除して再作成（ALTER TABLE CHECK制約を変更できないため）

-- 一時テーブルにデータをバックアップ（存在する場合のみ）
CREATE TABLE knowledge_base_backup AS 
SELECT id, category_id, title, content, 
       COALESCE(category, 'knowledge') as category,
       source_question_id, recognition_rate, value_score, 
       status, created_at, updated_at 
FROM knowledge_base WHERE 1=1;

-- 既存テーブルを削除
DROP TABLE knowledge_base;

-- 新しい制約でテーブルを再作成
CREATE TABLE knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'knowledge',
  source_question_id INTEGER,
  recognition_rate REAL,
  value_score INTEGER,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'published', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES question_categories(id),
  FOREIGN KEY (source_question_id) REFERENCES questions(id)
);

-- データを復元
INSERT INTO knowledge_base (id, category_id, title, content, category, source_question_id, recognition_rate, value_score, status, created_at, updated_at)
SELECT id, category_id, title, content, category, source_question_id, recognition_rate, value_score, status, created_at, updated_at
FROM knowledge_base_backup;

-- バックアップテーブルを削除
DROP TABLE knowledge_base_backup;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON knowledge_base(status);

