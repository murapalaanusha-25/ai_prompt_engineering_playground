'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Zap, Mail, Lock, Eye, EyeOff, User, ArrowLeft,
  CheckCircle, AlertCircle, Loader2, ArrowRight, Send,
} from 'lucide-react'

type View = 'signin' | 'signup' | 'forgot' | 'reset' | 'sent' | 'done'

/* ─── shared primitives ──────────────────────────────────────── */

const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '11px 14px 11px 42px',
  fontSize: 14,
  color: 'var(--text)',
  fontFamily: 'inherit',
  transition: 'border-color .18s, box-shadow .18s',
  lineHeight: 1.5,
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 13.5,
  fontWeight: 500,
  color: 'var(--text-2)',
  marginBottom: 6,
  lineHeight: 1.4,
}

function InputWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {children}
    </div>
  )
}

function InputIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', left: 13,
      color: 'var(--text-3)', pointerEvents: 'none',
      display: 'flex', alignItems: 'center',
    }}>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 9,
      background: 'var(--red-light)', border: '1px solid var(--red-border)',
      borderRadius: 9, padding: '11px 13px',
      fontSize: 13.5, color: 'var(--red)', lineHeight: 1.5,
    }}>
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
      {message}
    </div>
  )
}

function PrimaryBtn({
  loading, children, onClick, type = 'submit',
}: {
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'submit' | 'button'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={!!loading}
      className="pl-primary"
      style={{
        background: 'var(--accent)', color: '#fff', border: 'none',
        borderRadius: 10, padding: '12px 0', fontSize: 14.5, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        boxShadow: '0 2px 10px rgba(184,92,42,0.2)',
      }}
    >
      {loading && <Loader2 size={15} className="pl-spin" />}
      {children}
    </button>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function GoogleBtn({ label }: { label: string }) {
  return (
    <button
      type="button"
      style={{
        width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: '11px 0', fontSize: 13.5, fontWeight: 500,
        color: 'var(--text-2)', fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        transition: 'background .13s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-sunken)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.36 22.56 15.57 22.56 12.25z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  )
}

function Logo() {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: 'linear-gradient(135deg, #B85C2A, #8C3D14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(184,92,42,0.3)',
      }}>
        <Zap size={17} color="#fff" fill="#fff" />
      </div>
      <span style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.2px' }}>
        PromptLab
      </span>
    </Link>
  )
}

/* ─── Sign In ────────────────────────────────────────────────── */
function SignIn({ go }: { go: (v: View) => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim()) return setError('Email address is required.')
    if (!pw) return setError('Password is required.')
    setLoading(true)
    setTimeout(() => router.push('/playground'), 1300)
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.2px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
          Sign in to your workspace to continue.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GoogleBtn label="Continue with Google" />
        <Divider label="or sign in with email" />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ErrorBanner message={error} />

          <div>
            <label style={LABEL_STYLE}>Email address</label>
            <InputWrap>
              <InputIcon><Mail size={15} strokeWidth={1.8} /></InputIcon>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                style={INPUT_BASE}
              />
            </InputWrap>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Password</label>
              <button
                type="button" onClick={() => go('forgot')}
                style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <InputWrap>
              <InputIcon><Lock size={15} strokeWidth={1.8} /></InputIcon>
              <input
                type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                placeholder="Enter your password" autoComplete="current-password"
                style={{ ...INPUT_BASE, paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 13, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2, transition: 'color .13s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                {showPw ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
              </button>
            </InputWrap>
          </div>

          <div style={{ marginTop: 2 }}>
            <PrimaryBtn loading={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </PrimaryBtn>
          </div>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13.5, color: 'var(--text-3)' }}>
        Don't have an account?{' '}
        <button
          onClick={() => go('signup')}
          style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
        >
          Create one free
        </button>
      </p>
    </>
  )
}

/* ─── Sign Up ────────────────────────────────────────────────── */
function SignUp({ go }: { go: (v: View) => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pwLen = pw.length
  const strength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : 3
  const strengthColors = ['', '#C0392B', '#B85C2A', '#2D7A55']
  const strengthLabels = ['', 'Too short', 'Moderate', 'Strong']

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Please enter your name.')
    if (!email.trim()) return setError('Email address is required.')
    if (pwLen < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    setTimeout(() => router.push('/playground'), 1300)
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.2px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
          Free forever. No credit card required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <GoogleBtn label="Sign up with Google" />
        <Divider label="or sign up with email" />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ErrorBanner message={error} />

          <div>
            <label style={LABEL_STYLE}>Full name</label>
            <InputWrap>
              <InputIcon><User size={15} strokeWidth={1.8} /></InputIcon>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ada Lovelace" autoComplete="name"
                style={INPUT_BASE}
              />
            </InputWrap>
          </div>

          <div>
            <label style={LABEL_STYLE}>Email address</label>
            <InputWrap>
              <InputIcon><Mail size={15} strokeWidth={1.8} /></InputIcon>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                style={INPUT_BASE}
              />
            </InputWrap>
          </div>

          <div>
            <label style={LABEL_STYLE}>Password</label>
            <InputWrap>
              <InputIcon><Lock size={15} strokeWidth={1.8} /></InputIcon>
              <input
                type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                placeholder="At least 6 characters" autoComplete="new-password"
                style={{ ...INPUT_BASE, paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 13, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2, transition: 'color .13s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                {showPw ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
              </button>
            </InputWrap>
            {pwLen > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--border)', transition: 'background .25s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: strengthColors[strength], minWidth: 62, textAlign: 'right' }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 2 }}>
            <PrimaryBtn loading={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </PrimaryBtn>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>
        </form>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--text-3)' }}>
        Already have an account?{' '}
        <button
          onClick={() => go('signin')}
          style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
        >
          Sign in
        </button>
      </p>
    </>
  )
}

/* ─── Forgot Password ────────────────────────────────────────── */
function ForgotPassword({ go }: { go: (v: View) => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => go('sent'), 1200)
  }

  return (
    <>
      <button
        onClick={() => go('signin')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 24, padding: 0, transition: 'color .13s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
      >
        <ArrowLeft size={15} strokeWidth={1.8} /> Back to sign in
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.2px' }}>
          Reset your password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>
          Enter the email address linked to your account and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={LABEL_STYLE}>Email address</label>
          <InputWrap>
            <InputIcon><Mail size={15} strokeWidth={1.8} /></InputIcon>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              style={INPUT_BASE}
            />
          </InputWrap>
        </div>

        <PrimaryBtn loading={loading}>
          {loading ? 'Sending link…' : <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>Send reset link <Send size={14} strokeWidth={2} /></span>}
        </PrimaryBtn>
      </form>
    </>
  )
}

/* ─── Email Sent ─────────────────────────────────────────────── */
function EmailSent({ go }: { go: (v: View) => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--green-light)', border: '1.5px solid var(--green-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 22px',
      }}>
        <Mail size={22} color="var(--green)" strokeWidth={1.8} />
      </div>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.2px' }}>
        Check your inbox
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 28px' }}>
        We've sent a password reset link to your email. It should arrive within a minute.
      </p>
      <button
        onClick={() => go('reset')}
        style={{
          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10,
          padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
          boxShadow: '0 2px 10px rgba(184,92,42,0.2)',
        }}
      >
        I have the link <ArrowRight size={14} strokeWidth={2} />
      </button>
      <p style={{ marginTop: 22, fontSize: 13.5, color: 'var(--text-3)' }}>
        Didn't receive it?{' '}
        <button
          onClick={() => go('forgot')}
          style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 500, padding: 0 }}
        >
          Send again
        </button>
      </p>
    </div>
  )
}

