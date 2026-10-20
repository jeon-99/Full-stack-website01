'use client'

import { cn } from '@/lib/utils'
import { ProductIcon } from './product-icon'

export function ProductImage({
  gradient,
  icon,
  name,
  className,
  iconClassName,
}: {
  gradient: string // e.g. "from-violet-500 to-fuchsia-500"
  icon: string
  name: string
  className?: string
  iconClassName?: string
}) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-br',
        gradient,
        className
      )}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      {/* Soft glow */}
      <div
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/25 blur-3xl"
        aria-hidden
      />
      <ProductIcon
        name={icon}
        className={cn(
          'relative z-10 text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.18)]',
          iconClassName
        )}
      />
    </div>
  )
}
