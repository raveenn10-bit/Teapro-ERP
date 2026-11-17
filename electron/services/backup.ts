import type Database from 'better-sqlite3-multiple-ciphers'
import { app } from 'electron'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export async function createVerifiedBackup(db: Database.Database, destination?: string): Promise<{ path: string; sha256: string }> {
  const directory = destination || join(app.getPath('documents'), 'TeaPro ERP Backups')
  mkdirSync(directory, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = join(directory, `TeaPro-ERP-${stamp}.teapro-backup`)
  await db.backup(path)
  const data = readFileSync(path)
  const sha256 = createHash('sha256').update(data).digest('hex')
  writeFileSync(`${path}.sha256`, `${sha256}  ${path.split(/[\\/]/).pop()}\n`)
  return { path, sha256 }
}

