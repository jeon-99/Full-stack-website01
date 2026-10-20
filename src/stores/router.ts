'use client'

import { create } from 'zustand'

export type RouteName =
  | 'home'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'register'
  | 'account'

export type Route = {
  name: RouteName
  param?: string // e.g., product id, or a return-to view
}

function parseHash(hash: string): Route {
  // strip leading '#'
  const h = hash.replace(/^#\/?/, '').trim()
  if (!h) return { name: 'home' }
  const [seg, param] = h.split('/')
  switch (seg) {
    case 'product':
      return { name: 'product', param }
    case 'cart':
      return { name: 'cart' }
    case 'checkout':
      return { name: 'checkout' }
    case 'login':
      return { name: 'login' }
    case 'register':
      return { name: 'register' }
    case 'account':
      return { name: 'account' }
    default:
      return { name: 'home' }
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'product':
      return `#/product/${route.param ?? ''}`
    case 'cart':
      return '#/cart'
    case 'checkout':
      return '#/checkout'
    case 'login':
      return '#/login'
    case 'register':
      return '#/register'
    case 'account':
      return '#/account'
  }
}

type RouterState = {
  route: Route
  setRoute: (route: Route) => void
  hydrateFromHash: () => void
}

export const useRouter = create<RouterState>((set) => ({
  route: typeof window !== 'undefined' ? parseHash(window.location.hash) : { name: 'home' },
  setRoute: (route) => {
    if (typeof window !== 'undefined') {
      const next = routeToHash(route)
      if (`#${window.location.hash.slice(1)}` !== next && window.location.hash !== next) {
        window.location.hash = next
      }
    }
    set({ route })
  },
  hydrateFromHash: () => {
    if (typeof window === 'undefined') return
    set({ route: parseHash(window.location.hash) })
  },
}))

export function navigate(route: Route) {
  useRouter.getState().setRoute(route)
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    useRouter.getState().hydrateFromHash()
  })
}
