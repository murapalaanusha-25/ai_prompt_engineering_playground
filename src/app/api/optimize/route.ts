import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { prompt?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { prompt } = body
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  const key = process.env.GROQ_API_KEY
  if (!key || key.trim() === '') {
    return NextResponse.json({ error: 'GROQ_API_KEY not set in .env.local' }, { status: 500 })
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are a prompt engineering expert. Rewrite the prompt below to be clearer, more specific, and get better results from an AI. Keep the same intent. Return ONLY the improved prompt, nothing else.\n\nOriginal prompt: ${prompt}`,
      }],
    }),
  })

  const data = await res.json()
  const optimized = data.choices?.[0]?.message?.content?.trim()

  if (!optimized) return NextResponse.json({ error: 'Empty response' }, { status: 500 })
  return NextResponse.json({ optimized })
}
