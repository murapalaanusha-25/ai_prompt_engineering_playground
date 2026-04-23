'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Clock, BookOpen, LayoutDashboard, Settings } from 'lucide-react'

const NAV = [
  { href: '/playground', label: 'Playground', Icon: Zap             },
  { href: '/history',    label: 'History',    Icon: Clock           },
  { href: '/library',    label: 'Library',    Icon: BookOpen        },
  { href: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/settings',   label: 'Settings',   Icon: Settings        },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>

      <header style={{
        display: 'flex', alignItems: 'center', height: 56, padding: '0 20px', gap: 4,
        background: 'var(--bg-nav)', borderBottom: '1px solid var(--border)',
        flexShrink: 0, boxShadow: 'var(--shadow-sm)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginRight: 14 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg, #B85C2A, #8C3D14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(184,92,42,0.28)',
          }}>
            <Zap size={15} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: "'Lora', serif", fontWeight: 500, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.2px' }}>PromptLab</span>
        </Link>

        <nav style={{ display: 'flex', gap: 1 }}>
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} className="pl-nav"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  fontSize: 13.5, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text)' : 'var(--text-2)',
                  background: active ? 'var(--bg-sunken)' : 'transparent',
                  textDecoration: 'none',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: 8,
                }}>
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #B85C2A, #7B5EA7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>A</div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Ada</span>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
