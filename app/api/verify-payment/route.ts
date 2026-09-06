import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {}

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (!KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET is not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ ok: true })
    } else {
      return NextResponse.json({ error: 'Signature mismatch' }, { status: 400 })
    }
  } catch (err) {
    console.error('verify-payment error', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
