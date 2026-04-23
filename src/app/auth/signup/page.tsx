'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// /auth/signup redirects to the unified auth page pre-set to signup view
// The auth page uses URL search params to set initial view
export default function SignupRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth?view=signup') }, [router])
  return null
}
