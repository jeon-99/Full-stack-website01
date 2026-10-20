'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartLineInput = {
  productId: string
  name: string
  price: number
  gradient: string
  icon: string
  maxQty: number
}

export type CartLine = CartLineInput & { quantity: number }

type CartState = {
  items: CartLine[]
  isOpen: boolean
  add: (line: CartLineInput, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
  open: () => void
  close: () => void
  toggle: () => void
  count: () => number
  subtotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === line.productId)
          if (existing) {
            const nextQty = Math.min(existing.quantity + qty, line.maxQty)
            return {
              items: state.items.map((i) =>
                i.productId === line.productId
                  ? { ...i, ...line, quantity: nextQty }
                  : i
              ),
              isOpen: true,
            }
          }
          const nextQty = Math.min(qty, line.maxQty)
          return {
            items: [...state.items, { ...line, quantity: nextQty }],
            isOpen: true,
          }
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(0, Math.min(qty, i.maxQty)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: 'shop-cart',
      // Only persist items, not isOpen drawer state
      partialize: (s) => ({ items: s.items }),
    }
  )
)
