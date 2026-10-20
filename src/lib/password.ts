// Password hashing using Node's built-in crypto.scrypt (no extra deps).
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>

const KEYLEN = 64

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters')
  }
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, KEYLEN)
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  if (!stored || !stored.includes(':')) return false
  const [salt, hashHex] = stored.split(':')
  const derived = await scrypt(password, salt, KEYLEN)
  const storedBuf = Buffer.from(hashHex, 'hex')
  // timing-safe comparison; same length expected
  if (derived.length !== storedBuf.length) return false
  return timingSafeEqual(derived, storedBuf)
}
