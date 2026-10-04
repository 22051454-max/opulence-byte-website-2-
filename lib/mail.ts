const INBOX = process.env.LEADS_INBOX || 'hello@opulencebyte.com'

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/**
 * Sends a lead notification through Resend when RESEND_API_KEY is set.
 * Without a key the lead is logged to the server console so nothing is silently lost in development.
 */
export async function notifyLead(subject: string, fields: Record<string, string | undefined>, replyTo?: string) {
  const rows = Object.entries(fields).filter(([, v]) => v)
  if (!process.env.RESEND_API_KEY) {
    console.info(`[lead] ${subject}`, Object.fromEntries(rows))
    return { delivered: false }
  }
  const html = `<h2>${escape(subject)}</h2><table>${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0"><b>${escape(k)}</b></td><td>${escape(v!).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.LEADS_FROM || 'Opulence Byte <onboarding@resend.dev>', to: [INBOX], subject, html, reply_to: replyTo }),
  })
  if (!response.ok) console.error('[lead] email failed', response.status, await response.text())
  return { delivered: response.ok }
}

/**
 * Confirmation sent to the customer after their $5 quote payment is verified.
 * Edit the wording here; {name} and {product} are filled in for each customer.
 */
export const paymentConfirmationTemplate = {
  subject: 'Payment received: your {product} quote is on its way',
  paragraphs: [
    'Hello {name},',
    'Your payment has been received. Our team is now working on your request and will send all the details, along with your customised quotation for {product}, to this email address soon.',
    'A member of our team will also reach out to you personally to understand your needs.',
    'Thank you for choosing Opulence Byte.',
  ],
  signature: 'Team Opulence Byte',
}

export async function sendPaymentConfirmation(to: string, details: { name: string; product: string; amount: string; paymentId: string }) {
  const fill = (text: string) => text.replace(/\{name\}/g, details.name).replace(/\{product\}/g, details.product)
  const subject = fill(paymentConfirmationTemplate.subject)
  if (!process.env.RESEND_API_KEY) {
    console.info(`[customer mail] ${subject}`, { to, ...details })
    return { delivered: false }
  }
  const from = process.env.CUSTOMER_MAIL_FROM || 'Opulence Byte <contact@opulencebyte.com>'
  const paragraphs = paymentConfirmationTemplate.paragraphs.map((p) => `<p style="margin:0 0 16px">${escape(fill(p))}</p>`).join('')
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:560px">
${paragraphs}
<table style="border-collapse:collapse;margin:8px 0 20px;font-size:14px">
<tr><td style="padding:4px 16px 4px 0;color:#64748b">Product</td><td><b>${escape(details.product)}</b></td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#64748b">Amount paid</td><td><b>${escape(details.amount)}</b></td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#64748b">Payment ID</td><td><b>${escape(details.paymentId)}</b></td></tr>
</table>
<p style="margin:0">${escape(paymentConfirmationTemplate.signature)}<br><a href="https://www.opulencebyte.com" style="color:#2d7cf6">opulencebyte.com</a></p>
</div>`
  const text = `${paymentConfirmationTemplate.paragraphs.map(fill).join('\n\n')}\n\nProduct: ${details.product}\nAmount paid: ${details.amount}\nPayment ID: ${details.paymentId}\n\n${paymentConfirmationTemplate.signature}`
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, text, reply_to: from }),
  })
  if (!response.ok) console.error('[customer mail] email failed', response.status, await response.text())
  return { delivered: response.ok }
}
