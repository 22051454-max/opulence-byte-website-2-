import { ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { GitHubIcon, GoogleIcon } from '@/components/brand-icons'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { enabledProviders, safeNext } from '@/lib/auth'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } }
export const dynamic = 'force-dynamic'

const errors: Record<string, string> = {
  not_configured: 'That sign-in option isn’t switched on yet. Please try another, or email hello@opulencebyte.com.',
  invalid_state: 'Your sign-in link expired. Please try again.',
  no_email: 'We couldn’t get a verified email from that account. Please verify your email with the provider and try again.',
  oauth_failed: 'Sign-in didn’t complete. Please try again.',
  unknown_provider: 'Unknown sign-in option.',
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  const target = encodeURIComponent(safeNext(next))
  const enabled = enabledProviders()

  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="shell auth-wrap">
        <div className="card auth-card" data-reveal="zoom">
          <img src="/icon.svg" alt="" width={56} height={56} style={{ margin: '0 auto', borderRadius: 16 }} />
          <h1>Welcome to <span className="gradient-text">Opulence Byte</span></h1>
          <p>Sign in to request product quotes and follow up with our team.</p>
          {error && <p className="form-status error" role="alert">{errors[error] ?? errors.oauth_failed}</p>}
          <a className="oauth-btn" href={`/api/auth/google?next=${target}`} aria-disabled={!enabled.includes('google')}><GoogleIcon /> Continue with Google</a>
          <a className="oauth-btn" href={`/api/auth/github?next=${target}`} aria-disabled={!enabled.includes('github')}><GitHubIcon /> Continue with GitHub</a>
          {enabled.length === 0 && <p className="fineprint">Sign-in is being set up. In the meantime, email hello@opulencebyte.com for a quote.</p>}
          <div className="divider">secure OAuth 2.0</div>
          <p className="fineprint"><ShieldCheck size={13} style={{ verticalAlign: -2 }} /> We never see your password. We only receive your name, email and profile photo.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
