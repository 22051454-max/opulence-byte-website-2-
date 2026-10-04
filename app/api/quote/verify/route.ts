import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { firstName, notifyLead, sendPaymentConfirmation } from '@/lib/mail'
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
    const amount = `${(order.amount / 100).toFixed(2)} ${order.currency}`
    // Emails must never undo a verified payment, so failures are logged, not returned.
    await Promise.allSettled([
      notifyLead(`Paid quote request: ${order.notes.product}`, {
        Product: order.notes.product,
        Name: order.notes.name,
        Email: order.notes.email,
        Company: order.notes.company,
        Phone: order.notes.phone,
        Details: order.notes.details,
        Payment: `${razorpay_payment_id} (${amount})`,
      }, order.notes.email),
      sendPaymentConfirmation(order.notes.email, {
        name: firstName(order.notes.name || user.name),
        product: order.notes.product,
        amount,
        paymentId: razorpay_payment_id,
      }),
    ]).then((results) => results.forEach((r) => r.status === 'rejected' && console.error('[quote] email failed', r.reason)))
    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 })
  }
}
