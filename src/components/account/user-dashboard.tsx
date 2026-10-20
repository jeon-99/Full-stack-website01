'use client'

import { useEffect, useState } from 'react'
import { Package, Loader2, ArrowLeft, Truck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/stores/auth'
import { navigate } from '@/stores/router'
import { formatPrice } from '@/components/catalog/product-card'

type Order = {
  id: string
  total: number
  status: string
  shippingName: string
  shippingCity: string
  shippingCountry: string
  createdAt: string
  items: { name: string; quantity: number; price: number }[]
}

export function UserDashboard() {
  const user = useAuth((s) => s.user)
  const loading = useAuth((s) => s.loading)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!user) return
    fetch('/api/orders', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data?.orders)) setOrders(data.orders)
        else setOrders([])
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load your orders')
          setOrders([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to view your orders and account details.
        </p>
        <Button className="mt-6" onClick={() => navigate({ name: 'login' })}>
          Sign in
        </Button>
      </div>
    )
  }

  const totalItems = orders?.reduce(
    (n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0),
    0
  ) ?? 0
  const totalSpent = orders?.reduce((s, o) => s + o.total, 0) ?? 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </button>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-xl font-bold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {orders?.length ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Items purchased</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{totalItems}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lifetime spend</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatPrice(totalSpent)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Order history</h2>
        {orders === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-muted"
                aria-hidden
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No orders yet</p>
                <p className="text-sm text-muted-foreground">
                  When you place your first order, it will appear here.
                </p>
              </div>
              <Button onClick={() => navigate({ name: 'home' })}>
                Start shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold tabular-nums">
                          Order #{o.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="gap-1">
                        <Truck className="h-3 w-3" /> {o.status}
                      </Badge>
                    </div>

                    <ul className="mt-3 divide-y divide-border/60 text-sm">
                      {o.items.map((it, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {it.quantity} ×
                            </span>{' '}
                            {it.name}
                          </span>
                          <span className="tabular-nums">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Separator className="my-3" />

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="text-muted-foreground">
                        Shipping to {o.shippingName}, {o.shippingCity},{' '}
                        {o.shippingCountry}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="tabular-nums">
                          {formatPrice(o.total)}
                        </span>{' '}
                        paid
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
