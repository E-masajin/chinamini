/**
 * 型定義ファイル
 * プロジェクト全体で使用する型を定義
 */

// ==================== データベースモデル ====================

/**
 * イベント
 */
export interface Event {
  id: number
  name: string
  description: string | null
  start_date: string
  end_date: string
  questions_per_user: number
  mode: 'individual' | 'team' | 'company'
  min_participants: number
  quiz_type: 'async' | 'prediction'
  is_active: number
  created_at: string
}

/**
 * 問題
 */
export interface Question {
  id: number
  event_id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'PENDING'
  pool_group: number
  category_id: number | null
  source_material: string | null
  detailed_explanation: string | null
  prediction_date: string | null
  verification_source: string | null
  is_verified: number
  answer_type: 'multiple_choice' | 'free_text'
  question_type: string | null
  retention_policy: string | null
  created_at: string
}

/**
 * ユーザー
 */
export interface User {
  id: number
  user_id: string
  name: string
  team_name: string | null
  company_name: string | null
  created_at: string
}

/**
 * 回答
 */
export interface Answer {
  id: number
  user_id: string
  event_id: number
  question_id: number
  user_answer: string
  is_correct: number
  answered_at: string
}

/**
 * ユーザーイベントステータス
 */
export interface UserEventStatus {
  id: number
  user_id: string
  event_id: number
  has_completed: number
  has_participated: number
  score: number
  started_at: string | null
  completed_at: string | null
  participated_at: string | null
  answer_duration: number | null
  questions_count: number | null
}

/**
 * 管理者
 */
export interface Admin {
  id: number
  username: string
  password_hash: string
  password_salt: string | null
  created_at: string
  updated_at: string | null
  last_login_at: string | null
  is_active: number
  failed_login_attempts: number
  locked_until: string | null
}

/**
 * 管理者セッション
 */
export interface AdminSession {
  id: number
  admin_id: number
  session_token: string
  created_at: string
  expires_at: string
  last_activity: string
  ip_address: string | null
  user_agent: string | null
  is_valid: number
}

// ==================== API リクエスト/レスポンス ====================

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  userId: string
  name?: string
  teamName?: string
  companyName?: string
}

/**
 * 回答送信リクエスト
 */
export interface SubmitAnswersRequest {
  userId: string
  answers: Array<{
    questionId: number
    userAnswer: string
  }>
}

/**
 * 回答結果
 */
export interface SubmitAnswersResponse {
  score: number
  total: number
  answerDuration: number
  results: Array<{
    questionId: number
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
  }>
}

/**
 * ランキングエントリ（個人）
 */
export interface IndividualRankingEntry {
  user_id: string
  name: string
  team_name: string | null
  company_name: string | null
  score: number
  completed_at: string
  answer_duration: number
}

/**
 * ランキングエントリ（チーム/企業）
 */
export interface GroupRankingEntry {
  team_name?: string
  company_name?: string
  member_count: number
  avg_accuracy: number
  avg_duration: number
}

// ==================== ゲーミフィケーション ====================

/**
 * バッジ定義
 */
export interface BadgeDefinition {
  id: number
  badge_key: string
  name: string
  description: string | null
  icon: string | null
  condition_type: string
  condition_value: number
  tier: number
  created_at: string
}

/**
 * ユーザーバッジ
 */
export interface UserBadge {
  id: number
  user_id: string
  badge_id: number
  earned_at: string
}

/**
 * ユーザー統計
 */
export interface UserStatistics {
  user_id: string
  total_predictions: number
  total_correct: number
  current_streak: number
  max_streak: number
  high_confidence_correct: number
  perfect_events: number
  total_response_time: number
  last_updated: string
}

/**
 * ユーザーポイント
 */
export interface UserTotalPoints {
  user_id: string
  total_points: number
  weekly_points: number
  monthly_points: number
  last_updated: string
}

// ==================== 予測クイズ ====================

/**
 * 予測回答
 */
export interface PredictionAnswer {
  id: number
  user_id: string
  question_id: number
  event_id: number
  predicted_answer: string | null
  free_text_answer: string | null
  actual_answer: string | null
  is_correct: number | null
  confidence_level: number | null
  predicted_at: string
  verified_at: string | null
}

/**
 * 予測統計
 */
export interface PredictionStatistics {
  user_id: string
  event_id: number
  total_predictions: number
  correct_predictions: number
  accuracy_rate: number
  avg_confidence: number
}

// ==================== ナレッジ管理 ====================

/**
 * ナレッジベース
 */
export interface KnowledgeBase {
  id: number
  title: string
  content: string
  category: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string | null
}

/**
 * 監査ログ
 */
export interface AuditLog {
  id: number
  event_type: string
  admin_id: number | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  action: string | null
  resource_type: string | null
  resource_id: string | null
  old_value: string | null
  new_value: string | null
  success: number
  error_message: string | null
  created_at: string
}

// ==================== Hono Bindings ====================

/**
 * Cloudflare Workers Bindings
 */
export interface Bindings {
  DB: D1Database
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
}

/**
 * コンテキスト変数
 */
export interface Variables {
  admin?: {
    id: number
    username: string
  }
  user?: {
    user_id: string
    name: string
  }
}
