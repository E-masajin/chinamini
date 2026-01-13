-- ゲーミフィケーション機能のマイグレーション

-- ユーザーポイントテーブル
CREATE TABLE IF NOT EXISTS user_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT,  -- 'correct_answer', 'confidence_bonus', 'streak_bonus', 'perfect_bonus'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- ユーザー総合ポイントテーブル（集計用）
CREATE TABLE IF NOT EXISTS user_total_points (
  user_id TEXT PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  monthly_points INTEGER NOT NULL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- バッジ定義テーブル
CREATE TABLE IF NOT EXISTS badge_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  badge_key TEXT UNIQUE NOT NULL,  -- 'prediction_master', 'streak_king', etc.
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- emoji or icon class
  condition_type TEXT NOT NULL,  -- 'correct_count', 'streak', 'confidence', 'perfect', 'speed'
  condition_value INTEGER NOT NULL,
  tier INTEGER DEFAULT 1,  -- 1: Bronze, 2: Silver, 3: Gold
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーバッジテーブル
CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  badge_id INTEGER NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (badge_id) REFERENCES badge_definitions(id),
  UNIQUE(user_id, badge_id)
);

-- ユーザー統計テーブル（バッジ判定用）
CREATE TABLE IF NOT EXISTS user_statistics (
  user_id TEXT PRIMARY KEY,
  total_predictions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  high_confidence_correct INTEGER DEFAULT 0,  -- 自信度5で正解した回数
  perfect_events INTEGER DEFAULT 0,  -- 全問正解したイベント数
  total_response_time INTEGER DEFAULT 0,  -- 合計回答時間（秒）
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_event_id ON user_points(event_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_total_points_total ON user_total_points(total_points DESC);

-- 初期バッジデータ挿入
INSERT OR IGNORE INTO badge_definitions (badge_key, name, description, icon, condition_type, condition_value, tier) VALUES
  ('prediction_master', '予測マスター', '10回以上正解した予測の達人', '🏆', 'correct_count', 10, 1),
  ('prediction_expert', '予測エキスパート', '50回以上正解した予測のプロ', '🥇', 'correct_count', 50, 2),
  ('prediction_legend', '予測レジェンド', '100回以上正解した予測の伝説', '👑', 'correct_count', 100, 3),
  
  ('streak_king', '連続正解王', '5連続正解を達成', '🔥', 'streak', 5, 1),
  ('streak_emperor', '連続正解皇帝', '10連続正解を達成', '⚡', 'streak', 10, 2),
  ('streak_god', '連続正解神', '20連続正解を達成', '✨', 'streak', 20, 3),
  
  ('confident', '自信家', '自信度5で5回正解', '💪', 'confidence', 5, 1),
  ('super_confident', '超自信家', '自信度5で20回正解', '💎', 'confidence', 20, 2),
  
  ('perfectionist', 'パーフェクト達成', '全問正解を3回達成', '🎯', 'perfect', 3, 1),
  ('super_perfectionist', 'スーパーパーフェクト', '全問正解を10回達成', '🌟', 'perfect', 10, 2),
  
  ('speed_master', '早解きマスター', '平均回答時間が短い', '⚡', 'speed', 5, 1);

-- コメント
-- user_points: イベントごとの獲得ポイント履歴
-- user_total_points: ユーザーの総合ポイント（集計用、高速検索用）
-- badge_definitions: バッジの定義（種類、条件）
-- user_badges: ユーザーが獲得したバッジ
-- user_statistics: ユーザーの統計情報（バッジ判定に使用）
