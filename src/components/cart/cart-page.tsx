'use client'

import { ShoppingCart } from 'lucide-react'
import { CartView } from './cart-view'

export function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white">
          <ShoppingCart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping cart</h1>
          <p className="text-sm text-muted-foreground">
            Review your items and proceed to checkout.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <CartView inSheet={false} />
      </div>
    </div>
  )
}
