import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ==================== ゲーミフィケーション API ====================

/**
 * ポイント計算と付与
 * 予測結果が判定された後に呼び出される
 */
async function calculateAndAwardPoints(
  DB: D1Database,
  userId: string,
  eventId: number,
  predictions: any[]
) {
  let totalPoints = 0
  const pointRecords = []

  // 各予測の結果を確認
  for (const pred of predictions) {
    if (pred.is_correct) {
      // 基本ポイント: 正解で10pt
      totalPoints += 10
      pointRecords.push({
        user_id: userId,
        event_id: eventId,
        points: 10,
        reason: 'correct_answer'
      })

      // 自信度ボーナス: 自信度が高いほどボーナス
      if (pred.confidence_level >= 4) {
        const bonus = pred.confidence_level  // 4pt or 5pt
        totalPoints += bonus
        pointRecords.push({
          user_id: userId,
          event_id: eventId,
          points: bonus,
          reason: 'confidence_bonus'
        })
      }
    }
  }

  // パーフェクトボーナス: 全問正解
  const allCorrect = predictions.every(p => p.is_correct)
  if (allCorrect && predictions.length > 0) {
    totalPoints += 50
    pointRecords.push({
      user_id: userId,
      event_id: eventId,
      points: 50,
      reason: 'perfect_bonus'
    })
  }

  // ポイント記録を保存
  for (const record of pointRecords) {
    await DB.prepare(`
      INSERT INTO user_points (user_id, event_id, points, reason)
      VALUES (?, ?, ?, ?)
    `).bind(record.user_id, record.event_id, record.points, record.reason).run()
  }

  // 総合ポイントを更新
  await DB.prepare(`
    INSERT INTO user_total_points (user_id, total_points, weekly_points, monthly_points)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      total_points = total_points + ?,
      weekly_points = weekly_points + ?,
      monthly_points = monthly_points + ?,
      last_updated = CURRENT_TIMESTAMP
  `).bind(userId, totalPoints, totalPoints, totalPoints, totalPoints, totalPoints, totalPoints).run()

  // 統計情報を更新
  await updateUserStatistics(DB, userId, predictions, allCorrect)

  // バッジチェック
  await checkAndAwardBadges(DB, userId)

  return totalPoints
}

/**
 * ユーザー統計情報の更新
 */
async function updateUserStatistics(
  DB: D1Database,
  userId: string,
  predictions: any[],
  allCorrect: boolean
) {
  const correctCount = predictions.filter(p => p.is_correct).length
  const highConfidenceCorrect = predictions.filter(
    p => p.is_correct && p.confidence_level === 5
  ).length

  // 現在の統計を取得
  const stats: any = await DB.prepare(`
    SELECT * FROM user_statistics WHERE user_id = ?
  `).bind(userId).first()

  if (!stats) {
    // 新規ユーザー
    await DB.prepare(`
      INSERT INTO user_statistics (
        user_id, total_predictions, total_correct, current_streak, max_streak,
        high_confidence_correct, perfect_events
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      predictions.length,
      correctCount,
      correctCount > 0 ? 1 : 0,
      correctCount > 0 ? 1 : 0,
      highConfidenceCorrect,
      allCorrect ? 1 : 0
    ).run()
  } else {
    // 既存ユーザー
    const newStreak = correctCount > 0 ? (stats.current_streak || 0) + 1 : 0
    const newMaxStreak = Math.max(newStreak, stats.max_streak || 0)

    await DB.prepare(`
      UPDATE user_statistics SET
        total_predictions = total_predictions + ?,
        total_correct = total_correct + ?,
        current_streak = ?,
        max_streak = ?,
        high_confidence_correct = high_confidence_correct + ?,
        perfect_events = perfect_events + ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      predictions.length,
      correctCount,
      newStreak,
      newMaxStreak,
      highConfidenceCorrect,
      allCorrect ? 1 : 0,
      userId
    ).run()
  }
}

/**
 * バッジチェックと付与
 */
