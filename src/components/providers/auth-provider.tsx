'use client'

import { useEffect } from 'react'
import { useAuth } from '@/stores/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setLoading = useAuth((s) => s.setLoading)
  const setUser = useAuth((s) => s.setUser)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setUser(data?.user ?? null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <>{children}</>
}
