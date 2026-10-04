import { NextResponse } from 'next/server'
import { notifyLead } from '@/lib/mail'

export async function POST(request: Request) {
  try {
    const { name, email, interest, message, website } = await request.json()
    if (website) return NextResponse.json({ ok: true }) // honeypot
    if (typeof name !== 'string' || name.trim().length < 2) return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 })
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    if (typeof message !== 'string' || message.trim().length < 10) return NextResponse.json({ error: 'Please add a few words about your project.' }, { status: 400 })
    await notifyLead(`New enquiry from ${name.trim().slice(0, 80)}`, {
      Name: name.trim().slice(0, 200),
      Email: email.trim().slice(0, 200),
      Interest: typeof interest === 'string' ? interest.slice(0, 100) : undefined,
      Message: message.trim().slice(0, 4000),
    }, email.trim())
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please email hello@opulencebyte.com.' }, { status: 400 })
  }
}
