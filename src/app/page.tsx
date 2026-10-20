import { db } from '@/lib/db'
import { SiteShell } from '@/components/site/site-shell'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch initial products and categories server-side for fast first paint
  const [products, categoryRows] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
    }),
    db.product.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    }),
  ])

  const categories = categoryRows.map((r) => r.category)

  // Serialize for the client (Date -> string)
  const initialProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    stock: p.stock,
    sku: p.sku,
    gradient: p.gradient,
    icon: p.icon,
    createdAt: p.createdAt.toISOString(),
  }))

  return <SiteShell initialProducts={initialProducts} initialCategories={categories} />
}
