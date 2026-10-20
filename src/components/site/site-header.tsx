'use client'

import { useState } from 'react'
import { ShoppingCart, User as UserIcon, LogOut, Store, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/stores/cart'
import { useAuth } from '@/stores/auth'
import { navigate } from '@/stores/router'
import { CartView } from '@/components/cart/cart-view'
import { toast } from '@/hooks/use-toast'

export function SiteHeader() {
  const count = useCart((s) => s.count())
  const cartOpen = useCart((s) => s.isOpen)
  const openCart = useCart((s) => s.open)
  const closeCart = useCart((s) => s.close)
  const user = useAuth((s) => s.user)
  const logoutStore = useAuth((s) => s.logout)
  const clearCart = useCart((s) => s.clear)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore network errors
    }
    logoutStore()
    clearCart()
    toast({ title: 'Signed out', description: 'See you next time!' })
    navigate({ name: 'home' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate({ name: 'home' })}
          className="group flex items-center gap-2"
          aria-label="Shop home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white shadow-sm">
            <Store className="h-5 w-5" />
          </span>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            Ember &amp; Oak
          </span>
        </button>

        <nav className="ml-2 hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <button
            onClick={() => navigate({ name: 'home' })}
            className="rounded-md px-3 py-1.5 hover:bg-muted hover:text-foreground transition"
          >
            Shop
          </button>
          <button
            onClick={() => navigate({ name: 'cart' })}
            className="rounded-md px-3 py-1.5 hover:bg-muted hover:text-foreground transition"
          >
            Cart
          </button>
          {user && (
            <button
              onClick={() => navigate({ name: 'account' })}
              className="rounded-md px-3 py-1.5 hover:bg-muted hover:text-foreground transition"
            >
              My Orders
            </button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-rose-500" />
                  Ember &amp; Oak
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1 px-2 text-sm">
                <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); navigate({ name: 'home' }) }}>
                  Shop
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); navigate({ name: 'cart' }) }}>
                  Cart
                </Button>
                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); navigate({ name: 'account' }) }}>
                      My Orders
                    </Button>
                    <Button variant="ghost" className="justify-start text-rose-600" onClick={() => { setMobileOpen(false); handleLogout() }}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); navigate({ name: 'login' }) }}>
                      Sign in
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={() => { setMobileOpen(false); navigate({ name: 'register' }) }}>
                      Create account
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={cartOpen} onOpenChange={(o) => (o ? openCart() : closeCart())}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
                  >
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
              <CartView inSheet />
            </SheetContent>
          </Sheet>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ name: 'account' })}
                className="gap-2"
              >
                <UserIcon className="h-4 w-4" />
                <span className="max-w-[10ch] truncate">{user.name.split(' ')[0]}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate({ name: 'login' })}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate({ name: 'register' })}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