/* ─── Reset Password ─────────────────────────────────────────── */
function ResetPassword({ go }: { go: (v: View) => void }) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isMatch = confirm.length > 0 && pw === confirm
  const isMismatch = confirm.length > 0 && pw !== confirm

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    if (pw !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    setTimeout(() => go('done'), 1200)
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.2px' }}>
          Choose a new password
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
          Make it at least 6 characters and something only you'll remember.
        </p>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorBanner message={error} />

        <div>
          <label style={LABEL_STYLE}>New password</label>
          <InputWrap>
            <InputIcon><Lock size={15} strokeWidth={1.8} /></InputIcon>
            <input
              type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
              placeholder="At least 6 characters" autoComplete="new-password"
              style={{ ...INPUT_BASE, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 13, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2, transition: 'color .13s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              {showPw ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
            </button>
          </InputWrap>
        </div>

        <div>
          <label style={LABEL_STYLE}>Confirm password</label>
          <InputWrap>
            <InputIcon>
              {isMatch
                ? <CheckCircle size={15} strokeWidth={2} color="var(--green)" />
                : <Lock size={15} strokeWidth={1.8} />}
            </InputIcon>
            <input
              type={showCf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your new password" autoComplete="new-password"
              style={{
                ...INPUT_BASE, paddingRight: 44,
                borderColor: isMismatch ? 'var(--red-border)' : isMatch ? 'var(--green-border)' : undefined,
              }}
            />
            <button type="button" onClick={() => setShowCf(v => !v)}
              style={{ position: 'absolute', right: 13, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2, transition: 'color .13s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              {showCf ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
            </button>
          </InputWrap>
          {isMismatch && (
            <p style={{ fontSize: 12.5, color: 'var(--red)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertCircle size={13} strokeWidth={2} /> Passwords don't match
            </p>
          )}
          {isMatch && (
            <p style={{ fontSize: 12.5, color: 'var(--green)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={13} strokeWidth={2} /> Passwords match
            </p>
          )}
        </div>

        <div style={{ marginTop: 2 }}>
          <PrimaryBtn loading={loading}>
            {loading ? 'Updating password…' : 'Update password'}
          </PrimaryBtn>
        </div>
      </form>
    </>
  )
}

/* ─── All Done ───────────────────────────────────────────────── */
function AllDone() {
  const router = useRouter()
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--green-light)', border: '1.5px solid var(--green-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 22px',
      }}>
        <CheckCircle size={22} color="var(--green)" strokeWidth={2} />
      </div>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.2px' }}>
        Password updated
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 28px' }}>
        Your password has been changed successfully. You can now sign in with your new credentials.
      </p>
      <button
        onClick={() => router.push('/playground')}
        style={{
          background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10,
          padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 7,
          boxShadow: '0 2px 10px rgba(184,92,42,0.2)',
        }}
      >
        Go to Playground <ArrowRight size={14} strokeWidth={2} />
      </button>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────── */
function AuthInner() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>((searchParams.get('view') as View) ?? 'signin')
  const showTabs = view === 'signin' || view === 'signup'

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: '32px 20px',
    }}>
      {/* Subtle radial glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 700px 500px at 60% 10%, rgba(184,92,42,0.04) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo />
        </div>

        {/* Tabs */}
        {showTabs && (
          <div style={{
            display: 'flex', background: 'var(--bg-sunken)',
            border: '1px solid var(--border)', borderRadius: 11,
            padding: 4, marginBottom: 14, gap: 3,
          }}>
            {(['signin', 'signup'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8,
                  border: view === v ? '1px solid var(--border-soft)' : '1px solid transparent',
                  fontSize: 13.5, fontWeight: view === v ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  background: view === v ? 'var(--bg-card)' : 'transparent',
                  color: view === v ? 'var(--text)' : 'var(--text-2)',
                  boxShadow: view === v ? 'var(--shadow-xs)' : 'none',
                }}>
                {v === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '30px 28px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {view === 'signin' && <SignIn        go={setView} />}
          {view === 'signup' && <SignUp        go={setView} />}
          {view === 'forgot' && <ForgotPassword go={setView} />}
          {view === 'sent'   && <EmailSent     go={setView} />}
          {view === 'reset'  && <ResetPassword  go={setView} />}
          {view === 'done'   && <AllDone />}
        </div>

        {/* Footer note */}
        {view === 'signin' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>
            No account needed —{' '}
            <Link href="/playground" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              try the Playground free
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={20} color="var(--text-3)" className="pl-spin" />
      </div>
    }>
      <AuthInner />
    </Suspense>
  )
}
