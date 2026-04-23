'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { Key, Cpu, Info, Eye, EyeOff, Check, ExternalLink } from 'lucide-react'

const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" }
const LABEL: React.CSSProperties = { display: 'block', fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', marginBottom: 7 }
const HINT:  React.CSSProperties = { fontSize: 12, color: 'var(--text-3)', marginTop: 7, lineHeight: 1.6 }
const INPUT: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '10px 13px', fontSize: 13.5, color: 'var(--text)', fontFamily: 'inherit', transition: 'border-color .2s, box-shadow .2s' }
const CARD:  React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: '24px 26px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }

function SectionHeader({ Icon, title, desc }: { Icon: React.ElementType; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 22 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-sunken)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="var(--text-2)" strokeWidth={1.8} />
      </div>
      <div>
        <h2 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [apiKey,    setApiKey]    = useState('')
  const [showKey,   setShowKey]   = useState(false)
  const [evalModel, setEvalModel] = useState('mistral-7b')
  const [maxTokens, setMaxTokens] = useState(1024)
  const [saved,     setSaved]     = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2200) }

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 620, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.3px' }}>Settings</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Configure your workspace preferences.</p>
        </div>

        {/* API Keys */}
        <div style={CARD}>
          <SectionHeader
            Icon={Key}
            title="API Keys"
            desc="Keys are stored in your browser only and never sent to our servers."
          />

          <div>
            <label style={LABEL}>OpenRouter API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-or-v1-…"
                style={{ ...INPUT, paddingRight: 42, ...MONO, fontSize: 13 }}
              />
              <button onClick={() => setShowKey(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p style={HINT}>
              Get a free key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                openrouter.ai/keys <ExternalLink size={11} />
              </a>
              {' '}— the app works without one using built-in mock responses.
            </p>
          </div>
        </div>

        {/* Model defaults */}
        <div style={CARD}>
          <SectionHeader
            Icon={Cpu}
            title="Model defaults"
            desc="These parameters apply to every run unless overridden in the Playground."
          />

          <div style={{ marginBottom: 22 }}>
            <label style={LABEL}>Evaluator model</label>
            <select value={evalModel} onChange={e => setEvalModel(e.target.value)}
              style={{ ...INPUT, cursor: 'pointer' }}>
              <option value="mistral-7b">Mistral 7B — fast, free</option>
              <option value="mixtral-8x7b">Mixtral 8x7B — more accurate, free</option>
              <option value="llama3">Llama 3 — alternative</option>
            </select>
            <p style={HINT}>Scores responses on clarity, relevance, completeness, and quality.</p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ ...LABEL, marginBottom: 0 }}>Max output tokens</label>
              <span style={{ fontSize: 13, color: 'var(--accent)', ...MONO, fontWeight: 600 }}>{maxTokens.toLocaleString()}</span>
            </div>
            <input type="range" min="256" max="4096" step="256" value={maxTokens}
              onChange={e => setMaxTokens(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', ...MONO }}>256 — concise</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', ...MONO }}>4,096 — detailed</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-sunken)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={17} color="var(--text-2)" strokeWidth={1.8} />
            </div>
            <div>
              <h2 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>About</h2>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Version and build information.</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Version',      '1.0.0-beta'],
              ['Framework',    'Next.js 14.2'],
              ['LLM provider', 'OpenRouter (free tier)'],
              ['Models',       'Llama 3, Mistral 7B, Gemma 7B, Mixtral 8x7B, Phi-3'],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
                <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{k}</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', ...MONO }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={save}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: saved ? 'var(--green-light)' : 'var(--accent)', color: saved ? 'var(--green)' : '#fff', border: saved ? '1.5px solid #A8D8C0' : 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .25s', boxShadow: saved ? 'none' : '0 2px 10px rgba(184,92,42,0.22)' }}>
          {saved ? <><Check size={15} strokeWidth={2.5} /> Saved</> : 'Save settings'}
        </button>
      </div>
    </AppShell>
  )
}
