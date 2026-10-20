'use client'

import { Store, Github, Twitter, Mail } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white">
                <Store className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold">Ember &amp; Oak</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              A small-batch general store for thoughtfully designed objects —
              electronics, apparel, kitchen goods, and books. Built as a
              full-stack demo for the CodeAlpha internship.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Electronics</li>
              <li>Apparel</li>
              <li>Home &amp; Kitchen</li>
              <li>Books</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> hello@emberoak.shop
              </li>
              <li className="flex items-center gap-2">
                <Twitter className="h-4 w-4" /> @emberoak
              </li>
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4" /> github.com/emberoak
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ember &amp; Oak. Crafted with Next.js,
          Tailwind CSS, Prisma &amp; Zustand.
        </div>
      </div>
    </footer>
  )
}
