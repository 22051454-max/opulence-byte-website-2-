import { NextResponse } from 'next/server'
import { verifySignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return NextResponse.json({ error: 'Missing payment verification details.' }, { status: 400 })
    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return NextResponse.json({ error: 'Payment signature could not be verified.' }, { status: 400 })
    return NextResponse.json({ verified: true })
  } catch { return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 }) }
}
