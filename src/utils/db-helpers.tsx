/**
 * データベースヘルパーユーティリティ
 * D1データベース操作の共通処理を提供
 */

import { DatabaseError, NotFoundError } from './error-handler'

/**
 * クエリ実行結果の型
 */
export type QueryResult<T> = {
  results: T[]
  success: boolean
  meta?: {
    duration?: number
    changes?: number
    last_row_id?: number
  }
}

/**
 * 安全にクエリを実行（エラーハンドリング付き）
 */
export async function safeQuery<T>(
  db: D1Database,
  query: string,
  ...params: any[]
): Promise<QueryResult<T>> {
  try {
    const stmt = db.prepare(query)
    const bound = params.length > 0 ? stmt.bind(...params) : stmt
    const result = await bound.all()
    return result as QueryResult<T>
  } catch (error: any) {
    console.error(`[DB Error] Query: ${query.substring(0, 100)}...`, error.message)
    throw new DatabaseError(`データベースエラー: ${error.message}`, query)
  }
}

/**
 * 単一レコードを取得（見つからない場合はnull）
 */
export async function findOne<T>(
  db: D1Database,
  query: string,
  ...params: any[]
): Promise<T | null> {
  try {
    const stmt = db.prepare(query)
    const bound = params.length > 0 ? stmt.bind(...params) : stmt
    const result = await bound.first()
    return result as T | null
  } catch (error: any) {
    console.error(`[DB Error] Query: ${query.substring(0, 100)}...`, error.message)
    throw new DatabaseError(`データベースエラー: ${error.message}`, query)
  }
}

/**
 * 単一レコードを取得（見つからない場合はエラー）
 */
export async function findOneOrThrow<T>(
  db: D1Database,
  query: string,
  resourceName: string,
  ...params: any[]
): Promise<T> {
  const result = await findOne<T>(db, query, ...params)
  
  if (!result) {
    throw new NotFoundError(`${resourceName}が見つかりません`, resourceName)
  }
  
  return result
}

/**
 * INSERT/UPDATE/DELETEを実行
 */
export async function execute(
  db: D1Database,
  query: string,
  ...params: any[]
): Promise<{ success: boolean; changes: number; lastRowId: number | null }> {
  try {
    const stmt = db.prepare(query)
    const bound = params.length > 0 ? stmt.bind(...params) : stmt
    const result = await bound.run()
    
    return {
      success: result.success,
      changes: result.meta.changes ?? 0,
      lastRowId: result.meta.last_row_id ?? null,
    }
  } catch (error: any) {
    console.error(`[DB Error] Query: ${query.substring(0, 100)}...`, error.message)
    throw new DatabaseError(`データベースエラー: ${error.message}`, query)
  }
}

/**
 * トランザクション的な複数クエリ実行
 * 注意: D1は真のトランザクションをサポートしていないため、
 * これは単にシーケンシャルに実行するラッパーです
 */
export async function executeMany(
  db: D1Database,
  queries: Array<{ query: string; params: any[] }>
): Promise<Array<{ success: boolean; changes: number; lastRowId: number | null }>> {
  const results = []
  
  for (const { query, params } of queries) {
    const result = await execute(db, query, ...params)
    results.push(result)
  }
  
  return results
}

/**
 * 問題群を決定（ユーザーIDの最後の文字から）
 */
export function getPoolGroup(userId: string): number {
  if (!userId || userId.length === 0) {
    return 0
  }
  
  const lastChar = userId.slice(-1)
  const num = parseInt(lastChar, 10)
  
  return isNaN(num) ? 0 : num
}

/**
 * ページネーション用のオフセット計算
 */
export function calculateOffset(page: number, pageSize: number): number {
  const safePage = Math.max(1, Math.floor(page))
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize)))
  return (safePage - 1) * safePageSize
}

/**
 * LIKE検索用のパターンエスケープ
 */
export function escapeLikePattern(pattern: string): string {
  return pattern
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

/**
 * ORDER BY句の安全な構築
 */
const ALLOWED_SORT_FIELDS: Record<string, string[]> = {
  events: ['id', 'name', 'created_at', 'start_date', 'end_date', 'is_active'],
  questions: ['id', 'question_text', 'pool_group', 'created_at'],
  users: ['user_id', 'name', 'created_at'],
  user_event_status: ['score', 'completed_at', 'answer_duration'],
}

export function buildOrderBy(
  table: string,
  sortField: string | undefined,
  sortOrder: string | undefined,
  defaultField: string = 'id',
  defaultOrder: 'ASC' | 'DESC' = 'DESC'
): string {
  const allowedFields = ALLOWED_SORT_FIELDS[table] || [defaultField]
  const field = allowedFields.includes(sortField || '') ? sortField : defaultField
  const order = (sortOrder?.toUpperCase() === 'ASC' || sortOrder?.toUpperCase() === 'DESC')
    ? sortOrder.toUpperCase()
    : defaultOrder
  
  return `ORDER BY ${field} ${order}`
}
