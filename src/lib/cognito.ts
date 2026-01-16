/**
 * Cognito authentication utilities for Cloudflare Workers
 */
import * as jose from 'jose'

type CognitoConfig = {
  region: string
  userPoolId: string
  clientId: string
  clientSecret: string
  domain: string
}

type UserData = {
  id: string
  email: string
  name: string
  emp_id?: string
  emp_name?: string
}

/**
 * Get Cognito configuration from environment variables
 */
export function getCognitoConfig(env: any): CognitoConfig {
  return {
    region: env.COGNITO_REGION,
    userPoolId: env.COGNITO_USER_POOL_ID,
    clientId: env.COGNITO_CLIENT_ID,
    clientSecret: env.COGNITO_CLIENT_SECRET,
    domain: env.COGNITO_DOMAIN,
  }
}

/**
 * Build Cognito Hosted UI login URL
 */
export function getLoginUrl(config: CognitoConfig, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri,
  })

  if (state) {
    params.set('state', state)
  }

  return `https://${config.domain}/login?${params.toString()}`
}

/**
 * Build Cognito logout URL
 */
export function getLogoutUrl(config: CognitoConfig, logoutRedirectUri: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: logoutRedirectUri,
  })

  return `https://${config.domain}/logout?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  config: CognitoConfig,
  code: string,
  redirectUri: string
): Promise<any> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: redirectUri,
  })

  const credentials = btoa(`${config.clientId}:${config.clientSecret}`)

  const response = await fetch(`https://${config.domain}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Refresh tokens using Cognito refresh token
 */
export async function refreshTokens(config: CognitoConfig, refreshToken: string): Promise<any> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken,
  })

  const credentials = btoa(`${config.clientId}:${config.clientSecret}`)

  const response = await fetch(`https://${config.domain}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}

/**
 * Decode ID token (JWT) without verification
 */
export function decodeIdToken(idToken: string): any {
  return jose.decodeJwt(idToken)
}

/**
 * Create session JWT token
 */
export async function createSessionToken(
  secret: string,
  userData: UserData,
  expiresIn: string = '24h'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret)

  const token = await new jose.SignJWT({
    sub: userData.id,
    email: userData.email,
    name: userData.name,
    emp_id: userData.emp_id,
    emp_name: userData.emp_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey)

  return token
}

/**
 * Verify session JWT token
 */
export async function verifySessionToken(token: string, secret: string): Promise<any> {
  const secretKey = new TextEncoder().encode(secret)
  const { payload } = await jose.jwtVerify(token, secretKey)
  return payload
}
