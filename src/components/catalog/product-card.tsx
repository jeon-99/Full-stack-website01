'use client'

import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductImage } from './product-image'
import { useCart } from '@/stores/cart'
import { navigate } from '@/stores/router'
import { toast } from '@/hooks/use-toast'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  gradient: string
  icon: string
  createdAt: string
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n)
}

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const [justAdded, setJustAdded] = useState(false)

  function addToCart(e: React.MouseEvent) {
    e.stopPropagation()
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
      1
    )
    setJustAdded(true)
    toast({ title: 'Added to cart', description: product.name })
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate({ name: 'product', param: product.id })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate({ name: 'product', param: product.id })
        }
      }}
      className="group relative cursor-pointer overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View ${product.name}`}
    >
      <div className="aspect-[4/5] w-full">
        <ProductImage
          gradient={product.gradient}
          icon={product.icon}
          name={product.name}
          className="h-full w-full"
          iconClassName="h-16 w-16 sm:h-20 sm:w-20"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
          </div>
          <span className="shrink-0 text-base font-bold tabular-nums">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          {product.stock > 0 ? (
            <Badge variant="secondary" className="text-[10px]">
              {product.stock} in stock
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              Sold out
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            onClick={addToCart}
            disabled={product.stock <= 0}
            className="gap-1"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export { formatPrice }
