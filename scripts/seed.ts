// Seed script for the e-commerce store.
// Usage: bun run scripts/seed.ts
import { db } from '../src/lib/db'

const products = [
  // Electronics
  { name: 'Aurora Wireless Headphones', description: 'Active noise-cancelling over-ear headphones with 40-hour battery life, plush memory-foam ear cups, and Bluetooth 5.3 multipoint pairing. Tuned by award-winning audio engineers for a warm, balanced signature that makes every track feel alive.', price: 199.0, category: 'Electronics', stock: 32, sku: 'AUR-WH-001', gradient: 'from-violet-500 to-fuchsia-500', icon: 'Headphones' },
  { name: 'Pulse Mechanical Keyboard', description: 'Hot-swappable 75% mechanical keyboard with PBT keycaps, south-facing RGB, gasket-mounted plate, and a CNC aluminum frame. Pre-lubed linear switches deliver a smooth, thocky typing experience perfect for work and play.', price: 129.0, category: 'Electronics', stock: 18, sku: 'PLS-KB-002', gradient: 'from-sky-500 to-indigo-500', icon: 'Keyboard' },
  { name: 'Nimbus Laptop Stand', description: 'Aircraft-grade aluminum laptop stand with six ergonomic height positions, silicone anti-slip pads, and a foldable design that fits in any backpack. Improves airflow and reduces neck strain during long sessions.', price: 49.0, category: 'Electronics', stock: 64, sku: 'NIM-LS-003', gradient: 'from-slate-500 to-zinc-700', icon: 'Laptop' },
  { name: 'Vertex Smartwatch', description: 'AMOLED smartwatch with continuous heart-rate, SpO2, and sleep tracking, 14-day battery, onboard GPS, and 5 ATM water resistance. Includes 80+ workout modes and contactless payments.', price: 249.0, category: 'Electronics', stock: 22, sku: 'VTX-SW-004', gradient: 'from-emerald-500 to-teal-600', icon: 'Watch' },

  // Apparel
  { name: 'Heritage Cotton T-Shirt', description: 'Heavyweight 240 GSM organic cotton tee with a relaxed boxy fit and ribbed crew neck. Garment-dyed for a soft, vintage hand-feel that gets better with every wash. Ethically made in Portugal.', price: 38.0, category: 'Apparel', stock: 120, sku: 'HRG-TS-005', gradient: 'from-rose-400 to-orange-400', icon: 'Shirt' },
  { name: 'TrailRunner Sneakers', description: 'Lightweight knit sneakers with a responsive foam midsole, grippy carbon-rubber outsole, and a breathable engineered upper. Designed for both urban commutes and light trail runs.', price: 89.0, category: 'Apparel', stock: 45, sku: 'TRL-SN-006', gradient: 'from-amber-500 to-rose-500', icon: 'Footprints' },
  { name: 'Field Canvas Backpack', description: 'Waxed canvas roll-top backpack with a 22L capacity, padded 16-inch laptop sleeve, magnetic quick-access pockets, and vegetable-tanned leather accents. Built to last decades of daily use.', price: 119.0, category: 'Apparel', stock: 28, sku: 'FLD-BP-007', gradient: 'from-stone-500 to-amber-700', icon: 'Backpack' },
  { name: 'Merino Beanie', description: 'Extra-fine 19.5 micron merino wool beanie that regulates temperature, wicks moisture, and resists odor. Lightweight enough for spring evenings, warm enough for winter commutes.', price: 32.0, category: 'Apparel', stock: 80, sku: 'MER-BN-008', gradient: 'from-cyan-500 to-blue-500', icon: 'HardHat' },

  // Home & Kitchen
  { name: 'Hearth Ceramic Mug Set', description: 'Set of four hand-glazed stoneware mugs, 12 oz each, in a gradient earth-tone palette. Dishwasher and microwave safe. Each mug is unique thanks to reactive glazing.', price: 56.0, category: 'Home & Kitchen', stock: 50, sku: 'HRT-MG-009', gradient: 'from-orange-400 to-amber-600', icon: 'Coffee' },
  { name: 'Summit Pour-Over Kettle', description: 'Gooseneck stainless steel kettle with a precision-balanced handle, 1.0L capacity, and a built-in thermometer for ideal brewing temperature. Compatible with all induction cooktops.', price: 79.0, category: 'Home & Kitchen', stock: 36, sku: 'SMT-PK-010', gradient: 'from-zinc-500 to-stone-700', icon: 'Soup' },
  { name: 'Lumen Desk Lamp', description: 'Architect LED desk lamp with five color temperatures, ten brightness levels, USB-C charging port, and a foldable arm. Flicker-free lighting that is gentle on the eyes for hours of focused work.', price: 65.0, category: 'Home & Kitchen', stock: 42, sku: 'LMN-DL-011', gradient: 'from-yellow-400 to-amber-500', icon: 'Lamp' },
  { name: 'Cedar Candle, Hearth & Pine', description: 'Hand-poured soy wax candle with notes of cedar, balsam, and a whisper of smoked vanilla. 60-hour burn time in a reusable amber glass vessel. Cotton wick for a clean, soot-free burn.', price: 28.0, category: 'Home & Kitchen', stock: 95, sku: 'CDR-CD-012', gradient: 'from-amber-600 to-orange-700', icon: 'Flame' },

  // Books
  { name: 'The Pragmatic Programmer, 20th Anniversary', description: 'A timeless classic fully revised for modern development. Covers pragmatic thinking, orthogonal design, debugging strategies, and the tools that separate journeyman from master. A must-read for every serious software craftsperson.', price: 44.0, category: 'Books', stock: 70, sku: 'PRG-BK-013', gradient: 'from-purple-500 to-pink-500', icon: 'BookOpen' },
  { name: 'Designing Data-Intensive Applications', description: 'The definitive guide to the architecture behind modern data systems. Covers replication, partitioning, transactions, consensus, batch and stream processing, and the trade-offs that shape every distributed system.', price: 52.0, category: 'Books', stock: 38, sku: 'DDI-BK-014', gradient: 'from-emerald-500 to-cyan-500', icon: 'BookOpen' },
]

async function main() {
  console.log('Seeding database...')

  // Seed products
  const existing = await db.product.count()
  if (existing > 0) {
    console.log(`Products already exist (${existing}). Skipping product seed.`)
  } else {
    await db.product.createMany({ data: products })
    console.log(`Inserted ${products.length} products.`)
  }

  // Seed demo user
  const demoEmail = 'demo@shop.local'
  const existingUser = await db.user.findUnique({ where: { email: demoEmail } })
  if (existingUser) {
    console.log('Demo user already exists.')
  } else {
    // Lazy import to avoid circular issues with bundling
    const { hashPassword } = await import('../src/lib/password')
    const passwordHash = await hashPassword('demo1234')
    await db.user.create({
      data: {
        email: demoEmail,
        name: 'Demo Shopper',
        passwordHash,
      },
    })
    console.log('Created demo user: demo@shop.local / demo1234')
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
