import { NextRequest, NextResponse } from 'next/server'

const Razorpay = require('razorpay')

const key_id = process.env.RAZORPAY_KEY_ID
const key_secret = process.env.RAZORPAY_KEY_SECRET

if (!key_id || !key_secret) {
  console.warn('Razorpay keys are missing in environment')
}

const instance = new Razorpay({
  key_id,
  key_secret,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const amount = Number(body?.amount)
    const receipt = body?.receipt || `rcpt_${Date.now()}`

    if (!amount || Number.isNaN(amount)) {
      return NextResponse.json({ error: 'Missing or invalid amount' }, { status: 400 })
    }
    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum amount is 100 paise' }, { status: 400 })
    }

    const options = {
      amount,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    }

    const order = await instance.orders.create(options)

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    })
  } catch (err: any) {
    if (err?.statusCode === 401) {
      return NextResponse.json({ error: 'Razorpay authentication failed' }, { status: 401 })
    }
    console.error('create-order error', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
