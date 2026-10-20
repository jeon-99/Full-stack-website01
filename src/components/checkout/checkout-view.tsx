'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { navigate } from '@/stores/router'
import { ProductImage } from '@/components/catalog/product-image'
import { formatPrice } from '@/components/catalog/product-card'
import { useToast } from '@/hooks/use-toast'

const Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  card: z.string().min(12, 'Enter a valid card number'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Use MM/YY format'),
  cvc: z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
})

type Field = z.infer<typeof Schema>
type Errors = Partial<Record<keyof Field, string>>

export function CheckoutView() {
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.subtotal())
  const clear = useCart((s) => s.clear)
  const user = useAuth((s) => s.user)
  const loading = useAuth((s) => s.loading)
  const { toast } = useToast()

  const [form, setForm] = useState<Field>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    card: '',
    expiry: '',
    cvc: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<{
    id: string
    total: number
    createdAt: string
    email: string
    items: { name: string; quantity: number; price: number }[]
  } | null>(null)

  // Prefill name/email once user loads
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
      }))
    }
  }, [user])

  // If not signed in and auth is done loading, bounce to login
  useEffect(() => {
    if (!loading && !user) {
      navigate({ name: 'login' })
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    // Will redirect via effect
    return null
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Thank you, {user.name.split(' ')[0]}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your order has been placed. A confirmation has been sent to{' '}
          <span className="font-medium text-foreground">{order.email}</span> · order ID
          <span className="ml-1 font-mono text-foreground">{order.id}</span>.
        </p>

        <Card className="mx-auto mt-8 max-w-md text-left">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              Placed on{' '}
              {new Date(order.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {it.quantity} × {it.name}
                </span>
                <span className="tabular-nums">
                  {formatPrice(it.price * it.quantity)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total paid</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate({ name: 'account' })}>
            View my orders
          </Button>
          <Button variant="outline" onClick={() => navigate({ name: 'home' })}>
            Continue shopping
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add a few items to your cart before checking out.
        </p>
        <Button className="mt-6" onClick={() => navigate({ name: 'home' })}>
          Browse catalog
        </Button>
      </div>
    )
  }

  const shipping = subtotal >= 75 ? 0 : 6.5
  const tax = +(subtotal * 0.08).toFixed(2)
  const total = +(subtotal + shipping + tax).toFixed(2)

  function update<K extends keyof Field>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Schema.safeParse(form)
    if (!parsed.success) {
      const errs: Errors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Field
        if (!errs[key]) errs[key] = issue.message
      }
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shipping: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
            zip: form.zip,
            country: form.country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: 'Order failed',
          description: data?.error ?? 'Please try again.',
          variant: 'destructive',
        })
        return
      }
      clear()
      setOrder({
        id: data.order.id,
        total: data.order.total,
        createdAt: data.order.createdAt,
        email: data.order.shippingEmail,
        items: data.order.items,
      })
      toast({
        title: 'Order placed!',
        description: 'Thank you for your purchase.',
      })
      // Scroll to top to show confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Helper for plain text field rendering
  function renderField<K extends keyof Field>(key: K, label: string, type = 'text', placeholder = '', autoComplete = '') {
    const err = errors[key]
    return (
      <div className="space-y-1.5">
        <Label htmlFor={key}>{label}</Label>
        <Input
          id={key}
          type={type}
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!err}
          className={err ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {err && <p className="text-xs text-destructive">{err}</p>}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate({ name: 'cart' })}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </button>

      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Securely complete your purchase. We never store your card details.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
              <CardDescription>
                Where should we send your order?
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {renderField('name', 'Full name', 'text', 'Jane Q. Public', 'name')}
              {renderField('email', 'Email', 'email', 'jane@example.com', 'email')}
              <div className="sm:col-span-2">
                {renderField('address', 'Street address', 'text', '123 Main St', 'street-address')}
              </div>
              {renderField('city', 'City', 'text', 'Springfield', 'address-level2')}
              {renderField('zip', 'Postal code', 'text', '12345', 'postal-code')}
              <div className="sm:col-span-2">
                {renderField('country', 'Country', 'text', 'United States', 'country-name')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> This is a demo store — no real
                payment will be processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="card">Card number</Label>
                <Input
                  id="card"
                  inputMode="numeric"
                  value={form.card}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 19)
                    const grouped = digits.replace(/(.{4})/g, '$1 ').trim()
                    update('card', grouped)
                  }}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                  aria-invalid={!!errors.card}
                  className={errors.card ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.card && (
                  <p className="text-xs text-destructive">{errors.card}</p>
                )}
              </div>
              {renderField('expiry', 'Expiry (MM/YY)', 'text', '12/28', 'cc-exp')}
              {renderField('cvc', 'CVC', 'text', '123', 'cc-csc')}
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {items.map((line) => (
                  <li key={line.productId} className="flex gap-3">
                    <div className="relative">
                      <ProductImage
                        gradient={line.gradient}
                        icon={line.icon}
                        name={line.name}
                        className="h-14 w-14 rounded-md"
                        iconClassName="h-5 w-5"
                      />
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {line.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPrice(line.price)} each
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span className="tabular-nums">{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay {formatPrice(total)}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By placing your order you agree to our terms &amp; conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

export { CheckoutView as default }
