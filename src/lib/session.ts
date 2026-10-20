// Session management using a signed httpOnly cookie.
// Format: base64url(JSON {id,email,name,iat}).<hex hmac>
// No external JWT library required.
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { db } from './db'

const SESSION_COOKIE = 'shop_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days (seconds)

function getSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    'dev-only-insecure-session-secret-please-override-in-production'
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn(
      'WARNING: SESSION_SECRET is not set. Using insecure default in production.'
    )
  }
  return secret
}

export type SessionPayload = {
  id: string
  email: string
  name: string
  iat: number
}

function b64urlEncode(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64url')
}

function b64urlDecode(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf-8')
}

function sign(payload: SessionPayload): string {
  const body = b64urlEncode(JSON.stringify(payload))
  const sig = createHmac('sha256', getSecret()).update(body).digest('hex')
  return `${body}.${sig}`
}

function verify(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  const expectedSig = createHmac('sha256', getSecret())
    .update(body)
    .digest('hex')
  // timing-safe comparison
  try {
    const a = Buffer.from(sig, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  try {
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload
    if (typeof payload.id !== 'string') return null
    // expire after SESSION_MAX_AGE
    const ageSec = (Date.now() - payload.iat * 1000) / 1000
    if (ageSec > SESSION_MAX_AGE) return null
    return payload
  } catch {
    return null
  }
}

export async function createSession(payload: Omit<SessionPayload, 'iat'>) {
  const token = sign({ ...payload, iat: Math.floor(Date.now() / 1000) })
  const c = await cookies()
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function destroySession() {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  const c = await cookies()
  const token = c.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = verify(token)
  return payload
}

export async function getCurrentUser() {
  const payload = await getSessionUser()
  if (!payload) return null
  const user = await db.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return user
}
