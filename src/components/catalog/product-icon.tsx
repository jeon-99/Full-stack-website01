'use client'

import {
  Headphones,
  Keyboard,
  Laptop,
  Watch,
  Shirt,
  Footprints,
  Backpack,
  HardHat,
  Coffee,
  Soup,
  Lamp,
  Flame,
  BookOpen,
  Package,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Headphones,
  Keyboard,
  Laptop,
  Watch,
  Shirt,
  Footprints,
  Backpack,
  HardHat,
  Coffee,
  Soup,
  Lamp,
  Flame,
  BookOpen,
  Package,
}

export function ProductIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = ICONS[name] ?? Package
  return <Icon className={className} />
}
