'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth?view=forgot') }, [router])
  return null
}
