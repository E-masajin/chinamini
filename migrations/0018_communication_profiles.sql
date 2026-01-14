-- コミュニケーション情報蓄積システム
-- 予測クイズの答え合わせ結果から人物のプロフィールを自動構築

-- 人物マスター（予測クイズの対象者）
CREATE TABLE IF NOT EXISTS person_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 人物名（例: 田中）
  department TEXT,                       -- 部署
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, department)
);

-- 人物の特性記録（答え合わせ結果から蓄積）
CREATE TABLE IF NOT EXISTS person_traits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,            -- 対象人物
  category TEXT NOT NULL,                -- カテゴリ（例: lunch, hobby, schedule, preference）
  attribute TEXT NOT NULL,               -- 属性（例: favorite_food, work_habit）
  value TEXT NOT NULL,                   -- 値（例: ラーメン）
  occurrence_count INTEGER DEFAULT 1,    -- 出現回数（同じ値が複数回出現した場合）
  source_question_id INTEGER,            -- 元の問題ID
  first_observed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_observed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person_profiles(id),
  FOREIGN KEY (source_question_id) REFERENCES questions(id)
);

-- 人物の洞察（特性を集約した会話のきっかけ）
CREATE TABLE IF NOT EXISTS person_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  insight_type TEXT NOT NULL,            -- タイプ（例: conversation_starter, shared_interest, pattern）
  title TEXT NOT NULL,                   -- タイトル（例: ラーメン好き）
  description TEXT NOT NULL,             -- 説明（例: 田中さんはラーメンをよく食べます）
  conversation_hints TEXT,               -- 会話のヒント（JSON形式の配列）
  confidence_score REAL DEFAULT 0,       -- 信頼度スコア（0-1）
  trait_count INTEGER DEFAULT 1,         -- 根拠となる特性の数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person_profiles(id)
);

-- 予測問題と人物の関連付け
CREATE TABLE IF NOT EXISTS question_person_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  person_id INTEGER NOT NULL,
  extracted_category TEXT,               -- 問題から抽出されたカテゴリ
  extracted_attribute TEXT,              -- 問題から抽出された属性
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (person_id) REFERENCES person_profiles(id),
  UNIQUE(question_id, person_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_person_traits_person ON person_traits(person_id);
CREATE INDEX IF NOT EXISTS idx_person_traits_category ON person_traits(category);
CREATE INDEX IF NOT EXISTS idx_person_insights_person ON person_insights(person_id);
CREATE INDEX IF NOT EXISTS idx_question_person_mapping_question ON question_person_mapping(question_id);
CREATE INDEX IF NOT EXISTS idx_question_person_mapping_person ON question_person_mapping(person_id);
