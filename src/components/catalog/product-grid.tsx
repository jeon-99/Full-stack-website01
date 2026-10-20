'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard, type Product } from './product-card'
import { useToast } from '@/hooks/use-toast'

type HomeViewProps = {
  initialProducts: Product[]
  initialCategories: string[]
}

export function ProductGrid({
  initialProducts,
  initialCategories,
}: HomeViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [category, setCategory] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Refetch when filters change
  useEffect(() => {
    let cancelled = false
    const url = new URL('/api/products', window.location.origin)
    if (category) url.searchParams.set('category', category)
    if (query) url.searchParams.set('q', query)
    const t = setTimeout(() => {
      setLoading(true)
      fetch(url.toString(), { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return
          if (Array.isArray(data?.products)) setProducts(data.products)
        })
        .catch(() => {
          if (!cancelled) {
            toast({
              title: 'Could not load products',
              description: 'Please check your connection and try again.',
              variant: 'destructive',
            })
          }
        })
        .finally(() => !cancelled && setLoading(false))
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [category, query, toast])

  // Load categories once
  useEffect(() => {
    if (initialCategories.length > 0) return
    fetch('/api/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.categories)) setCategories(data.categories)
      })
      .catch(() => {})
  }, [initialCategories.length])

  const visible = useMemo(() => products, [products])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 px-6 py-12 sm:px-12 sm:py-16 dark:from-rose-950/40 dark:via-orange-950/30 dark:to-amber-950/40">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl" aria-hidden />
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl" aria-hidden />
        <div className="relative max-w-2xl">
          <Badge className="mb-3 gap-1.5 bg-rose-500 hover:bg-rose-500">
            <Sparkles className="h-3 w-3" /> New season
          </Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Thoughtfully made goods,{' '}
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
              shipped from our porch to yours
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            A small catalog of electronics, apparel, kitchen goods, and books.
            Free shipping on orders over $75. No fluff, just things we actually
            use ourselves.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse the catalog
            </Button>
            <span className="text-sm text-muted-foreground">
              14 products · 4 categories · Built for the CodeAlpha internship
            </span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="catalog" className="mt-8 scroll-mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All products</h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Updating results…'
                : `${visible.length} item${visible.length === 1 ? '' : 's'} available`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </div>
          <Button
            size="sm"
            variant={category === '' ? 'default' : 'outline'}
            onClick={() => setCategory('')}
            className="h-7"
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
              className="h-7"
            >
              {c}
            </Button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mt-6 pb-16">
        {loading && visible.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
            <p className="text-lg font-semibold">No products match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the search or picking a different category.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setCategory('')
                setQuery('')
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
