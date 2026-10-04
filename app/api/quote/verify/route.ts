import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { firstName, notifyLead, sendPaymentConfirmation } from '@/lib/mail'
import { fetchOrder, verifySignature } from '@/lib/razorpay'

/**
 * A valid Razorpay signature proves the payment succeeded, so once it checks out the answer is
 * always "verified". Order lookup and emails are best effort: their failures are logged, never
 * shown to a customer who has already paid.
 */
export async function POST(request: Request) {
  let body: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid verification request.' }, { status: 400 })
  }
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body
  if (!orderId || !paymentId || !signature || !verifySignature(orderId, paymentId, signature)) {
    console.error('[quote] signature check failed', { orderId, paymentId })
    return NextResponse.json({ error: 'We could not confirm this payment. If you were charged, email hello@opulencebyte.com with your payment ID.' }, { status: 400 })
  }

  try {
    const [order, user] = await Promise.all([fetchOrder(orderId), getSession()])
    const notes = order.notes ?? {}
    const email = notes.email || user?.email
    const amount = `${(order.amount / 100).toFixed(2)} ${order.currency}`
    const results = await Promise.allSettled([
      notifyLead(`Paid quote request: ${notes.product}`, {
        Product: notes.product,
        Name: notes.name,
        Email: email,
        Company: notes.company,
        Phone: notes.phone,
        Details: notes.details,
        Payment: `${paymentId} (${amount})`,
      }, email),
      email
        ? sendPaymentConfirmation(email, { name: firstName(notes.name || user?.name), product: notes.product || 'your product', amount, paymentId })
        : Promise.resolve(),
    ])
    results.forEach((r) => r.status === 'rejected' && console.error('[quote] email failed', r.reason))
  } catch (error) {
    console.error('[quote] post-payment follow-up failed', { orderId, paymentId }, error)
    await notifyLead('Paid quote request (details unavailable)', { Order: orderId, Payment: paymentId }).catch(() => {})
  }
  return NextResponse.json({ verified: true })
}
