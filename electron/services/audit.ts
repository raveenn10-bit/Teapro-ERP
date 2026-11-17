import { createHash, randomUUID } from 'node:crypto'
import type Database from 'better-sqlite3-multiple-ciphers'

export function appendAudit(
  db: Database.Database,
  event: { actorUserId?: string | null; action: string; entityType: string; entityId?: string | null; details?: unknown },
): void {
  const previous = db.prepare('SELECT entry_hash FROM audit_log ORDER BY sequence DESC LIMIT 1').get() as { entry_hash: string } | undefined
  const eventId = randomUUID()
  const occurredAt = new Date().toISOString()
  const detailsJson = JSON.stringify(event.details ?? {})
  const canonical = [eventId, occurredAt, event.actorUserId ?? '', event.action, event.entityType, event.entityId ?? '', detailsJson, previous?.entry_hash ?? ''].join('|')
  const hash = createHash('sha256').update(canonical).digest('hex')
  db.prepare(`INSERT INTO audit_log(event_id, occurred_at, actor_user_id, action, entity_type, entity_id, details_json, previous_hash, entry_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(eventId, occurredAt, event.actorUserId ?? null, event.action, event.entityType, event.entityId ?? null, detailsJson, previous?.entry_hash ?? null, hash)
}

