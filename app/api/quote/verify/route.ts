import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { notifyLead } from '@/lib/mail'
import { fetchOrder, verifySignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 })
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
    if (!razorpay_order_id || !razorpay_payment_id || !verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 })
    }
    const order = await fetchOrder(razorpay_order_id)
    if (order.notes?.email !== user.email) return NextResponse.json({ error: 'This payment belongs to a different account.' }, { status: 403 })
    await notifyLead(`Paid quote request: ${order.notes.product}`, {
      Product: order.notes.product,
      Name: order.notes.name,
      Email: order.notes.email,
      Company: order.notes.company,
      Phone: order.notes.phone,
      Details: order.notes.details,
      Payment: `${razorpay_payment_id} (${(order.amount / 100).toFixed(2)} ${order.currency})`,
    }, order.notes.email)
    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 })
  }
}
