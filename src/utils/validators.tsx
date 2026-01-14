/**
 * 入力検証ユーティリティ
 * 全APIモジュールで共通の入力検証を提供
 */

import { ValidationError } from './error-handler'

/**
 * ユーザーID検証
 */
export function validateUserId(userId: unknown): string {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('ユーザーIDを入力してください', 'userId')
  }
  
  const trimmed = userId.trim()
  
  if (trimmed === '') {
    throw new ValidationError('ユーザーIDを入力してください', 'userId')
  }
  
  if (trimmed.length > 50) {
    throw new ValidationError('ユーザーIDは50文字以内で入力してください', 'userId')
  }
  
  // 英数字、ハイフン、アンダースコアのみ許可
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new ValidationError('ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます', 'userId')
  }
  
  return trimmed
}

/**
 * イベントID検証
 */
export function validateEventId(eventId: unknown): number {
  if (eventId === undefined || eventId === null) {
    throw new ValidationError('イベントIDが必要です', 'eventId')
  }
  
  const id = typeof eventId === 'string' ? parseInt(eventId, 10) : Number(eventId)
  
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('無効なイベントIDです', 'eventId')
  }
  
  return id
}

/**
 * 問題ID検証
 */
export function validateQuestionId(questionId: unknown): number {
  if (questionId === undefined || questionId === null) {
    throw new ValidationError('問題IDが必要です', 'questionId')
  }
  
  const id = typeof questionId === 'string' ? parseInt(questionId, 10) : Number(questionId)
  
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('無効な問題IDです', 'questionId')
  }
  
  return id
}

/**
 * 回答選択肢検証（A, B, C, D）
 */
export function validateAnswer(answer: unknown): 'A' | 'B' | 'C' | 'D' {
  if (!answer || typeof answer !== 'string') {
    throw new ValidationError('回答を選択してください', 'answer')
  }
  
  const upper = answer.toUpperCase()
  
  if (!['A', 'B', 'C', 'D'].includes(upper)) {
    throw new ValidationError('回答はA, B, C, Dのいずれかを選択してください', 'answer')
  }
  
  return upper as 'A' | 'B' | 'C' | 'D'
}

/**
 * 回答配列検証
 */
export function validateAnswersArray(answers: unknown): Array<{ questionId: number; userAnswer: string }> {
  if (!answers || !Array.isArray(answers)) {
    throw new ValidationError('回答データが不正です', 'answers')
  }
  
  if (answers.length === 0) {
    throw new ValidationError('回答が1つも含まれていません', 'answers')
  }
  
  return answers.map((answer, index) => {
    if (!answer || typeof answer !== 'object') {
      throw new ValidationError(`回答[${index}]のデータ形式が不正です`, `answers[${index}]`)
    }
    
    const questionId = validateQuestionId(answer.questionId)
    const userAnswer = validateAnswer(answer.userAnswer)
    
    return { questionId, userAnswer }
  })
}

/**
 * 文字列必須検証
 */
export function validateRequiredString(value: unknown, fieldName: string, maxLength: number = 500): string {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName}を入力してください`, fieldName)
  }
  
  const trimmed = value.trim()
  
  if (trimmed === '') {
    throw new ValidationError(`${fieldName}を入力してください`, fieldName)
  }
  
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName}は${maxLength}文字以内で入力してください`, fieldName)
  }
  
  return trimmed
}

/**
 * オプショナル文字列検証
 */
export function validateOptionalString(value: unknown, fieldName: string, maxLength: number = 500): string | null {
  if (value === undefined || value === null || value === '') {
    return null
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName}は文字列で入力してください`, fieldName)
  }
  
  const trimmed = value.trim()
  
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName}は${maxLength}文字以内で入力してください`, fieldName)
  }
  
  return trimmed || null
}

/**
 * 日付検証
 */
export function validateDate(value: unknown, fieldName: string): string {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(`${fieldName}を入力してください`, fieldName)
  }
  
  const date = new Date(value)
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName}の日付形式が不正です`, fieldName)
  }
  
  return value
}

/**
 * 整数検証
 */
export function validateInteger(value: unknown, fieldName: string, min?: number, max?: number): number {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName}を入力してください`, fieldName)
  }
  
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  
  if (!Number.isInteger(num)) {
    throw new ValidationError(`${fieldName}は整数で入力してください`, fieldName)
  }
  
  if (min !== undefined && num < min) {
    throw new ValidationError(`${fieldName}は${min}以上で入力してください`, fieldName)
  }
  
  if (max !== undefined && num > max) {
    throw new ValidationError(`${fieldName}は${max}以下で入力してください`, fieldName)
  }
  
  return num
}

/**
 * XSS対策: HTMLエスケープ
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 安全な文字列（HTMLエスケープ済み）
 */
export function sanitizeString(value: unknown, fieldName: string, maxLength: number = 500): string {
  const validated = validateRequiredString(value, fieldName, maxLength)
  return escapeHtml(validated)
}

/**
 * 安全なオプショナル文字列（HTMLエスケープ済み）
 */
export function sanitizeOptionalString(value: unknown, fieldName: string, maxLength: number = 500): string | null {
  const validated = validateOptionalString(value, fieldName, maxLength)
  return validated ? escapeHtml(validated) : null
}
