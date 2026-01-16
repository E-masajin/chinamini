/**
 * Authentication routes for Cognito SSO
 */
import { Hono } from 'hono'
import type { Context } from 'hono'
import {
  getCognitoConfig,
  getLoginUrl,
  getLogoutUrl,
  exchangeCodeForTokens,
  refreshTokens,
  decodeIdToken,
  createSessionToken,
  verifySessionToken,
} from '../lib/cognito'

const authApp = new Hono<{ Bindings: CloudflareBindings }>()

/**
 * Cookie helper functions
 */
function setCookie(name: string, value: string, options: any = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]

  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.path) parts.push(`Path=${options.path}`)
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`)
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

  return parts.join('; ')
}

function getCookie(c: Context, name: string): string | null {
  const cookieHeader = c.req.header('Cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split('=')
    if (cookieName === name) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

function deleteCookieHeader(name: string, path: string = '/') {
  return `${name}=; Path=${path}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
}

/**
 * Create or update user in D1 database
 */
async function createOrUpdateCognitoUser(db: D1Database, userData: any) {
  const { email, name, oauth2Provider, oauth2Subject, empId, empName, oauth2RefreshToken } = userData

  // Check if user exists
  const existing = await db.prepare(`
    SELECT id FROM quiz_portal_users WHERE oauth2_subject = ?
  `).bind(oauth2Subject).first()

  const now = Math.floor(Date.now() / 1000)

  if (existing) {
    // Update existing user
    await db.prepare(`
      UPDATE quiz_portal_users
      SET email = ?, name = ?, emp_id = ?, emp_name = ?, oauth2_refresh_token = ?, last_login_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(email, name, empId, empName, oauth2RefreshToken || null, now, now, existing.id).run()

    return { id: existing.id, email, name, emp_id: empId, emp_name: empName }
  } else {
    // Create new user
    const id = crypto.randomUUID()
    await db.prepare(`
      INSERT INTO quiz_portal_users (id, email, name, oauth2_provider, oauth2_subject, emp_id, emp_name, oauth2_refresh_token, last_login_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, email, name, oauth2Provider, oauth2Subject, empId, empName, oauth2RefreshToken || null, now, now, now).run()

    return { id, email, name, emp_id: empId, emp_name: empName }
  }
}

/**
 * Find user by ID
 */
async function findUserById(db: D1Database, id: string) {
  return db.prepare(`
    SELECT id, email, name, emp_id, emp_name, last_login_at
    FROM quiz_portal_users
    WHERE id = ?
  `).bind(id).first()
}

// GET /api/auth/login - Redirect to Cognito Hosted UI
authApp.get('/login', async (c) => {
  try {
    const cognitoConfig = getCognitoConfig(c.env)
    const frontendUrl = c.env.FRONTEND_URL
    const returnTo = c.req.query('returnTo') || '/admin.html'

    // Store the frontend URL and returnTo in state (Base64URL encoded)
    const stateData = JSON.stringify({ returnTo, frontendUrl })
    const state = btoa(stateData)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const loginUrl = getLoginUrl(cognitoConfig, c.env.COGNITO_CALLBACK_URL, state)
    return Response.redirect(loginUrl, 302)
  } catch (error: any) {
    console.error('Login redirect error:', error)
    const frontendUrl = c.env.FRONTEND_URL
    return Response.redirect(
      frontendUrl + '/admin.html?error=' + encodeURIComponent(error.message),
      302
    )
  }
})

// GET /api/auth/callback - Handle Cognito callback
authApp.get('/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')
  const errorDescription = c.req.query('error_description')

  // Parse state to get frontendUrl and returnTo
  let frontendUrl = c.env.FRONTEND_URL
  let returnTo = '/admin.html'

  if (state) {
    try {
      // Decode Base64URL
      const paddedState = state + '='.repeat((4 - (state.length % 4)) % 4)
      const stateData = atob(paddedState.replace(/-/g, '+').replace(/_/g, '/'))
      const stateObj = JSON.parse(stateData)
      frontendUrl = stateObj.frontendUrl || frontendUrl
      returnTo = stateObj.returnTo || '/admin.html'
    } catch {
      returnTo = state
    }
  }

  if (error) {
    console.error('Cognito error:', error, '-', errorDescription)
    return Response.redirect(
      frontendUrl + '/admin.html?error=' + encodeURIComponent(errorDescription || error),
      302
    )
  }

  if (!code) {
    return Response.redirect(frontendUrl + '/admin.html?error=missing_code', 302)
  }

  try {
    const cognitoConfig = getCognitoConfig(c.env)

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(
      cognitoConfig,
      code,
      c.env.COGNITO_CALLBACK_URL
    )

    // Decode ID token to get user info
    const idTokenPayload = decodeIdToken(tokens.id_token)
    const email = idTokenPayload.email
    const empId = idTokenPayload['custom:emp_id'] || ''
    const empName = idTokenPayload['custom:emp_name'] || idTokenPayload.name || email

    // Create or update user in database
    const user = await createOrUpdateCognitoUser(c.env.DB, {
      email: email,
      name: empName,
      oauth2Provider: 'cognito',
      oauth2Subject: idTokenPayload.sub,
      empId: empId,
      empName: empName,
      oauth2RefreshToken: tokens.refresh_token,
    })

    // Create session JWT
    const sessionToken = await createSessionToken(c.env.JWT_ACCESS_SECRET, {
      id: (user as any).id,
      email: email,
      name: empName,
      emp_id: empId,
      emp_name: empName,
    })

    // Set cookies and redirect
    const headers = new Headers({
      'Location': frontendUrl + returnTo,
    })

    headers.append('Set-Cookie', setCookie('AuthorizationToken', 'Bearer ' + sessionToken, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60, // 24 hours
    }))

    if (tokens.refresh_token) {
      headers.append('Set-Cookie', setCookie('CognitoRefreshToken', tokens.refresh_token, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'Lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }))
    }

    return new Response(null, { status: 302, headers })
  } catch (err: any) {
    console.error('Auth callback error:', err)
    return Response.redirect(
      frontendUrl + '/admin.html?error=' + encodeURIComponent(err.message),
      302
    )
  }
})

