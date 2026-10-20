import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const rows = await db.product.findMany({
    where: {},
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  return NextResponse.json({ categories: rows.map((r) => r.category) })
}
