import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { STATE_COOKIE, isProvider, providerEnabled, providers, safeNext, siteOrigin } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  const origin = siteOrigin(request)
  if (!isProvider(provider)) return NextResponse.redirect(`${origin}/signin?error=unknown_provider`)
  if (!providerEnabled(provider)) return NextResponse.redirect(`${origin}/signin?error=not_configured`)

  const next = safeNext(new URL(request.url).searchParams.get('next'))
  const state = randomBytes(24).toString('hex')
  const config = providers[provider]
  const url = new URL(config.authorizeUrl)
  url.searchParams.set('client_id', config.clientId!)
  url.searchParams.set('redirect_uri', `${origin}/api/auth/callback/${provider}`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', config.scope)
  url.searchParams.set('state', state)
  if (provider === 'google') url.searchParams.set('prompt', 'select_account')

  const response = NextResponse.redirect(url)
  response.cookies.set(STATE_COOKIE, JSON.stringify({ state, next, provider }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return response
}
