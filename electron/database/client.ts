import Database from 'better-sqlite3-multiple-ciphers'
import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { migrations } from './migrations.js'

let instance: Database.Database | null = null

export function databasePath(): string {
  const directory = join(app.getPath('userData'), 'data')
  mkdirSync(directory, { recursive: true })
  return join(directory, 'teapro.db')
}

export function openDatabase(key: Buffer): Database.Database {
  if (instance) return instance
  const db = new Database(databasePath())
  const hex = key.toString('hex')
  if (!/^[a-f0-9]{64}$/.test(hex)) throw new Error('Database key must be 256 bits')
  db.pragma("cipher='sqlcipher'")
  db.pragma(`key="x'${hex}'"`)
  db.pragma('foreign_keys=ON')
  db.pragma('journal_mode=WAL')
  db.pragma('synchronous=FULL')
  db.pragma('busy_timeout=5000')
  db.prepare('SELECT count(*) AS count FROM sqlite_master').get()
  applyMigrations(db)
  instance = db
  return db
}

function applyMigrations(db: Database.Database): void {
  const hasMigrationTable = Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get())
  const current = hasMigrationTable
    ? (db.prepare('SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations').get() as { version: number }).version
    : 0
  for (const migration of migrations.filter((item) => item.version > current)) {
    db.transaction(() => {
      db.exec(migration.sql)
      db.prepare('INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.version, migration.name, new Date().toISOString())
    })()
  }
}

export function getDatabase(): Database.Database {
  if (!instance) throw new Error('Database has not been unlocked')
  return instance
}

export function closeDatabase(): void {
  instance?.close()
  instance = null
}

