import { app, safeStorage } from 'electron'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

type RecoveryEnvelope = {
  version: 1
  salt: string
  iv: string
  tag: string
  ciphertext: string
}

export type NewKeyMaterial = { databaseKey: Buffer; recoveryKey: string }

const dataDirectory = () => join(app.getPath('userData'), 'data')
const dpapiPath = () => join(dataDirectory(), 'database-key.dpapi')
const recoveryPath = () => join(dataDirectory(), 'database-key.recovery.json')

const ensureParent = (path: string) => mkdirSync(dirname(path), { recursive: true })

function recoveryCipherKey(recoveryKey: string, salt: Buffer): Buffer {
  return scryptSync(recoveryKey, salt, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
}

function createRecoveryEnvelope(databaseKey: Buffer, recoveryKey: string): RecoveryEnvelope {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', recoveryCipherKey(recoveryKey, salt), iv)
  const ciphertext = Buffer.concat([cipher.update(databaseKey), cipher.final()])
  return {
    version: 1,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  }
}

export function createAndPersistDatabaseKey(): NewKeyMaterial {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Windows secure storage is unavailable. TeaPro ERP cannot create a protected database key.')
  }

  const databaseKey = randomBytes(32)
  const recoveryKey = randomBytes(24).toString('base64url').match(/.{1,6}/g)?.join('-') ?? ''
  ensureParent(dpapiPath())
  writeFileSync(dpapiPath(), safeStorage.encryptString(databaseKey.toString('hex')), { mode: 0o600 })
  writeFileSync(recoveryPath(), JSON.stringify(createRecoveryEnvelope(databaseKey, recoveryKey)), { mode: 0o600 })
  return { databaseKey, recoveryKey }
}

export function loadDatabaseKey(): Buffer | null {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null
    const protectedValue = readFileSync(dpapiPath())
    const hex = safeStorage.decryptString(protectedValue)
    if (!/^[a-f0-9]{64}$/i.test(hex)) throw new Error('Invalid database key')
    return Buffer.from(hex, 'hex')
  } catch {
    return null
  }
}

export function recoverAndProtectDatabaseKey(recoveryKey: string): Buffer {
  const envelope = JSON.parse(readFileSync(recoveryPath(), 'utf8')) as RecoveryEnvelope
  if (envelope.version !== 1) throw new Error('Unsupported recovery envelope')
  const salt = Buffer.from(envelope.salt, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', recoveryCipherKey(recoveryKey, salt), Buffer.from(envelope.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'))
  const databaseKey = Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()])
  if (databaseKey.length !== 32) throw new Error('Recovery key is invalid')
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Windows secure storage is unavailable')
  writeFileSync(dpapiPath(), safeStorage.encryptString(databaseKey.toString('hex')), { mode: 0o600 })
  return databaseKey
}

