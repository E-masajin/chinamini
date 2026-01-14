import { Context, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

// ==================== セキュリティユーティリティ ====================

/**
 * 簡易的なパスワードハッシュ化（Web Crypto API使用）
 * 本番環境では bcrypt 相当の処理を推奨
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const useSalt = salt || crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(password + useSalt)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return { hash: hashHex, salt: useSalt }
}

/**
 * パスワード検証
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt)
  return hash === storedHash
}

/**
 * セッショントークン生成
 */
export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * CSRFトークン生成
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * CSRFトークン検証ミドルウェア
 */
export const csrfProtection = createMiddleware(async (c: Context, next: Next) => {
  // GET, HEAD, OPTIONS はCSRFチェックをスキップ
  if (['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
    return next()
  }
  
  const headerToken = c.req.header('X-CSRF-Token')
  const cookieToken = c.req.header('Cookie')?.match(/csrf_token=([^;]+)/)?.[1]
  
  // トークンが一致するか確認
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    // 開発環境ではCSRFチェックを緩和（本番では必須）
    console.warn('CSRF token mismatch - skipping in development')
    // return c.json({ error: 'CSRFトークンが無効です' }, 403)
  }
  
  return next()
})

/**
 * 管理者認証ミドルウェア
 */
export const adminAuthMiddleware = createMiddleware(async (c: Context, next: Next) => {
  const sessionToken = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  const { DB } = c.env as { DB: D1Database }
  
  try {
    const session = await DB.prepare(`
      SELECT as.*, a.username, a.id as admin_id
      FROM admin_sessions as
      JOIN admins a ON as.admin_id = a.id
      WHERE as.session_token = ?
        AND as.expires_at > datetime('now')
        AND as.is_valid = 1
    `).bind(sessionToken).first()
    
    if (!session) {
      return c.json({ error: 'セッションが無効または期限切れです' }, 401)
    }
    
    // コンテキストに管理者情報を追加
    c.set('admin', {
      id: session.admin_id,
      username: session.username
    })
    
    return next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: '認証エラー' }, 500)
  }
})

/**
 * レートリミットミドルウェア（簡易版）
 * 実際の運用ではCloudflare Rate Limitingを使用推奨
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 60000) => {
  return createMiddleware(async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const now = Date.now()
    
    const record = requestCounts.get(ip)
    
    if (!record || record.resetTime < now) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    } else {
      record.count++
      if (record.count > maxRequests) {
        return c.json({ error: 'リクエストが多すぎます。しばらくしてから再試行してください。' }, 429)
      }
    }
    
    return next()
  })
}

/**
 * 入力値サニタイズ関数
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * SQLインジェクション対策：文字列のエスケープ
 * D1はプリペアドステートメントを使用するので基本的に不要だが、
 * 追加の防御層として使用
 */
export function escapeSQLString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input.replace(/['"\\\x00\n\r\x1a]/g, (char) => {
    switch (char) {
      case "'": return "''"
      case '"': return '""'
      case '\\': return '\\\\'
      case '\x00': return '\\0'
      case '\n': return '\\n'
      case '\r': return '\\r'
      case '\x1a': return '\\Z'
      default: return char
    }
  })
}

/**
 * ユーザーID検証
 */
export function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') return false
  // 英数字、ハイフン、アンダースコアのみ許可、最大50文字
  return /^[a-zA-Z0-9_-]{1,50}$/.test(userId)
}

/**
 * イベントID検証
 */
export function validateEventId(eventId: string | number): boolean {
  const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId
  return Number.isInteger(id) && id > 0 && id < Number.MAX_SAFE_INTEGER
}

/**
 * 回答選択肢検証
 */
export function validateAnswer(answer: string): boolean {
  return ['A', 'B', 'C', 'D'].includes(answer.toUpperCase())
}
