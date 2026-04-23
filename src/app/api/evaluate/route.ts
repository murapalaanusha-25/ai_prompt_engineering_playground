import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { prompt?: string; response?: string; modelName?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { prompt = '', response = '', modelName = '' } = body

  const key = process.env.GROQ_API_KEY
  if (!key || key.trim() === '') {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })
  }

  // Measure concrete properties of the response to anchor scores
  const wordCount = response.trim().split(/\s+/).length
  const hasCode = /```|def |function |const |class |import /.test(response)
  const hasStructure = /^#{1,3} |\n\n|\*\*|^\d+\.|^-\s/m.test(response)
  const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 10).length
  const promptWords = prompt.toLowerCase().split(/\s+/)
  const matchedWords = promptWords.filter(w => w.length > 4 && response.toLowerCase().includes(w)).length
  const relevanceRatio = Math.min(matchedWords / Math.max(promptWords.length, 1), 1)

  const evalPrompt = `You are a harsh, precise AI response grader. Your scores MUST vary — do NOT give the same number to different criteria.

ORIGINAL PROMPT: "${prompt.slice(0, 400)}"
MODEL: ${modelName}
RESPONSE: "${response.slice(0, 1000)}"

OBJECTIVE FACTS about this response:
- Word count: ${wordCount} words
- Contains code blocks: ${hasCode ? 'YES' : 'NO'}
- Has structured formatting: ${hasStructure ? 'YES' : 'NO'}  
- Sentence count: ${sentenceCount}
- Keyword overlap with prompt: ${Math.round(relevanceRatio * 100)}%

SCORING RULES — you MUST follow these exactly:
1. Scores range 60-98. Never give the same score to all 4 criteria.
2. CLARITY: Score based on structure and readability. Deduct if walls of text, no formatting.
3. RELEVANCE: Score based on keyword overlap (${Math.round(relevanceRatio * 100)}% overlap = roughly ${Math.round(55 + relevanceRatio * 40)} points baseline). Adjust up/down based on actual content match.
4. COMPLETENESS: Score based on depth. Under 80 words = max 72. 80-200 words = max 82. Over 200 words = up to 95 if thorough.
5. QUALITY: Your overall judgment of accuracy and usefulness.
6. The 4 scores MUST all be different numbers.

Reply with ONLY JSON, no other text:
{"clarity":0,"relevance":0,"completeness":0,"quality":0}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 80,
        temperature: 0.3,
        messages: [{ role: 'user', content: evalPrompt }],
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const json = JSON.parse(jsonMatch[0])
    const clamp = (n: unknown) => Math.max(60, Math.min(98, Math.round(Number(n) || 75)))

    // Apply objective overrides so identical responses can't get same scores
    let clarity      = clamp(json.clarity)
    let relevance    = clamp(json.relevance)
    let completeness = clamp(json.completeness)
    let quality      = clamp(json.quality)

    // Force completeness to reflect word count objectively
    if (wordCount < 80)       completeness = Math.min(completeness, 72)
    else if (wordCount < 150) completeness = Math.min(completeness, 82)

    // Force relevance to reflect keyword match objectively  
    const baseRelevance = Math.round(58 + relevanceRatio * 38)
    relevance = Math.round((relevance + baseRelevance) / 2)

    // Force all 4 to be different
    const scores = [clarity, relevance, completeness, quality]
    const seen = new Set<number>()
    const deduped = scores.map(s => {
      while (seen.has(s)) s = s + 1 > 98 ? s - 1 : s + 1
      seen.add(s)
      return s
    })
    ;[clarity, relevance, completeness, quality] = deduped

    return NextResponse.json({ clarity, relevance, completeness, quality })

  } catch (e: any) {
    return NextResponse.json(
      { error: `Evaluation failed: ${e.message}` },
      { status: 500 }
    )
  }
}