async function checkAndAwardBadges(DB: D1Database, userId: string) {
  // ユーザー統計を取得
  const stats: any = await DB.prepare(`
    SELECT * FROM user_statistics WHERE user_id = ?
  `).bind(userId).first()

  if (!stats) return

  // バッジ定義を取得
  const badges: any = await DB.prepare(`
    SELECT * FROM badge_definitions
  `).all()

  for (const badge of badges.results) {
    // すでに獲得しているかチェック
    const existing = await DB.prepare(`
      SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?
    `).bind(userId, badge.id).first()

    if (existing) continue

    // 条件チェック
    let shouldAward = false

    switch (badge.condition_type) {
      case 'correct_count':
        shouldAward = stats.total_correct >= badge.condition_value
        break
      case 'streak':
        shouldAward = stats.max_streak >= badge.condition_value
        break
      case 'confidence':
        shouldAward = stats.high_confidence_correct >= badge.condition_value
        break
      case 'perfect':
        shouldAward = stats.perfect_events >= badge.condition_value
        break
    }

    // バッジ付与
    if (shouldAward) {
      await DB.prepare(`
        INSERT OR IGNORE INTO user_badges (user_id, badge_id)
        VALUES (?, ?)
      `).bind(userId, badge.id).run()
    }
  }
}

/**
 * ユーザーのポイント情報を取得
 * GET /api/gamification/users/:userId/points
 */
app.get('/api/gamification/users/:userId/points', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('userId')

  try {
    // 総合ポイント
    const totalPoints: any = await DB.prepare(`
      SELECT * FROM user_total_points WHERE user_id = ?
    `).bind(userId).first()

    // 獲得ポイント履歴
    const pointHistory: any = await DB.prepare(`
      SELECT p.*, e.name as event_name
      FROM user_points p
      LEFT JOIN events e ON p.event_id = e.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `).bind(userId).all()

    return c.json({
      total_points: totalPoints?.total_points || 0,
      weekly_points: totalPoints?.weekly_points || 0,
      monthly_points: totalPoints?.monthly_points || 0,
      history: pointHistory.results
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザーのバッジ情報を取得
 * GET /api/gamification/users/:userId/badges
 */
app.get('/api/gamification/users/:userId/badges', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('userId')

  try {
    // 獲得バッジ
    const earnedBadges: any = await DB.prepare(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub
      JOIN badge_definitions b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `).bind(userId).all()

    // 全バッジ定義
    const allBadges: any = await DB.prepare(`
      SELECT * FROM badge_definitions
      ORDER BY tier, condition_value
    `).all()

    return c.json({
      earned: earnedBadges.results,
      all: allBadges.results,
      earned_count: earnedBadges.results.length,
      total_count: allBadges.results.length
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ユーザー統計を取得
 * GET /api/gamification/users/:userId/statistics
 */
app.get('/api/gamification/users/:userId/statistics', async (c) => {
  const { DB } = c.env
  const userId = c.req.param('userId')

  try {
    const stats: any = await DB.prepare(`
      SELECT * FROM user_statistics WHERE user_id = ?
    `).bind(userId).first()

    if (!stats) {
      return c.json({
        total_predictions: 0,
        total_correct: 0,
        accuracy_rate: 0,
        current_streak: 0,
        max_streak: 0,
        high_confidence_correct: 0,
        perfect_events: 0
      })
    }

    const accuracyRate = stats.total_predictions > 0
      ? ((stats.total_correct / stats.total_predictions) * 100).toFixed(1)
      : 0

    return c.json({
      ...stats,
      accuracy_rate: accuracyRate
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

/**
 * ポイントランキングを取得
 * GET /api/gamification/leaderboard/:type
 */
app.get('/api/gamification/leaderboard/:type', async (c) => {
  const { DB } = c.env
  const type = c.req.param('type')  // 'total', 'weekly', 'monthly'

  try {
    let column = 'total_points'
    if (type === 'weekly') column = 'weekly_points'
    if (type === 'monthly') column = 'monthly_points'

    const leaderboard: any = await DB.prepare(`
      SELECT user_id, ${column} as points
      FROM user_total_points
      WHERE ${column} > 0
      ORDER BY ${column} DESC
      LIMIT 50
    `).all()

    return c.json({
      type,
      leaderboard: leaderboard.results.map((row: any, index: number) => ({
        rank: index + 1,
        user_id: row.user_id,
        points: row.points
      }))
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

/**
 * 予測判定後のポイント付与（内部API）
 * POST /api/gamification/award-points
 */
app.post('/api/gamification/award-points', async (c) => {
  const { DB } = c.env
  
  try {
    const { userId, eventId, predictions } = await c.req.json()
    
    const totalPoints = await calculateAndAwardPoints(DB, userId, eventId, predictions)
    
    return c.json({ 
      success: true,
      total_points: totalPoints,
      message: `${totalPoints}ポイント獲得しました！`
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
export { calculateAndAwardPoints }
