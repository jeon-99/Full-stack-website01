'use client'

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { navigate } from '@/stores/router'
import { ProductImage } from '@/components/catalog/product-image'
import { formatPrice } from '@/components/catalog/product-card'

export function CartView({ inSheet = false }: { inSheet?: boolean }) {
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.subtotal())
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const clear = useCart((s) => s.clear)
  const close = useCart((s) => s.close)
  const user = useAuth((s) => s.user)
  const loading = useAuth((s) => s.loading)

  const isEmpty = items.length === 0
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 6.5
  const tax = +(subtotal * 0.08).toFixed(2)
  const total = +(subtotal + shipping + tax).toFixed(2)

  function goCheckout() {
    close()
    navigate({ name: 'checkout' })
  }

  function goShop() {
    close()
    navigate({ name: 'home' })
  }

  const Empty = (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold">Your cart is empty</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Browse the catalog and add a few things — they will appear here.
      </p>
      <Button onClick={goShop} className="mt-2">
        Browse catalog
      </Button>
    </div>
  )

  if (isEmpty) {
    return (
      <div className={`flex flex-col ${inSheet ? 'h-full' : 'min-h-[60vh]'}`}>
        {inSheet && (
          <SheetHeader className="px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Your cart
              </SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close cart">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <SheetDescription className="sr-only">
              Your shopping cart is empty.
            </SheetDescription>
          </SheetHeader>
        )}
        {Empty}
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${inSheet ? 'h-full' : 'min-h-[60vh]'}`}>
      {inSheet && (
        <SheetHeader className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Your cart
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                ({items.reduce((n, i) => n + i.quantity, 0)})
              </span>
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close cart">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription className="sr-only">
            Review your items and checkout when ready.
          </SheetDescription>
        </SheetHeader>
      )}

      <ScrollArea className={inSheet ? 'flex-1' : 'max-h-[60vh] min-h-0'}>
        <ul className="divide-y divide-border/60">
          {items.map((line) => (
            <li key={line.productId} className="flex gap-3 p-4">
              <button
                onClick={() => {
                  close()
                  navigate({ name: 'product', param: line.productId })
                }}
                className="shrink-0"
                aria-label={`View ${line.name}`}
              >
                <ProductImage
                  gradient={line.gradient}
                  icon={line.icon}
                  name={line.name}
                  className="h-20 w-20 rounded-lg"
                  iconClassName="h-8 w-8"
                />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="line-clamp-2 text-sm font-medium leading-tight"
                    title={line.name}
                  >
                    {line.name}
                  </p>
                  <button
                    onClick={() => remove(line.productId)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition"
                    aria-label={`Remove ${line.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatPrice(line.price)} each
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center rounded-md border border-border">
                    <button
                      onClick={() => setQty(line.productId, line.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                      aria-label={`Decrease ${line.name} quantity`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => setQty(line.productId, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
                      disabled={line.quantity >= line.maxQty}
                      aria-label={`Increase ${line.name} quantity`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <div className="border-t border-border/60 p-4 space-y-3">
        <div className="space-y-1 text-sm">
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
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        {subtotal < 75 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Add {formatPrice(75 - subtotal)} more to unlock free shipping.
          </p>
        )}

        <Button size="lg" className="w-full gap-2" onClick={goCheckout}>
          {loading ? 'Loading…' : user ? 'Proceed to checkout' : 'Sign in to checkout'}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => {
            if (confirm('Clear all items from your cart?')) clear()
          }}
        >
          Clear cart
        </Button>
      </div>
    </div>
  )
}

