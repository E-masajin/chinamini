-- 問題にカテゴリ（文字列）を追加
-- 既存のcategory_idに加えて、カテゴリ名を直接保存するためのカラム
ALTER TABLE questions ADD COLUMN category TEXT DEFAULT 'knowledge';


