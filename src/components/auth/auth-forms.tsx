'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  User as UserIcon,
  Mail,
  Lock,
  Loader2,
  Store,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/stores/auth'
import { navigate } from '@/stores/router'
import { useToast } from '@/hooks/use-toast'

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name is at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Use 6 or more characters'),
})

export function AuthForms({ mode }: { mode: 'login' | 'register' }) {
  const setUser = useAuth((s) => s.setUser)
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const Schema = isLogin ? LoginSchema : RegisterSchema
    const parsed = Schema.safeParse(form)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        if (!errs[key]) errs[key] = issue.message
      }
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin
        ? { email: form.email, password: form.password }
        : form
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: isLogin ? 'Could not sign in' : 'Could not create account',
          description: data?.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      setUser(data.user)
      toast({
        title: isLogin ? `Welcome back, ${data.user.name.split(' ')[0]}` : `Account created`,
        description: isLogin
          ? 'You are now signed in.'
          : 'Your account is ready — happy shopping!',
      })
      navigate({ name: 'home' })
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Decorative background */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/20 dark:via-orange-950/20 dark:to-amber-950/20"
        aria-hidden
      />

      <button
        onClick={() => navigate({ name: 'home' })}
        className="mb-4 inline-flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </button>

      <Card className="shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white shadow">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Sign in to your Ember & Oak account to check out faster.'
              : 'Join Ember & Oak to track orders and check out in one click.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jane Q. Public"
                    autoComplete="name"
                    className="pl-9"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  className="pl-9"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="pl-9"
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : isLogin ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              No account yet?{' '}
              <button
                onClick={() => navigate({ name: 'register' })}
                className="ml-1 font-medium text-rose-600 hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => navigate({ name: 'login' })}
                className="ml-1 font-medium text-rose-600 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </CardFooter>
      </Card>

      {!isLogin && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tip: try the demo account — <span className="font-mono">demo@shop.local</span> / <span className="font-mono">demo1234</span>
        </p>
      )}
    </div>
  )
}
