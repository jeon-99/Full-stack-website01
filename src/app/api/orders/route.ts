import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Item = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

const Body = z.object({
  items: z.array(Item).min(1, 'Cart is empty'),
  shipping: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    address: z.string().min(5),
    city: z.string().min(2),
    zip: z.string().min(2),
    country: z.string().min(2),
  }),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
  return NextResponse.json({ orders })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to place an order' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json({ error: first?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { items, shipping } = parsed.data

  // Validate products and stock
  const productIds = items.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products no longer exist' }, { status: 400 })
  }

  let total = 0
  const orderItemsData = items.map((i) => {
    const p = products.find((pp) => pp.id === i.productId)!
    if (i.quantity > p.stock) {
      throw new Error(`Not enough stock for "${p.name}" (have ${p.stock})`)
    }
    total += p.price * i.quantity
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      quantity: i.quantity,
    }
  })

  try {
    const order = await db.$transaction(async (tx) => {
      // decrement stock
      await Promise.all(
        items.map((i) =>
          tx.product.update({
            where: { id: i.productId },
            data: { stock: { decrement: i.quantity } },
          })
        )
      )
      return tx.order.create({
        data: {
          userId: user.id,
          total,
          status: 'PAID',
          shippingName: shipping.name,
          shippingEmail: shipping.email,
          shippingAddr: shipping.address,
          shippingCity: shipping.city,
          shippingZip: shipping.zip,
          shippingCountry: shipping.country,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })
    })

    return NextResponse.json({ order })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Order failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
