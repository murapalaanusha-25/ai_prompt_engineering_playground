'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Play, Wand2, ChevronDown, ChevronUp, Copy, Check,
  Zap, Sparkles, X, ArrowRight, Loader2, History,
  Trophy, Star, ChevronsDown, ChevronsUp,
} from 'lucide-react'
import AppShell from '@/components/AppShell'

/* ── Simple markdown renderer ────────────────────────────────── */
function MarkdownContent({ text, color }: { text: string; color?: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  function renderInline(str: string): React.ReactNode[] {
    const parts: React.ReactNode[] = []
    // Match **bold**, *italic*, `code`
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
    let last = 0, m: RegExpExecArray | null
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index))
      if (m[2]) parts.push(<strong key={m.index} style={{ fontWeight: 700, color: 'var(--text)' }}>{m[2]}</strong>)
      else if (m[3]) parts.push(<em key={m.index} style={{ fontStyle: 'italic' }}>{m[3]}</em>)
      else if (m[4]) parts.push(<code key={m.index} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.88em', background: 'var(--bg-sunken)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent)' }}>{m[4]}</code>)
      last = m.index + m[0].length
    }
    if (last < str.length) parts.push(str.slice(last))
    return parts
  }

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++ }
      nodes.push(
        <pre key={i} style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', overflowX: 'auto', margin: '10px 0', fontSize: 12.5, fontFamily: "'DM Mono', monospace", lineHeight: 1.7, color: 'var(--text)' }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++; continue
    }

    // Headings
    const h3 = line.match(/^### (.+)/)
    const h2 = line.match(/^## (.+)/)
    const h1 = line.match(/^# (.+)/)
    if (h1) { nodes.push(<h1 key={i} style={{ fontSize: 16, fontWeight: 700, margin: '14px 0 6px', color: 'var(--text)', fontFamily: "'Lora', serif" }}>{renderInline(h1[1])}</h1>); i++; continue }
    if (h2) { nodes.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 5px', color: 'var(--text)', fontFamily: "'Lora', serif" }}>{renderInline(h2[1])}</h2>); i++; continue }
    if (h3) { nodes.push(<h3 key={i} style={{ fontSize: 13.5, fontWeight: 700, margin: '10px 0 4px', color: 'var(--text)' }}>{renderInline(h3[1])}</h3>); i++; continue }

    // Bullet list
    if (/^[-*•] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) { items.push(lines[i].replace(/^[-*•] /, '')); i++ }
      nodes.push(
        <ul key={i} style={{ paddingLeft: 18, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {items.map((it, j) => <li key={j} style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text)' }}>{renderInline(it)}</li>)}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      nodes.push(
        <ol key={i} style={{ paddingLeft: 20, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {items.map((it, j) => <li key={j} style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text)' }}>{renderInline(it)}</li>)}
        </ol>
      )
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />)
      i++; continue
    }

    // Empty line
    if (line.trim() === '') {
      if (nodes.length > 0) nodes.push(<div key={i} style={{ height: 6 }} />)
      i++; continue
    }

    // Normal paragraph line
    nodes.push(
      <p key={i} style={{ fontSize: 13.5, lineHeight: 1.8, color: color ?? 'var(--text)', margin: '2px 0', wordBreak: 'break-word' }}>
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{nodes}</div>
}

type Scores      = { clarity: number; relevance: number; completeness: number; quality: number }
type HistoryItem = { id: number; prompt: string; modelNames: string[]; scores: number[]; time: string }
type Version     = { id: number; text: string }
type Tab         = 'responses' | 'compare'

const MODELS = [
  { id: 'llama33',  name: 'Llama 3.3',    tag: 'Meta',    color: '#2A5E7B', bg: '#EAF3F8', border: '#C0D8E8' },
  { id: 'llama31',  name: 'Llama 3.1',    tag: 'Meta',    color: '#7B5EA7', bg: '#F2EEF8', border: '#C8B8E8' },
  { id: 'gpt20b',   name: 'GPT-OSS 20B',  tag: 'OpenAI',  color: '#B85C2A', bg: '#FAF0E8', border: '#E0C0A0' },
  { id: 'gpt120b',  name: 'GPT-OSS 120B', tag: 'OpenAI',  color: '#2A7B5E', bg: '#E8F5F0', border: '#A8D8C0' },
  { id: 'qwen32b',  name: 'Qwen3 32B',    tag: 'Alibaba', color: '#7B3A5E', bg: '#F8EEF3', border: '#D0A8C0' },
]

const SCORE_KEYS: (keyof Scores)[] = ['clarity', 'relevance', 'completeness', 'quality']

const SEED_HISTORY: HistoryItem[] = [
  { id: 1, prompt: 'Explain machine learning in simple terms',                 modelNames: ['Llama 3.3', 'Llama 3.1'],               scores: [88, 91],     time: '2h ago' },
  { id: 2, prompt: 'Write a Python function to reverse a linked list',         modelNames: ['GPT-OSS 20B', 'Llama 3.3', 'Qwen3 32B'], scores: [95, 89, 87], time: '5h ago' },
  { id: 3, prompt: 'What are the ethical implications of autonomous weapons?', modelNames: ['Llama 3.3', 'GPT-OSS 120B'],             scores: [90, 93],     time: '1d ago' },
]

async function apiRun(prompt: string, modelName: string) {
  const r = await fetch('/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, modelName }) })
  const d = await r.json(); if (d.error) throw new Error(d.error); return d.text as string
}
async function apiEval(prompt: string, response: string, modelName: string) {
  const r = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, response, modelName }) })
  const d = await r.json(); if (d.error) throw new Error(d.error); return d as Scores
}
async function apiOptimize(prompt: string) {
  const r = await fetch('/api/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
  const d = await r.json(); if (d.error) throw new Error(d.error); return d.optimized as string
}

const MONO: React.CSSProperties  = { fontFamily: "'DM Mono', monospace" }
const LABEL: React.CSSProperties = { fontSize: 11, ...MONO, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontWeight: 500 }
const COLLAPSED_HEIGHT = 220 // px — roughly 10 lines

function Spinner({ color = 'var(--accent)', size = 14 }: { color?: string; size?: number }) {
  return <Loader2 size={size} color={color} className="pl-spin" />
}

function PlaygroundInner() {
  const searchParams = useSearchParams()
  const [prompt,     setPrompt]     = useState(() => searchParams.get('prompt') ?? '')
  const [selected,   setSelected]   = useState(['llama33', 'llama31', 'gpt20b'])
  const [responses,  setResponses]  = useState<Record<string, string>>({})
  const [scores,     setScores]     = useState<Record<string, Scores>>({})
  const [loading,    setLoading]    = useState<Record<string, boolean>>({})
  const [optimizing, setOptimizing] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [versions,   setVersions]   = useState<Version[]>([])
  const [history,    setHistory]    = useState<HistoryItem[]>(SEED_HISTORY)
  const [copied,     setCopied]     = useState<string | null>(null)
  const [temp,       setTemp]       = useState(0.7)
  const [showParam,  setShowParam]  = useState(false)
  const [activeTab,  setActiveTab]  = useState<Tab>('responses')
  // track which response cards are expanded (default: collapsed)
  const [expanded,   setExpanded]   = useState<Record<string, boolean>>({})
  const taRef = useRef<HTMLTextAreaElement>(null)

  const isRunning = Object.values(loading).some(Boolean)
  const hasOutput = Object.keys(responses).length > 0 || isRunning
  const scoredIds = selected.filter(id => scores[id])
  const allScored = scoredIds.length === selected.length && selected.length > 0 && !isRunning && hasOutput

  function avg(id: string): number | null {
    const s = scores[id]; if (!s) return null
    const vals = Object.values(s)
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  }

  // Compute winner from whoever has scores so far (updates live)
  const winnerId = scoredIds.length > 0
    ? scoredIds.reduce((best, id) => (avg(id) ?? 0) > (avg(best) ?? 0) ? id : best, scoredIds[0])
    : null

  // Auto-switch to Compare once all models finish scoring
  useEffect(() => {
    if (allScored) setActiveTab('compare')
  }, [allScored])

  function toggleModel(id: string) {
    setSelected(prev => prev.includes(id)
      ? prev.length > 1 ? prev.filter(m => m !== id) : prev
      : [...prev, id])
  }

  async function runPrompt() {
    if (!prompt.trim() || isRunning) return
    const vid = Date.now()
    setVersions(p => [...p, { id: vid, text: prompt }])
    const init: Record<string, boolean> = {}
    selected.forEach(id => { init[id] = true })
    setLoading(init)
    setResponses({})
    setScores({})
    setExpanded({})
    setSuggestion('')
    setActiveTab('responses')

    const realScores: Record<string, number> = {}

    await Promise.all(selected.map(async mid => {
      const m = MODELS.find(x => x.id === mid)!
      try {
        const text = await apiRun(prompt, m.name)
        setResponses(p => ({ ...p, [mid]: text }))
        setLoading(p => ({ ...p, [mid]: false }))
        const ev = await apiEval(prompt, text, m.name)
        setScores(p => ({ ...p, [mid]: ev }))
        realScores[mid] = Math.round(Object.values(ev).reduce((a, b) => a + b, 0) / 4)
      } catch (e: any) {
        setResponses(p => ({ ...p, [mid]: `Error: ${e.message}` }))
        setLoading(p => ({ ...p, [mid]: false }))
      }
    }))

    setHistory(p => [{
      id: vid,
      prompt: prompt.length > 72 ? prompt.slice(0, 72) + '…' : prompt,
      modelNames: selected.map(id => MODELS.find(m => m.id === id)!.name),
      scores: selected.map(id => realScores[id] ?? 0),
      time: 'just now',
    }, ...p.slice(0, 29)])
  }

  async function runOptimize() {
    if (!prompt.trim() || optimizing) return
    setOptimizing(true)
    try { setSuggestion(await apiOptimize(prompt)) }
    catch (e: any) { setSuggestion(`Error: ${e.message}`) }
    setOptimizing(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  const scoreColor = (n: number) => n >= 90 ? '#2A7B5E' : n >= 80 ? '#B85C2A' : '#9B3A2A'

  return (
    <AppShell>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside style={{ width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>

          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-soft)' }}>
            <p style={{ ...LABEL, marginBottom: 10 }}>Models</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {MODELS.map(m => {
                const on = selected.includes(m.id)
                return (
                  <button key={m.id} className="pl-model" onClick={() => toggleModel(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 9, border: `1.5px solid ${on ? m.border : 'var(--border-soft)'}`, background: on ? m.bg : 'transparent', textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: on ? m.color : 'var(--text-3)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: on ? m.color : 'var(--text-2)' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', ...MONO }}>{m.tag}</div>
                    </div>
                    {on && <span style={{ fontSize: 10, background: 'rgba(42,123,94,0.1)', color: '#2A7B5E', border: '1px solid rgba(42,123,94,0.22)', padding: '2px 6px', borderRadius: 4, ...MONO, fontWeight: 600 }}>ON</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
            <button onClick={() => setShowParam(v => !v)}
              style={{ ...LABEL, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: 0, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
              {showParam ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Parameters
            </button>
            {showParam && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={LABEL}>Temperature</span>
                  <span style={{ fontSize: 12, color: 'var(--accent)', ...MONO, fontWeight: 600 }}>{temp}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={temp}
                  onChange={e => setTemp(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>
                  {temp < 0.5 ? 'More focused' : temp < 1.2 ? 'Balanced' : 'More creative'}
                </p>
              </div>
            )}
          </div>

          {versions.length > 0 && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
              <p style={{ ...LABEL, marginBottom: 8 }}>Versions</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {versions.map((v, i) => (
                  <button key={v.id} onClick={() => setPrompt(v.text)} title={v.text}
                    style={{ fontSize: 11, ...MONO, background: 'var(--bg-sunken)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '3px 9px', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
                    v{i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={LABEL}>Your prompt</p>
              <span style={{ fontSize: 11, color: 'var(--text-3)', ...MONO }}>{prompt.length} chars</span>
            </div>

            <textarea ref={taRef} value={prompt} onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runPrompt() }}
              placeholder={"Write your prompt here…\n\nExamples:\n• Explain recursion like I'm 12\n• Write a cover letter for a design role\n• Pros and cons of learning Rust\n\nCtrl + Enter to run"}
              style={{ flex: 1, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 13px', fontSize: 13.5, color: 'var(--text)', resize: 'none', lineHeight: 1.75, minHeight: 180, transition: 'border-color .2s, box-shadow .2s' }}
            />

            {suggestion && (
              <div className="pl-rise" style={{ background: 'var(--accent-light)', border: '1.5px solid #EDCDB0', borderRadius: 10, padding: '13px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, ...MONO, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    <Sparkles size={12} /> Improved prompt
                  </span>
                  <button onClick={() => setSuggestion('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 11 }}>{suggestion}</p>
                <button onClick={() => { setPrompt(suggestion); setSuggestion('') }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
                  Use this <ArrowRight size={12} />
                </button>
              </div>
            )}

            <button className="pl-primary" onClick={runPrompt} disabled={!prompt.trim() || isRunning}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(184,92,42,0.2)' }}>
              {isRunning
                ? <><Spinner color="#fff" size={15} /> Running {selected.length} models…</>
                : <><Play size={14} fill="#fff" strokeWidth={0} /> Run Prompt <span style={{ fontSize: 11, opacity: .6, ...MONO, background: 'rgba(0,0,0,.15)', padding: '2px 6px', borderRadius: 4, marginLeft: 2 }}>Ctrl+↵</span></>}
            </button>

            <button className="pl-ghost" onClick={runOptimize} disabled={!prompt.trim() || optimizing}
              style={{ background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 0', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', opacity: optimizing ? 0.6 : 1 }}>
              {optimizing ? <><Spinner size={13} /> Improving…</> : <><Wand2 size={14} strokeWidth={1.8} /> Improve with AI</>}
            </button>
          </div>
        </aside>

        {/* ── Output panel ───────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)', height: '100%' }}>

          {!hasOutput && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-card)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                <Zap size={24} color="var(--text-3)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6, fontFamily: "'Lora', serif" }}>Ready when you are</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)', ...MONO }}>Select models · write a prompt · press run</p>
              </div>
              {history.length > 0 && (
                <div style={{ marginTop: 8, maxWidth: 480, width: '100%' }}>
                  <p style={{ ...LABEL, marginBottom: 10 }}>Recent experiments</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {history.slice(0, 3).map(h => (
                      <button key={h.id} onClick={() => setPrompt(h.prompt.replace('\u2026', ''))}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', transition: 'box-shadow .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                        <History size={13} color="var(--text-3)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.prompt}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', ...MONO, flexShrink: 0 }}>{h.time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasOutput && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* Tab bar */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                {([
                  { id: 'responses' as Tab, label: 'Responses' },
                  { id: 'compare'   as Tab, label: scoredIds.length > 0 ? `Compare (${scoredIds.length}/${selected.length})` : 'Compare' },
                ]).map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? 'var(--text)' : 'var(--text-2)', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'color .15s', marginBottom: -1 }}>
                    {t.label}
                  </button>
                ))}
                {winnerId && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#2A7B5E', fontWeight: 600 }}>
                    <Trophy size={13} strokeWidth={2} />
                    {MODELS.find(m => m.id === winnerId)?.name} leading
                  </div>
                )}
              </div>

              {/* ── Responses tab ─────────────────────────────── */}
              {activeTab === 'responses' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: selected.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
                    {selected.map(mid => {
                      const m        = MODELS.find(x => x.id === mid)!
                      const isLoad   = !!loading[mid]
                      const resp     = responses[mid]
                      const sc       = scores[mid]
                      const av       = avg(mid)
                      const isWinner = winnerId === mid
                      const isExp    = !!expanded[mid]
                      return (
                        <div key={mid} className="pl-card pl-rise"
                          style={{ background: 'var(--bg-card)', border: `1.5px solid ${isWinner ? '#A8D8C0' : 'var(--border)'}`, borderRadius: 13, boxShadow: isWinner ? '0 0 0 2px rgba(42,123,94,0.1)' : 'var(--shadow-sm)' }}>
                          {/* Card header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: m.bg, borderBottom: `1px solid ${m.border}`, borderRadius: '11px 11px 0 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.name}</span>
                              <span style={{ fontSize: 11, color: m.color, opacity: 0.55, ...MONO }}>{m.tag}</span>
                              {isWinner && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#2A7B5E', fontWeight: 600, background: 'rgba(42,123,94,0.1)', border: '1px solid rgba(42,123,94,0.25)', padding: '2px 7px', borderRadius: 4 }}><Trophy size={9} /> Best so far</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              {av !== null && (
                                <span style={{ fontSize: 15, fontWeight: 700, ...MONO, color: scoreColor(av) }}>
                                  {av}<span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>/100</span>
                                </span>
                              )}
                              {resp && !resp.startsWith('Error:') && (
                                <button className="pl-ghost" onClick={() => copy(resp, mid)}
                                  style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${m.border}`, color: copied === mid ? '#2A7B5E' : m.color, borderRadius: 7, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  {copied === mid ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Response body */}
                          <div style={{ padding: '14px 16px' }}>
                            {isLoad && !resp ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                                  <Spinner color={m.color} size={14} />
                                  <span className="pl-pulse" style={{ fontSize: 13, color: 'var(--text-3)' }}>{m.name} is thinking…</span>
                                </div>
                                {[90, 70, 82, 58, 76].map((w, i) => (
                                  <div key={i} className="pl-pulse" style={{ height: 9, borderRadius: 5, background: 'var(--bg-sunken)', width: `${w}%`, marginBottom: 9, animationDelay: `${i * 0.13}s` }} />
                                ))}
                              </div>
                            ) : resp ? (
                              <div>
                                <div style={{ position: 'relative', maxHeight: isExp ? 'none' : COLLAPSED_HEIGHT, overflow: 'hidden' }}>
                                  {resp.startsWith('Error:')
                                    ? <p style={{ fontSize: 13.5, color: 'var(--red)', lineHeight: 1.7, margin: 0 }}>{resp}</p>
                                    : <MarkdownContent text={resp} />
                                  }
                                  {!isExp && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(to bottom, transparent, var(--bg-card))' }} />
                                  )}
                                </div>
                                <button onClick={() => setExpanded(e => ({ ...e, [mid]: !isExp }))}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginTop: 10, padding: '5px 12px', width: '100%', justifyContent: 'center' }}>
                                  {isExp ? <><ChevronsUp size={13} /> View less</> : <><ChevronsDown size={13} /> View more</>}
                                </button>
                              </div>
                            ) : null}
                          </div>
                          {/* Score bars */}
                          {sc && (
                            <div className="pl-rise" style={{ borderTop: `1px solid ${m.border}`, padding: '12px 14px', background: m.bg, borderRadius: '0 0 11px 11px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                                {SCORE_KEYS.map(k => (
                                  <div key={k}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <span style={{ ...LABEL, textTransform: 'capitalize' }}>{k}</span>
                                      <span style={{ fontSize: 11, color: m.color, ...MONO, fontWeight: 600 }}>{sc[k]}</span>
                                    </div>
                                    <div style={{ height: 3, background: `${m.color}20`, borderRadius: 2, overflow: 'hidden' }}>
                                      <div className="pl-bar" style={{ height: '100%', width: `${sc[k]}%`, background: m.color, borderRadius: 2, opacity: 0.75 }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Compare tab ──────────────────────────────── */}
              {activeTab === 'compare' && (
                <div style={{ flex: 1, overflowY: 'scroll', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {scoredIds.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
                      <Spinner size={20} />
                      <p style={{ marginTop: 14, fontSize: 14, fontFamily: "'Lora', serif", fontStyle: 'italic' }}>Waiting for scores…</p>
                    </div>
                  )}

                  {/* Winner banner */}
                  {winnerId && (() => {
                    const w    = MODELS.find(m => m.id === winnerId)!
                    const wAvg = avg(winnerId)!
                    return (
                      <div className="pl-rise" style={{ background: w.bg, border: `1.5px solid ${w.border}`, borderRadius: 13, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Trophy size={20} color="#fff" strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 11, ...MONO, color: w.color, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 3 }}>
                            {allScored ? 'Best overall response' : 'Leading so far'}
                          </p>
                          <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Lora', serif", color: w.color }}>
                            {w.name} <span style={{ fontSize: 13, opacity: 0.6, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>by {w.tag}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 36, fontWeight: 800, ...MONO, color: w.color, lineHeight: 1 }}>{wAvg}</p>
                          <p style={{ fontSize: 11, color: w.color, opacity: 0.6, ...MONO }}>/100 overall</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Score cards */}
                  {scoredIds.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(scoredIds.length, 3)}, 1fr)`, gap: 12, flexShrink: 0 }}>
                      {scoredIds.slice().sort((a, b) => (avg(b) ?? 0) - (avg(a) ?? 0)).map((id, rank) => {
                        const m   = MODELS.find(x => x.id === id)!
                        const av  = avg(id)!
                        const isWin = id === winnerId
                        return (
                          <div key={id} style={{ background: 'var(--bg-card)', border: `1.5px solid ${isWin ? '#A8D8C0' : 'var(--border)'}`, borderRadius: 12, padding: '18px', textAlign: 'center', position: 'relative' }}>
                            {rank === 0 && <div style={{ position: 'absolute', top: 10, right: 10 }}><Star size={14} color="#2A7B5E" fill="#2A7B5E" /></div>}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.name}</span>
                            </div>
                            <p style={{ fontSize: 38, fontWeight: 800, ...MONO, color: isWin ? '#2A7B5E' : m.color, lineHeight: 1, marginBottom: 4 }}>{av}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-3)', ...MONO, marginBottom: 14 }}>avg score</p>
                            {scores[id] && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {SCORE_KEYS.map(k => (
                                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-3)', ...MONO, width: 80, textAlign: 'right', textTransform: 'capitalize', flexShrink: 0 }}>{k}</span>
                                    <div style={{ flex: 1, height: 4, background: 'var(--bg-sunken)', borderRadius: 2 }}>
                                      <div className="pl-bar" style={{ height: '100%', width: `${scores[id][k]}%`, background: m.color, borderRadius: 2, opacity: 0.7 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: m.color, ...MONO, fontWeight: 600, width: 24, flexShrink: 0 }}>{scores[id][k]}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Full breakdown table */}
                  {scoredIds.length >= 2 && (
                    <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 13, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Lora', serif" }}>Full breakdown</span>
                        <span style={{ fontSize: 10, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #EDCDB0', padding: '2px 7px', borderRadius: 4, ...MONO, fontWeight: 600 }}>AI scored</span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-sunken)' }}>
                            <th style={{ textAlign: 'left', padding: '9px 20px', ...LABEL }}>Metric</th>
                            {scoredIds.map(id => {
                              const m = MODELS.find(x => x.id === id)!
                              return <th key={id} style={{ textAlign: 'center', padding: '9px 16px', fontSize: 12, color: m.color, fontWeight: 700 }}>{m.name}</th>
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {SCORE_KEYS.map((k, ri) => (
                            <tr key={k} style={{ borderTop: '1px solid var(--border-soft)', background: ri % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                              <td style={{ padding: '10px 20px', fontSize: 13, color: 'var(--text-2)', textTransform: 'capitalize', fontWeight: 500 }}>{k}</td>
                              {scoredIds.map(id => {
                                const m    = MODELS.find(x => x.id === id)!
                                const val  = scores[id][k]
                                const best = Math.max(...scoredIds.map(i2 => scores[i2][k]))
                                return (
                                  <td key={id} style={{ padding: '10px 16px', textAlign: 'center' }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, ...MONO, color: val === best ? '#2A7B5E' : m.color }}>
                                      {val}{val === best && <Star size={9} style={{ marginLeft: 2, verticalAlign: 'middle' }} />}
                                    </span>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                          <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg-sunken)' }}>
                            <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, fontFamily: "'Lora', serif" }}>Overall</td>
                            {scoredIds.map(id => {
                              const m    = MODELS.find(x => x.id === id)!
                              const av   = avg(id)!
                              const isWin = id === winnerId
                              return (
                                <td key={id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  <div style={{ fontSize: 22, fontWeight: 800, ...MONO, color: isWin ? '#2A7B5E' : m.color }}>{av}</div>
                                  {isWin && <div style={{ fontSize: 10, color: '#2A7B5E', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}><Check size={10} /> best</div>}
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ height: 20, flexShrink: 0 }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={20} className="pl-spin" color="var(--text-3)" />
      </div>
    }>
      <PlaygroundInner />
    </Suspense>
  )
}