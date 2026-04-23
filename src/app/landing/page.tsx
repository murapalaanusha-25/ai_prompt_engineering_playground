'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap, BarChart2, Wand2, BookOpen, History, Gift,
  ArrowRight, Check,
} from 'lucide-react'

const MODELS = [
  { name: 'Llama 3.3',      color: '#2A5E7B', bg: '#EAF3F8', border: '#C0D8E8' },
  { name: 'Mistral Small',   color: '#7B5EA7', bg: '#F2EEF8', border: '#C8B8E8' },
  { name: 'Gemma 3',     color: '#B85C2A', bg: '#FAF0E8', border: '#E0C0A0' },
  { name: 'Gemma 3 12B', color: '#2A7B5E', bg: '#E8F5F0', border: '#A8D8C0' },
  { name: 'Qwen3 4B',   color: '#7B3A5E', bg: '#F8EEF3', border: '#D0A8C0' },
]

const FEATURES = [
  { Icon: Zap,       title: 'Run prompts in parallel',    desc: 'Send your prompt to up to 5 models at once and see who answers best — no waiting.'         },
  { Icon: BarChart2, title: 'AI scores every response',   desc: 'A second model quietly rates clarity, relevance, and completeness on each run.'             },
  { Icon: Wand2,     title: 'One-click optimisation',     desc: 'PromptLab rewrites your prompt automatically to get better, more consistent results.'       },
  { Icon: BookOpen,  title: 'Library of starter prompts', desc: '12 tested templates for coding, writing, analysis, planning, and more to get you started.' },
  { Icon: History,   title: 'Every run is saved',         desc: 'Your full experiment history is always there. Roll back, compare, or re-run any time.'      },
  { Icon: Gift,      title: 'Free, always',               desc: 'All five models run through OpenRouter\'s free tier — no credits, no paywalls.'             },
]

const TYPEWRITER_PROMPTS = [
  'Explain quantum entanglement to a 10-year-old…',
  'Review this Python function for edge cases…',
  'What are the pros and cons of remote work?',
  'Create a 30-day plan to learn TypeScript…',
  'Summarise this research paper in 3 bullets…',
]

function TypewriterText() {
  const [idx,     setIdx]     = useState(0)
  const [chars,   setChars]   = useState(0)
  const [erasing, setErasing] = useState(false)
  const [blink,   setBlink]   = useState(true)

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const text = TYPEWRITER_PROMPTS[idx]
    if (!erasing && chars < text.length) {
      const t = setTimeout(() => setChars(c => c + 1), 38)
      return () => clearTimeout(t)
    }
    if (!erasing && chars === text.length) {
      const t = setTimeout(() => setErasing(true), 2400)
      return () => clearTimeout(t)
    }
    if (erasing && chars > 0) {
      const t = setTimeout(() => setChars(c => c - 1), 18)
      return () => clearTimeout(t)
    }
    if (erasing && chars === 0) {
      setErasing(false)
      setIdx(i => (i + 1) % TYPEWRITER_PROMPTS.length)
    }
  }, [chars, erasing, idx])

  return (
    <span style={{ color: 'var(--text-2)', fontFamily: "'DM Mono', monospace", fontSize: 13.5, lineHeight: 1.6 }}>
      {TYPEWRITER_PROMPTS[idx].slice(0, chars)}
      <span style={{ opacity: blink ? 1 : 0, color: 'var(--accent)' }}>|</span>
    </span>
  )
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(249,246,241,0.92)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', height: 58, gap: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#B85C2A,#8C3D14)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(184,92,42,0.25)' }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 18, letterSpacing: '-0.3px' }}>PromptLab</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/auth" style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        <Link href="/playground"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: '#fff', padding: '8px 18px', borderRadius: 9, textDecoration: 'none', boxShadow: '0 2px 8px rgba(184,92,42,0.22)' }}>
          Try free <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, padding: '120px 32px 80px', maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-light)', border: '1px solid #EDCDB0', borderRadius: 20, padding: '6px 16px', marginBottom: 36, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', flexShrink: 0 }} />
          5 free models — no API key needed to start
        </div>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-2px', marginBottom: 24, color: 'var(--text)' }}>
          Find out which AI<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>actually answers better.</em>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.75 }}>
          Run your prompt across Llama, Mistral, Gemma, Mixtral, and Phi-3 at the same time. Get AI scores. Refine. Repeat.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href="/playground"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#fff', padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(184,92,42,0.28)' }}>
            <Zap size={16} fill="#fff" strokeWidth={0} /> Open Playground
          </Link>
          <Link href="/library"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', color: 'var(--text-2)', padding: '14px 30px', borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            Browse templates
          </Link>
        </div>

        {/* Mock prompt box */}
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', textAlign: 'left', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>prompt.txt</span>
          </div>
          <TypewriterText />
          <div style={{ marginTop: 18, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {MODELS.map(m => (
              <span key={m.name} style={{ fontSize: 11.5, fontFamily: "'DM Mono', monospace", background: m.bg, color: m.color, border: `1px solid ${m.border}`, padding: '4px 10px', borderRadius: 6, fontWeight: 500 }}>{m.name}</span>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>running…</span>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ padding: '72px 32px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 34, fontWeight: 400, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Everything you need, nothing you don't.
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Designed for people who care about prompt quality.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="pl-card"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--bg-sunken)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.Icon size={20} color="var(--accent)" strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 7, color: 'var(--text)' }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Model strip ──────────────────────────────────────── */}
      <section style={{ padding: '56px 32px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 28 }}>Free models included</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {MODELS.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 9, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 10, padding: '10px 18px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: m.color }}>{m.name}</span>
              <span style={{ fontSize: 10, background: '#E8F5F0', color: '#2A7B5E', border: '1px solid #A8D8C0', padding: '2px 6px', borderRadius: 4, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>FREE</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '96px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 38, fontWeight: 400, marginBottom: 14, letterSpacing: '-1px' }}>
          Start comparing models today.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 14 }}>No account required. No credit card. Free forever.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {['5 free models', 'AI evaluation', 'Prompt optimiser', 'Full history'].map(f => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-2)' }}>
              <Check size={15} color="#2A7B5E" strokeWidth={2.5} /> {f}
            </span>
          ))}
        </div>
        <Link href="/playground"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#fff', padding: '15px 36px', borderRadius: 13, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(184,92,42,0.28)' }}>
          <Zap size={16} fill="#fff" strokeWidth={0} /> Open the Playground
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
        PromptLab · Built with Next.js · Models via OpenRouter
      </footer>
    </div>
  )
}
