'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth?view=reset') }, [router])
  return null
}