// GET /api/auth/logout - Clear cookies and redirect to Cognito logout
authApp.get('/logout', async (c) => {
  const cognitoConfig = getCognitoConfig(c.env)
  const frontendUrl = c.env.FRONTEND_URL
  const logoutUrl = getLogoutUrl(cognitoConfig, frontendUrl)

  const headers = new Headers({
    'Location': logoutUrl,
  })

  headers.append('Set-Cookie', deleteCookieHeader('AuthorizationToken'))
  headers.append('Set-Cookie', deleteCookieHeader('CognitoRefreshToken'))

  return new Response(null, { status: 302, headers })
})

// GET /api/auth/me - Get current user info
authApp.get('/me', async (c) => {
  const authCookie = getCookie(c, 'AuthorizationToken')

  if (!authCookie) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  try {
    const token = authCookie.startsWith('Bearer ') ? authCookie.slice(7) : authCookie
    const payload = await verifySessionToken(token, c.env.JWT_ACCESS_SECRET)

    const user = await findUserById(c.env.DB, payload.sub as string)

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      emp_id: user.emp_id,
      emp_name: user.emp_name,
    })
  } catch (error: any) {
    console.error('Get user info error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
})

// GET /api/auth/status - Check authentication status
authApp.get('/status', async (c) => {
  const authCookie = getCookie(c, 'AuthorizationToken')

  if (!authCookie) {
    return c.json({ authenticated: false })
  }

  try {
    const token = authCookie.startsWith('Bearer ') ? authCookie.slice(7) : authCookie
    const payload = await verifySessionToken(token, c.env.JWT_ACCESS_SECRET)

    const user = await findUserById(c.env.DB, payload.sub as string)

    if (!user) {
      return c.json({ authenticated: false })
    }

    return c.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emp_id: user.emp_id,
        emp_name: user.emp_name,
      },
    })
  } catch (error: any) {
    console.error('Auth status check error:', error)
    return c.json({ authenticated: false })
  }
})

// POST /api/auth/refresh - Refresh session using Cognito refresh token
authApp.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'CognitoRefreshToken')

  if (!refreshToken) {
    return c.json({ error: 'No refresh token available' }, 400)
  }

  try {
    const cognitoConfig = getCognitoConfig(c.env)

    // Refresh tokens with Cognito
    const tokens = await refreshTokens(cognitoConfig, refreshToken)

    // Decode new ID token
    const idTokenPayload = decodeIdToken(tokens.id_token)

    // Create new session JWT
    const sessionToken = await createSessionToken(c.env.JWT_ACCESS_SECRET, {
      id: idTokenPayload.sub,
      email: idTokenPayload.email,
      name: idTokenPayload['custom:emp_name'] || idTokenPayload.name || '',
      emp_id: idTokenPayload['custom:emp_id'],
      emp_name: idTokenPayload['custom:emp_name'],
    })

    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    headers.append('Set-Cookie', setCookie('AuthorizationToken', 'Bearer ' + sessionToken, {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60,
    }))

    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (error: any) {
    console.error('Token refresh error:', error)

    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    headers.append('Set-Cookie', deleteCookieHeader('AuthorizationToken'))
    headers.append('Set-Cookie', deleteCookieHeader('CognitoRefreshToken'))

    return new Response(JSON.stringify({
      error: 'Token refresh failed',
      message: error.message,
    }), { status: 401, headers })
  }
})

export default authApp
