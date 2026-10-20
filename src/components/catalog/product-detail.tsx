'use client'

import { useEffect, useState } from 'react'
import { Minus, Plus, ShoppingCart, ArrowLeft, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductImage } from './product-image'
import { useCart } from '@/stores/cart'
import { navigate } from '@/stores/router'
import { toast } from '@/hooks/use-toast'
import { formatPrice, type Product } from './product-card'

export function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const add = useCart((s) => s.add)
  const openCart = useCart((s) => s.open)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/products/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data?.product) setProduct(data.product)
        else setNotFound(true)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">
          The product you were looking for may have been removed.
        </p>
        <Button className="mt-6" onClick={() => navigate({ name: 'home' })}>
          Back to shop
        </Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  const maxQty = Math.max(1, product.stock)
  const subtotal = product.price * qty

  function addToCart() {
    if (!product) return
    if (product.stock <= 0) return
    add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        gradient: product.gradient,
        icon: product.icon,
        maxQty: product.stock,
      },
      qty
    )
    setJustAdded(true)
    toast({
      title: `Added ${qty} × ${product.name}`,
      description: `Subtotal ${formatPrice(product.price * qty)}`,
    })
    setTimeout(() => setJustAdded(false), 1400)
  }

  function buyNow() {
    if (!product) return
    if (product.stock <= 0) return
    add(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        gradient: product.gradient,
        icon: product.icon,
        maxQty: product.stock,
      },
      qty
    )
    navigate({ name: 'checkout' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/60 shadow-sm">
            <ProductImage
              gradient={product.gradient}
              icon={product.icon}
              name={product.name}
              className="aspect-square w-full"
              iconClassName="h-32 w-32 sm:h-44 sm:w-44"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3">
              <Truck className="h-4 w-4 text-rose-500" />
              <span>Free shipping over $75</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3">
              <RotateCcw className="h-4 w-4 text-rose-500" />
              <span>30-day easy returns</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              <span>2-year warranty</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <Badge variant="secondary" className="mb-3 self-start">
            {product.category}
          </Badge>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            SKU: <span className="font-mono">{product.sku}</span>
          </p>
          <div className="mt-4 text-3xl font-bold tabular-nums">
            {formatPrice(product.price)}
          </div>

          <p className="mt-5 text-base leading-relaxed text-foreground/90">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            {product.stock > 0 ? (
              <Badge variant="secondary" className="gap-1.5">
                <Check className="h-3 w-3 text-emerald-600" /> {product.stock} in
                stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Currently sold out
              </Badge>
            )}
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex items-center rounded-lg border border-border">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-10 w-10 rounded-r-none"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                min={1}
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  if (Number.isFinite(n)) setQty(Math.max(1, Math.min(maxQty, n)))
                }}
                className="h-10 w-12 border-0 bg-transparent text-center text-sm font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Quantity"
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-10 w-10 rounded-l-none"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Button
                size="lg"
                variant="outline"
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="flex-1 gap-2"
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add to cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                onClick={buyNow}
                disabled={product.stock <= 0}
                className="flex-1"
              >
                Buy now · {formatPrice(subtotal)}
              </Button>
            </div>
          </div>

          <button
            onClick={openCart}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition self-start"
          >
            or view cart →
          </button>

          <div className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm">
            <p className="font-medium">About this product</p>
            <p className="mt-1 text-muted-foreground">
              Every Ember &amp; Oak product is hand-checked before shipping.
              We stand behind everything we sell with a 2-year warranty and a
              no-questions-asked 30-day return policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
