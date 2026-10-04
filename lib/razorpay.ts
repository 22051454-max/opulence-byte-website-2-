import { createHmac, timingSafeEqual } from 'node:crypto'

// Trimmed because keys pasted into a dashboard often carry a stray space or newline,
// which would break both the API login and the payment signature check.
export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID?.trim() || ''
const keySecret = () => process.env.RAZORPAY_KEY_SECRET?.trim() || ''

export function razorpayConfigured() {
  return Boolean(razorpayKeyId() && keySecret())
}

function authHeader() {
  return `Basic ${Buffer.from(`${razorpayKeyId()}:${keySecret()}`).toString('base64')}`
}

export async function createOrder(body: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const order = await response.json()
  if (!response.ok) throw new Error(order?.error?.description || 'Unable to create a payment order.')
  return order as { id: string; amount: number; currency: string }
}

export async function fetchOrder(orderId: string) {
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: authHeader() } })
  if (!response.ok) throw new Error(`Order lookup failed (${response.status})`)
  return (await response.json()) as { id: string; amount: number; currency: string; notes: Record<string, string> }
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  if (!keySecret() || typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') return false
  const expected = createHmac('sha256', keySecret()).update(`${orderId}|${paymentId}`).digest('hex')
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
