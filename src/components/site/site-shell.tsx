'use client'

import { useEffect } from 'react'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { useRouter, navigate } from '@/stores/router'
import { ProductGrid } from '@/components/catalog/product-grid'
import { ProductDetail } from '@/components/catalog/product-detail'
import { CartPage } from '@/components/cart/cart-page'
import { CheckoutView } from '@/components/checkout/checkout-view'
import { AuthForms } from '@/components/auth/auth-forms'
import { UserDashboard } from '@/components/account/user-dashboard'
import type { Product } from '@/components/catalog/product-card'

export function SiteShell({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[]
  initialCategories: string[]
}) {
  const route = useRouter((s) => s.route)
  const hydrateFromHash = useRouter((s) => s.hydrateFromHash)

  // Make sure router state matches the URL hash on mount and on back/forward.
  useEffect(() => {
    hydrateFromHash()
    const onHash = () => hydrateFromHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [hydrateFromHash])

  // Scroll to top on route change (except product detail which manages its own scroll)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [route.name, route.param])

  function renderRoute() {
    switch (route.name) {
      case 'home':
        return (
          <ProductGrid
            initialProducts={initialProducts}
            initialCategories={initialCategories}
          />
        )
      case 'product':
        if (!route.param) {
          navigate({ name: 'home' })
          return null
        }
        return <ProductDetail key={route.param} id={route.param} />
      case 'cart':
        return <CartPage />
      case 'checkout':
        return <CheckoutView />
      case 'login':
        return <AuthForms mode="login" />
      case 'register':
        return <AuthForms mode="register" />
      case 'account':
        return <UserDashboard />
      default:
        return (
          <ProductGrid
            initialProducts={initialProducts}
            initialCategories={initialCategories}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {renderRoute()}
      </main>
      <SiteFooter />
    </div>
  )
}
