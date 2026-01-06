-- knowledge_baseテーブルにcategoryカラムを追加
ALTER TABLE knowledge_base ADD COLUMN category TEXT DEFAULT 'knowledge';
