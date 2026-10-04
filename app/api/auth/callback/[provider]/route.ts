import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  type Provider,
  type SessionUser,
  createSessionToken,
  isProvider,
  providerEnabled,
  providers,
  safeNext,
  sessionCookieOptions,
  siteOrigin,
} from '@/lib/auth'

async function exchangeCode(provider: Provider, code: string, redirectUri: string) {
  const config = providers[provider]
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId!,
      client_secret: config.clientSecret!,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const data = await response.json()
  if (!response.ok || !data.access_token) throw new Error('token_exchange_failed')
  return data.access_token as string
}

async function fetchUser(provider: Provider, token: string): Promise<SessionUser> {
  if (provider === 'google') {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${token}` } })
    const profile = await response.json()
    if (!response.ok || !profile.email || profile.email_verified === false) throw new Error('no_verified_email')
    return { email: profile.email, name: profile.name || profile.email, image: profile.picture, provider }
  }
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'opulence-byte' }
  const [userResponse, emailResponse] = await Promise.all([
    fetch('https://api.github.com/user', { headers }),
    fetch('https://api.github.com/user/emails', { headers }),
  ])
  const user = await userResponse.json()
  const emails: { email: string; primary: boolean; verified: boolean }[] = emailResponse.ok ? await emailResponse.json() : []
  const email = emails.find((e) => e.primary && e.verified)?.email || emails.find((e) => e.verified)?.email
  if (!userResponse.ok || !email) throw new Error('no_verified_email')
  return { email, name: user.name || user.login || email, image: user.avatar_url, provider }
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const origin = siteOrigin(request)
  const fail = (error: string) => {
    const response = NextResponse.redirect(`${origin}/signin?error=${error}`)
    response.cookies.delete(STATE_COOKIE)
    return response
  }
  if (!isProvider(provider) || !providerEnabled(provider)) return fail('not_configured')

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const raw = (await cookies()).get(STATE_COOKIE)?.value
  let saved: { state?: string; next?: string; provider?: string } = {}
  try { saved = raw ? JSON.parse(raw) : {} } catch { saved = {} }
  if (!code || !state || state !== saved.state || saved.provider !== provider) return fail('invalid_state')

  try {
    const token = await exchangeCode(provider, code, `${origin}/api/auth/callback/${provider}`)
    const user = await fetchUser(provider, token)
    const response = NextResponse.redirect(`${origin}${safeNext(saved.next)}`)
    response.cookies.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions)
    response.cookies.delete(STATE_COOKIE)
    return response
  } catch (error) {
    return fail(error instanceof Error && error.message === 'no_verified_email' ? 'no_email' : 'oauth_failed')
  }
}
