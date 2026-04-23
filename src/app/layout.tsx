import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PromptLab — AI Prompt Engineering Playground',
  description: 'Compare and optimise prompts across free LLMs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
