import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getMasterKey(): Buffer {
  const key = process.env.TELEGRAM_ENCRYPTION_KEY
  if (!key) {
    throw new Error('TELEGRAM_ENCRYPTION_KEY environment variable is not set')
  }
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== 32) {
    throw new Error('TELEGRAM_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
  }
  return buf
}

export function encryptToken(plaintext: string): string {
  const key = getMasterKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  // Format: iv(12) + tag(16) + ciphertext → hex string
  return Buffer.concat([iv, tag, encrypted]).toString('hex')
}

export function decryptToken(ciphertext: string): string {
  const key = getMasterKey()
  const buf = Buffer.from(ciphertext, 'hex')

  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return decipher.update(encrypted) + decipher.final('utf8')
}

export function isEncrypted(value: string): boolean {
  // Encrypted değerler hex string ve minimum uzunlukta olmalı (iv+tag = 56 hex char)
  return /^[0-9a-f]+$/i.test(value) && value.length > 56
}
