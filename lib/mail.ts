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
