import { Context } from 'hono'

/**
 * エラーハンドリングユーティリティ
 * 全APIモジュールで共通のエラー処理を提供
 */

// エラータイプ定義
export type AppError = {
  code: string
  message: string
  details?: any
  statusCode: number
}

// 標準エラーコード
export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  API_ERROR: 'API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

/**
 * アプリケーションエラーを作成
 */
export function createAppError(
  code: keyof typeof ErrorCodes,
  message: string,
  statusCode: number = 400,
  details?: any
): AppError {
  return {
    code: ErrorCodes[code],
    message,
    details,
    statusCode,
  }
}

/**
 * エラーレスポンスを返す
 */
export function errorResponse(c: Context, error: AppError | Error | unknown) {
  if (error instanceof Error) {
    console.error(`[Error] ${error.message}`, error.stack)
    return c.json(
      {
        error: error.message,
        code: ErrorCodes.INTERNAL_ERROR,
      },
      500
    )
  }

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const appError = error as AppError
    return c.json(
      {
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      appError.statusCode as any
    )
  }

  return c.json(
    {
      error: '予期せぬエラーが発生しました',
      code: ErrorCodes.INTERNAL_ERROR,
    },
    500
  )
}

/**
 * try-catchラッパー関数
 * エラーハンドリングを統一化
 */
export function wrapHandler<T extends any[], R>(
  handler: (c: Context, ...args: T) => Promise<Response | R>
) {
  return async (c: Context, ...args: T) => {
    try {
      return await handler(c, ...args)
    } catch (error) {
      return errorResponse(c, error)
    }
  }
}

// 入力検証エラー
export class ValidationError extends Error {
  code = ErrorCodes.INVALID_INPUT
  statusCode = 400
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// 認証エラー
export class AuthenticationError extends Error {
  code = ErrorCodes.UNAUTHORIZED
  statusCode = 401

  constructor(message: string = '認証が必要です') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// 認可エラー
export class AuthorizationError extends Error {
  code = ErrorCodes.FORBIDDEN
  statusCode = 403

  constructor(message: string = 'アクセス権限がありません') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

// NotFoundエラー
export class NotFoundError extends Error {
  code = ErrorCodes.NOT_FOUND
  statusCode = 404
  resource?: string

  constructor(message: string, resource?: string) {
    super(message)
    this.name = 'NotFoundError'
    this.resource = resource
  }
}

// データベースエラー
export class DatabaseError extends Error {
  code = ErrorCodes.DATABASE_ERROR
  statusCode = 500
  query?: string

  constructor(message: string, query?: string) {
    super(message)
    this.name = 'DatabaseError'
    this.query = query
  }
}
