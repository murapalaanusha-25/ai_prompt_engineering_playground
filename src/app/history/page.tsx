'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Search, History, RefreshCw, Plus } from 'lucide-react'

const MODEL_COLORS: Record<string, string> = {
  'Llama 3.3': '#2A5E7B', 'Mistral Small': '#7B5EA7', 'Gemma 3': '#B85C2A',
  'Gemma 3 12B': '#2A7B5E', 'Qwen3 4B': '#7B3A5E',
}
const MODEL_BG: Record<string, string> = {
  'Llama 3.3': '#EAF3F8', 'Mistral Small': '#F2EEF8', 'Gemma 3': '#FAF0E8',
  'Gemma 3 12B': '#E8F5F0', 'Qwen3 4B': '#F8EEF3',
}

const ALL_HISTORY = [
  { id: 1, prompt: 'Explain machine learning in simple terms',                 models: ['Llama 3.3', 'Mistral Small'],                              scores: [88, 91],     time: '2h ago',  tag: 'Education', versions: 3 },
  { id: 2, prompt: 'Write a Python function to reverse a linked list',         models: ['Qwen3 4B', 'Mistral Small', 'Gemma 3'],               scores: [95, 89, 87], time: '5h ago',  tag: 'Coding',    versions: 1 },
  { id: 3, prompt: 'What are the ethical implications of autonomous weapons?', models: ['Llama 3.3', 'Gemma 3 12B'],                            scores: [90, 93],     time: '1d ago',  tag: 'Analysis',  versions: 2 },
  { id: 4, prompt: 'Summarise this research paper in 3 bullet points',         models: ['Llama 3.3', 'Gemma 3', 'Gemma 3 12B', 'Mistral Small'], scores: [88, 84, 92, 86], time: '2d ago', tag: 'Writing',  versions: 1 },
  { id: 5, prompt: 'Create a step-by-step plan to learn Rust in 30 days',      models: ['Gemma 3 12B', 'Qwen3 4B'],                         scores: [90, 85],     time: '3d ago',  tag: 'Planning',  versions: 4 },
  { id: 6, prompt: 'Write unit tests for this React component',                models: ['Mistral Small', 'Gemma 3'],                             scores: [87, 83],     time: '4d ago',  tag: 'Coding',    versions: 2 },
  { id: 7, prompt: 'Explain the CAP theorem with real-world examples',         models: ['Llama 3.3', 'Gemma 3 12B', 'Qwen3 4B'],              scores: [91, 94, 88], time: '5d ago',  tag: 'Education', versions: 1 },
  { id: 8, prompt: 'Draft a professional email declining a job offer',         models: ['Mistral Small'],                                         scores: [89],         time: '6d ago',  tag: 'Writing',   versions: 3 },
]

const TAGS = ['All', 'Coding', 'Education', 'Writing', 'Analysis', 'Planning']
const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" }

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [tag,    setTag]    = useState('All')

  const filtered = ALL_HISTORY.filter(h => {
    const matchSearch = !search || h.prompt.toLowerCase().includes(search.toLowerCase())
    const matchTag    = tag === 'All' || h.tag === tag
    return matchSearch && matchTag
  })

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.3px' }}>Experiment history</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{ALL_HISTORY.length} experiments saved</p>
          </div>
          <Link href="/playground"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#fff', padding: '9px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(184,92,42,0.22)' }}>
            <Plus size={14} strokeWidth={2.5} /> New experiment
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search experiments…"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '8px 14px 8px 36px', fontSize: 13.5, color: 'var(--text)', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => setTag(t)}
                style={{ fontSize: 13, padding: '7px 13px', borderRadius: 8, border: '1.5px solid', fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
                  borderColor: tag === t ? 'var(--accent)' : 'var(--border)',
                  background:  tag === t ? 'var(--accent-light)' : 'var(--bg-card)',
                  color:       tag === t ? 'var(--accent)' : 'var(--text-2)',
                  fontWeight:  tag === t ? 600 : 400 }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 15 }}>No experiments match your search.</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(item => (
                <div key={item.id}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', ...MONO, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <History size={11} strokeWidth={1.8} /> {item.time}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>v{item.versions}</span>
                      <span style={{ fontSize: 11, background: 'var(--bg-sunken)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 5, ...MONO }}>{item.tag}</span>
                      {item.models.slice(0, 3).map(m => (
                        <span key={m} style={{ fontSize: 11, color: MODEL_COLORS[m] ?? '#888', border: `1px solid ${MODEL_COLORS[m] ?? '#888'}28`, padding: '2px 7px', borderRadius: 5, ...MONO, background: MODEL_BG[m] ?? 'transparent' }}>{m}</span>
                      ))}
                      {item.models.length > 3 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>+{item.models.length - 3} more</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, ...MONO, color: Math.max(...item.scores) >= 90 ? '#2A7B5E' : '#B85C2A' }}>{Math.max(...item.scores)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>best</div>
                  </div>
                  <Link href="/playground"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg-sunken)', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 8, padding: '7px 13px', fontSize: 12.5, textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
                    <RefreshCw size={12} strokeWidth={2} /> Re-run
                  </Link>
                </div>
              ))}
            </div>
        }
      </div>
    </AppShell>
  )
}
