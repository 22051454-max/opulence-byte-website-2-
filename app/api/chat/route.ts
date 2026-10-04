import Anthropic from '@anthropic-ai/sdk'
import { products, QUOTE_FEE_USD } from '@/lib/products'
import { services } from '@/lib/services'

export const runtime = 'nodejs'

const SYSTEM = `You are Byte, the friendly assistant on the website of Opulence Byte Private Limited, a technology studio based in Ranchi and Jamshedpur, Jharkhand, India.

What Opulence Byte offers:
${services.map((s) => `- ${s.title}: ${s.text}`).join('\n')}

Ready-made SaaS products (browse at /products, each has a details page at /products/<slug>):
${products.map((p) => `- ${p.name} (/products/${p.slug}, ${p.category}): ${p.summary}`).join('\n')}

How buying works: a visitor signs in with Google or GitHub, opens a product and requests a tailored quote for a refundable-against-purchase fee of $${QUOTE_FEE_USD}, paid securely by card or UPI. The team replies by email with pricing and a demo. For custom projects they can use the contact form on the home page, email hello@opulencebyte.com or call +91 8757924410.

Guidelines: answer in two to four short sentences of plain text (no markdown headings or tables). Recommend the most relevant product or service and mention its page path. Never invent prices, client names, certifications or delivery dates; say the team will confirm them in the quote. If a question is unrelated to the business, answer briefly and steer back.`

const hits = new Map<string, { count: number; reset: number }>()
function limited(ip: string) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.reset < now) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false }
  entry.count += 1
  return entry.count > 12
}

function fallbackReply(text: string) {
  const q = text.toLowerCase()
  const match = products.find((p) => [p.name, p.category, ...p.name.split(' '), p.slug.replace('-', ' ')].some((w) => w.length > 3 && q.includes(w.toLowerCase())))
    || (q.includes('hotel') && products.find((p) => p.slug === 'hotel-erp'))
    || (q.includes('hospital') && products.find((p) => p.slug === 'hospital-erp'))
    || (q.includes('school') && products.find((p) => p.slug === 'school-erp'))
  if (match) return `${match.name} sounds like a fit: ${match.tagline} See the details at /products/${match.slug}, and sign in to request a tailored quote for $${QUOTE_FEE_USD}.`
  if (/price|cost|quote/.test(q)) return `Every product is priced to your setup. Sign in, open any product at /products and request a quote for $${QUOTE_FEE_USD}; the team replies by email with pricing and a demo.`
  if (/website|app|design|automation|ai/.test(q)) return 'We design and build websites, mobile apps, automation and AI agents. Tell us about it with the contact form on the home page, or email hello@opulencebyte.com.'
  return `We build custom software and offer ${products.length} ready-made SaaS products for hospitals, hotels, schools, retail and more. Browse them at /products, or ask me about your industry.`
}

function textStream(text: string) {
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return textStream('You are sending messages quickly. Please wait a moment and try again.')

  let messages: Anthropic.MessageParam[] = []
  try {
    const body = await request.json()
    messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: { role?: string; content?: unknown }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content.slice(0, 1500) }))
    while (messages.length && messages[0].role !== 'user') messages.shift()
  } catch { /* fall through */ }
  const last = messages.at(-1)
  if (!last || last.role !== 'user') return textStream('Ask me anything about our products or services.')

  if (!process.env.ANTHROPIC_API_KEY) return textStream(fallbackReply(String(last.content)))

  const client = new Anthropic()
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.beta.messages.stream({
          model: 'claude-opus-5-5',
          max_tokens: 1024,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'low' },
          system: SYSTEM,
          messages,
        })
        let sent = false
        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            sent = true
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        const final = await response.finalMessage()
        if (!sent || final.stop_reason === 'refusal') controller.enqueue(encoder.encode(fallbackReply(String(last.content))))
      } catch (error) {
        console.error('[chat]', error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error)
        controller.enqueue(encoder.encode(fallbackReply(String(last.content))))
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}
