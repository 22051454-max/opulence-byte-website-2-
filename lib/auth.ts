import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionUser = { email: string; name: string; image?: string; provider: Provider }
export type Provider = 'google' | 'github'

export const SESSION_COOKIE = 'ob_session'
export const STATE_COOKIE = 'ob_oauth_state'
const SESSION_DAYS = 30

type ProviderConfig = {
  clientId?: string
  clientSecret?: string
  authorizeUrl: string
  tokenUrl: string
  scope: string
}

export const providers: Record<Provider, ProviderConfig> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
  },
}

export function isProvider(value: string): value is Provider {
  return value === 'google' || value === 'github'
}

export function providerEnabled(provider: Provider) {
  return Boolean(providers[provider].clientId && providers[provider].clientSecret && process.env.AUTH_SECRET)
}

export function enabledProviders(): Provider[] {
  return (Object.keys(providers) as Provider[]).filter(providerEnabled)
}

function secret() {
  const value = process.env.AUTH_SECRET
  if (!value) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(value)
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret())
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60,
}

export async function getSession(): Promise<SessionUser | null> {
  if (!process.env.AUTH_SECRET) return null
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (typeof payload.email !== 'string' || !isProvider(String(payload.provider))) return null
    return {
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : payload.email,
      image: typeof payload.image === 'string' ? payload.image : undefined,
      provider: payload.provider as Provider,
    }
  } catch {
    return null
  }
}

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/products'
  return value
}

export function siteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || new URL(request.url).origin
}
