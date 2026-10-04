import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getProduct, QUOTE_FEE_USD } from '@/lib/products'
import { createOrder, razorpayConfigured, razorpayKeyId } from '@/lib/razorpay'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Please sign in to request a quote.' }, { status: 401 })
  try {
    const { slug, company, phone, details } = await request.json()
    const product = typeof slug === 'string' ? getProduct(slug) : undefined
    if (!product) return NextResponse.json({ error: 'Unknown product.' }, { status: 400 })
    if (typeof company !== 'string' || company.trim().length < 2) return NextResponse.json({ error: 'Please add your company name.' }, { status: 400 })
    if (!razorpayConfigured()) return NextResponse.json({ error: 'Payments are not configured yet. Please email hello@opulencebyte.com.' }, { status: 503 })
    const order = await createOrder({
      amount: QUOTE_FEE_USD * 100,
      currency: 'USD',
      receipt: `quote_${product.slug}_${Date.now()}`.slice(0, 40),
      notes: {
        source: 'opulence-byte-quote',
        product: product.name,
        email: user.email,
        name: user.name.slice(0, 200),
        company: company.trim().slice(0, 200),
        phone: typeof phone === 'string' ? phone.slice(0, 40) : '',
        details: typeof details === 'string' ? details.slice(0, 240) : '',
      },
    })
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: razorpayKeyId(), email: user.email, name: user.name })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid quote request.' }, { status: 502 })
  }
}
