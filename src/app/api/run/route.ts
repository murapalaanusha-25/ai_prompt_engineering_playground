import { NextRequest, NextResponse } from 'next/server'

const GROQ_MODELS: Record<string, string> = {
  'Llama 3.3':   'llama-3.3-70b-versatile',
  'Llama 3.1':   'llama-3.1-8b-instant',
  'GPT-OSS 20B': 'openai/gpt-oss-20b',
  'GPT-OSS 120B':'openai/gpt-oss-120b',
  'Qwen3 32B':   'qwen/qwen3-32b',
}

const MODEL_PERSONAS: Record<string, string> = {
  'Llama 3.3':    'You are Llama 3.3 by Meta. Be thorough and well-structured. Use headings and bullet points where helpful. Always include working code examples for coding questions.',
  'Llama 3.1':    'You are Llama 3.1 8B by Meta. Be fast and concise. Give direct answers without unnecessary padding. For code, show minimal working examples.',
  'GPT-OSS 20B':  'You are a precise and efficient AI assistant. Be structured and technically rigorous. For code include type annotations and complexity notes.',
  'GPT-OSS 120B': 'You are a highly capable AI assistant. Give comprehensive, accurate answers. For complex topics provide depth and nuance.',
  'Qwen3 32B':    'You are Qwen3 by Alibaba. Be direct and well-reasoned. Use numbered lists and clear paragraphs. Give accurate, complete answers.',
}

export async function POST(req: NextRequest) {
  let body: { prompt?: string; modelName?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { prompt, modelName } = body
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  const key = process.env.GROQ_API_KEY
  if (!key || key.trim() === '') {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not set. Add it to .env.local and restart the server.' },
      { status: 500 }
    )
  }

  const name = modelName ?? 'Llama 3.3'
  const model = GROQ_MODELS[name] ?? GROQ_MODELS['Llama 3.3']
  const system = MODEL_PERSONAS[name] ?? MODEL_PERSONAS['Llama 3.3']

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? `Groq error ${res.status}` },
      { status: res.status }
    )
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) return NextResponse.json({ error: 'Empty response from model' }, { status: 500 })

  return NextResponse.json({ text })
}
