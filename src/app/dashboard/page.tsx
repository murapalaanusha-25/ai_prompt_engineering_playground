'use client'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import { Zap, BarChart2, History, Cpu, TrendingUp, RefreshCw, Plus } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" }
const CARD: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 13, boxShadow: 'var(--shadow-sm)',
}

const MODELS = [
  { name: 'Gemma 3 12B', color: '#2A7B5E', pct: 91 },
  { name: 'Qwen3 4B',   color: '#7B3A5E', pct: 88 },
  { name: 'Llama 3.3',      color: '#2A5E7B', pct: 87 },
  { name: 'Mistral Small',   color: '#7B5EA7', pct: 84 },
  { name: 'Gemma 3',     color: '#B85C2A', pct: 82 },
]

const RECENT = [
  { prompt: 'Explain machine learning in simple terms',                 models: 2, best: 91, time: '2h ago',  tag: 'Education' },
  { prompt: 'Write a Python function to reverse a linked list',         models: 3, best: 95, time: '5h ago',  tag: 'Coding'    },
  { prompt: 'What are the ethical implications of autonomous weapons?', models: 2, best: 93, time: '1d ago',  tag: 'Analysis'  },
  { prompt: 'Summarise this research paper in 3 bullet points',         models: 4, best: 89, time: '2d ago',  tag: 'Writing'   },
]

const STAT_ICONS = [Zap, BarChart2, History, Cpu]

export default function DashboardPage() {
  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.3px' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>An overview of your prompt experiments.</p>
          </div>
          <Link href="/playground"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#fff', padding: '9px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(184,92,42,0.22)' }}>
            <Plus size={14} strokeWidth={2.5} /> New experiment
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Prompts run',    value: '247', Icon: STAT_ICONS[0], color: '#B85C2A', sub: '+12 this week'       },
            { label: 'Avg quality',    value: '89',  Icon: STAT_ICONS[1], color: '#7B5EA7', sub: '↑ 3 pts vs last week' },
            { label: 'Versions saved', value: '89',  Icon: STAT_ICONS[2], color: '#2A7B5E', sub: 'across 47 prompts'   },
            { label: 'Free models',    value: '5',   Icon: STAT_ICONS[3], color: '#2A5E7B', sub: 'via OpenRouter'      },
          ].map(s => (
            <div key={s.label} style={{ ...CARD, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <s.Icon size={18} color={s.color} strokeWidth={1.8} />
                <span style={{ fontSize: 11, ...MONO, color: s.color, background: `${s.color}14`, padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>↑</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, ...MONO, color: 'var(--text)', marginBottom: 3, letterSpacing: '-1px' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', ...MONO }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Model performance */}
          <div style={{ ...CARD, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <TrendingUp size={16} color="var(--text-2)" strokeWidth={1.8} />
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Model performance</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {MODELS.map(m => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{m.name}</span>
                    <span style={{ fontSize: 12, ...MONO, color: 'var(--text-3)' }}>{m.pct}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-sunken)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3, opacity: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown */}
          <div style={{ ...CARD, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <BarChart2 size={16} color="var(--text-2)" strokeWidth={1.8} />
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Score breakdown</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Clarity',      score: 91, color: '#2A5E7B' },
                { label: 'Relevance',    score: 89, color: '#7B5EA7' },
                { label: 'Completeness', score: 86, color: '#B85C2A' },
                { label: 'Quality',      score: 90, color: '#2A7B5E' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, ...MONO, color: s.color }}>{s.score}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-sunken)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.score}%`, background: s.color, borderRadius: 3, opacity: 0.75 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent experiments */}
        <div style={CARD}>
          <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent experiments</h2>
            <Link href="/history" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          {RECENT.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < RECENT.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prompt}</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', ...MONO, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <History size={11} strokeWidth={1.8} /> {r.time}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.models} models</span>
                  <span style={{ fontSize: 11, background: 'var(--bg-sunken)', color: 'var(--text-2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 5, ...MONO }}>{r.tag}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700, ...MONO, color: r.best >= 90 ? '#2A7B5E' : '#B85C2A' }}>{r.best}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>best score</div>
              </div>
              <Link href="/playground"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg-sunken)', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 8, padding: '7px 13px', fontSize: 12.5, textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}>
                <RefreshCw size={12} strokeWidth={2} /> Re-run
              </Link>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  )
}
