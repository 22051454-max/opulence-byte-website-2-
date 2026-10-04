import { NextResponse } from 'next/server'
import { enabledProviders, getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ user: await getSession(), providers: enabledProviders() }, { headers: { 'Cache-Control': 'no-store' } })
}
