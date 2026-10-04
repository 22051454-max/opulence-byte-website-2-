/** Canonical site origin. Tolerates a NEXT_PUBLIC_SITE_URL set without protocol or with a trailing slash. */
export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) {
    try { return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`).origin } catch { /* fall through */ }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return 'https://www.opulencebyte.com'
}
