import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: 'Missing payment verification details.' }, { status: 400 })
    const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
    const valid = expected.length === razorpay_signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))
    if (!valid) return NextResponse.json({ error: 'Payment signature could not be verified.' }, { status: 400 })
    return NextResponse.json({ verified: true })
  } catch { return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 }) }
}
