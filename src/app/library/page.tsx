'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import Link from 'next/link'
import {
  Search, Copy, Check, ArrowRight,
  GraduationCap, Code2, Mail, ListTodo,
  Scale, PenLine, FileText, Bug, Briefcase,
  BrainCircuit, Microscope, Swords,
} from 'lucide-react'

const LIBRARY = [
  { title: 'ELI5 Explainer',       cat: 'Education', Icon: GraduationCap, text: 'Explain [TOPIC] to a 10-year-old using a simple analogy and 3 bullet points.' },
  { title: 'Code Review',          cat: 'Coding',    Icon: Code2,         text: 'Review the following code for bugs, performance issues, and best practices:\n\n```\n[PASTE CODE HERE]\n```' },
  { title: 'Email Drafter',        cat: 'Writing',   Icon: Mail,          text: 'Write a professional email to [RECIPIENT] about [TOPIC]. Tone: [formal/friendly]. Key points: [POINTS].' },
  { title: 'Step-by-Step Plan',    cat: 'Planning',  Icon: ListTodo,      text: 'Create a detailed step-by-step plan to achieve [GOAL]. Include time estimates and potential blockers for each step.' },
  { title: 'Pros & Cons',          cat: 'Analysis',  Icon: Scale,         text: 'List 5 pros and 5 cons of [TOPIC]. Be balanced and objective. Include a one-sentence explanation for each point.' },
  { title: 'Story Starter',        cat: 'Creative',  Icon: PenLine,       text: 'Write the opening paragraph of a [GENRE] story set in [SETTING] featuring a protagonist who [TRAIT].' },
  { title: 'Summarise & Simplify', cat: 'Writing',   Icon: FileText,      text: 'Summarise the following text in 3 bullet points, then rewrite it in plain language:\n\n[PASTE TEXT HERE]' },
  { title: 'Debug My Code',        cat: 'Coding',    Icon: Bug,           text: 'Find and fix all bugs below. For each fix, explain what was wrong and why your change is correct:\n\n```\n[PASTE CODE HERE]\n```' },
  { title: 'Interview Prep',       cat: 'Career',    Icon: Briefcase,     text: 'I am interviewing for a [ROLE] at [COMPANY]. Give me 10 likely questions with ideal answers, focusing on [SKILL].' },
  { title: 'Analogy Generator',    cat: 'Education', Icon: BrainCircuit,  text: 'Explain [CONCEPT] using 3 different analogies for: a child, a high school student, and a domain expert.' },
  { title: 'First Principles',     cat: 'Analysis',  Icon: Microscope,    text: 'Break down [TOPIC] to its first principles. Start from fundamental truths and build up to the full picture.' },
  { title: "Devil's Advocate",     cat: 'Analysis',  Icon: Swords,        text: "Play devil's advocate against: [POSITION]. Give the strongest possible counterarguments." },
]

const CATS = ['All', 'Coding', 'Education', 'Writing', 'Analysis', 'Planning', 'Creative', 'Career']

const CAT_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  Coding:    { color: '#2A5E7B', bg: '#EAF3F8', border: '#C0D8E8' },
  Education: { color: '#7B5EA7', bg: '#F2EEF8', border: '#C8B8E8' },
  Writing:   { color: '#B85C2A', bg: '#FAF0E8', border: '#E0C0A0' },
  Analysis:  { color: '#2A7B5E', bg: '#E8F5F0', border: '#A8D8C0' },
  Planning:  { color: '#7B3A5E', bg: '#F8EEF3', border: '#D0A8C0' },
  Creative:  { color: '#7B6A2A', bg: '#F8F4E8', border: '#D0C0A0' },
  Career:    { color: '#2A5E7B', bg: '#EAF3F8', border: '#C0D8E8' },
}

const MONO: React.CSSProperties = { fontFamily: "'DM Mono', monospace" }

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [cat,    setCat]    = useState('All')
  const [copied, setCopied] = useState<number | null>(null)

  const filtered = LIBRARY.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.text.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (cat === 'All' || p.cat === cat)
  })

  function copy(text: string, i: number) {
    navigator.clipboard.writeText(text)
    setCopied(i); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, marginBottom: 4, letterSpacing: '-0.3px' }}>Prompt library</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Tested templates — click any card to load it in the Playground.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates…"
              style={{ width: '100%', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '8px 14px 8px 36px', fontSize: 13.5, color: 'var(--text)', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ fontSize: 13, padding: '7px 13px', borderRadius: 8, border: '1.5px solid', fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
                  borderColor: cat === c ? 'var(--accent)' : 'var(--border)',
                  background:  cat === c ? 'var(--accent-light)' : 'var(--bg-card)',
                  color:       cat === c ? 'var(--accent)' : 'var(--text-2)',
                  fontWeight:  cat === c ? 600 : 400 }}>
                {c}
              </button>
            ))}
          </div>
          <span style={{ ...MONO, fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} templates</span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.map((p, i) => {
            const cs = CAT_STYLE[p.cat] ?? CAT_STYLE.Writing
            return (
              <div key={i}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: cs.bg, border: `1px solid ${cs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <p.Icon size={18} color={cs.color} strokeWidth={1.8} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{p.title}</h3>
                  </div>
                  <span style={{ fontSize: 11, background: cs.bg, color: cs.color, border: `1px solid ${cs.border}`, padding: '3px 8px', borderRadius: 20, ...MONO, flexShrink: 0, marginLeft: 8, fontWeight: 500 }}>{p.cat}</span>
                </div>

                <div style={{ background: 'var(--bg-sunken)', borderRadius: 9, padding: '11px 13px', flex: 1 }}>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7,
                    display: '-webkit-box' as any, WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden', fontFamily: "'DM Mono', monospace" }}>
                    {p.text}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/playground?prompt=${encodeURIComponent(p.text)}`}
                    style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 6px rgba(184,92,42,0.18)' }}>
                    Use in Playground <ArrowRight size={13} strokeWidth={2.5} />
                  </Link>
                  <button onClick={() => copy(p.text, i)}
                    style={{ background: 'var(--bg-sunken)', border: '1.5px solid var(--border)', color: copied === i ? '#2A7B5E' : 'var(--text-2)', borderRadius: 9, padding: '9px 13px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'color .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {copied === i ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 15 }}>No templates match your search.</div>
        )}
      </div>
    </AppShell>
  )
}
