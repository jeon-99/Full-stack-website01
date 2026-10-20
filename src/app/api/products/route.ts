import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category') || ''
  const search = url.searchParams.get('q') || ''

  const products = await db.product.findMany({
    where: {
      AND: [
        category ? { category } : {},
        search
          ? { OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ] }
          : {},
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ products })
}
