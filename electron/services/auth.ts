import argon2, { type HashOptions } from 'argon2'
import { randomBytes, randomUUID } from 'node:crypto'
import type Database from 'better-sqlite3-multiple-ciphers'
import { appendAudit } from './audit.js'

export type Role = 'super_admin' | 'admin' | 'manager' | 'supervisor' | 'cashier' | 'accountant'
export type Session = { token: string; userId: string; username: string; displayName: string; role: Role; permissions: string[]; expiresAt: number; webContentsId: number }
type UserRow = { id: string; username: string; display_name: string; password_hash: string; role: Role; permissions_json: string; active: number; failed_attempts: number; locked_until: string | null }

const sessions = new Map<string, Session>()
const SESSION_MS = 30 * 60 * 1000
const LOCK_MINUTES = 15

export const passwordOptions: HashOptions = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 1,
  hashLength: 32,
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, passwordOptions)
}

export async function login(db: Database.Database, username: string, password: string, webContentsId: number): Promise<Session> {
  const row = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(username) as UserRow | undefined
  const now = new Date()
  const failure = (reason: string) => db.prepare('INSERT INTO login_history(id,user_id,username_attempted,success,occurred_at,reason) VALUES(?,?,?,?,?,?)')
    .run(randomUUID(), row?.id ?? null, username, 0, now.toISOString(), reason)
  if (!row || !row.active) {
    failure('invalid_credentials')
    await argon2.hash(password, { ...passwordOptions, salt: randomBytes(16) })
    throw new Error('Invalid username or password')
  }
  if (row.locked_until && new Date(row.locked_until) > now) {
    failure('account_locked')
    throw new Error('Account is temporarily locked')
  }
  if (!(await argon2.verify(row.password_hash, password))) {
    const failures = row.failed_attempts + 1
    const lock = failures >= 5 ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null
    db.prepare('UPDATE users SET failed_attempts=?, locked_until=?, updated_at=? WHERE id=?').run(failures, lock, now.toISOString(), row.id)
    failure('invalid_credentials')
    throw new Error('Invalid username or password')
  }
  db.prepare('UPDATE users SET failed_attempts=0, locked_until=NULL, updated_at=? WHERE id=?').run(now.toISOString(), row.id)
  db.prepare('INSERT INTO login_history(id,user_id,username_attempted,success,occurred_at) VALUES(?,?,?,?,?)').run(randomUUID(), row.id, username, 1, now.toISOString())
  const session: Session = { token: randomBytes(32).toString('base64url'), userId: row.id, username: row.username, displayName: row.display_name, role: row.role, permissions: JSON.parse(row.permissions_json) as string[], expiresAt: Date.now() + SESSION_MS, webContentsId }
  sessions.set(session.token, session)
  appendAudit(db, { actorUserId: row.id, action: 'auth.login', entityType: 'user', entityId: row.id })
  return session
}

export function requireSession(token: string, webContentsId: number, permissions: string[] = []): Session {
  const session = sessions.get(token)
  if (!session || session.webContentsId !== webContentsId || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token)
    throw new Error('Session expired')
  }
  const privileged = session.role === 'super_admin' || session.role === 'admin'
  if (!privileged && permissions.some((permission) => !session.permissions.includes(permission))) throw new Error('Permission denied')
  session.expiresAt = Date.now() + SESSION_MS
  return session
}

export function logout(token: string): void { sessions.delete(token) }
export function clearSessionsForWindow(webContentsId: number): void {
  for (const [token, session] of sessions) if (session.webContentsId === webContentsId) sessions.delete(token)
}

