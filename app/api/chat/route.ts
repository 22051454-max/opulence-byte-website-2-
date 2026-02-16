import { streamText } from 'ai'

const systemPrompt = `You are a helpful AI assistant for Opulence Byte, a technology company specializing in secure, scalable digital solutions. 

Company Information:
- Founded by Avinash Singh Munda
- Core Services: Mobile & Web Development, Cloud & DevOps Engineering, Cybersecurity, AI & ML Solutions, UI/UX Design, Strategic Consulting
- Mission: Enable digital transformation with security at its core
- Phone: +91 80843 64410

You should:
1. Be knowledgeable about all services offered
2. Be helpful and professional
3. Direct customers to contact information when appropriate
4. Mention the founder's vision and expertise
5. Highlight the company's commitment to security and scalability

Keep responses concise and friendly. When asked about specific technical services, provide helpful guidance and suggest contacting the team for detailed consultations.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Use the default Vercel AI Gateway or OpenAI if available
    const result = streamText({
      model: process.env.OPENAI_API_KEY ? 'openai/gpt-3.5-turbo' : 'openai/gpt-4-mini',
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    return (await result).toDataStreamResponse()
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
