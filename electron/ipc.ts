import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { z } from 'zod'
import { databasePath, getDatabase, openDatabase } from './database/client.js'
import { createAndPersistDatabaseKey, loadDatabaseKey, recoverAndProtectDatabaseKey } from './security/key-store.js'
import { appendAudit } from './services/audit.js'
import { createVerifiedBackup } from './services/backup.js'
import { hashPassword, login, logout, requireSession } from './services/auth.js'

const setupSchema = z.object({
  companyName: z.string().trim().min(2).max(160), address: z.string().trim().max(500).default(''),
  telephone: z.string().trim().max(30).default(''), registrationNo: z.string().trim().max(80).default(''),
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/), displayName: z.string().trim().min(2).max(120),
  password: z.string().min(12).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  defaultLanguage: z.enum(['en', 'si']).default('en'),
})
const loginSchema = z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(256) })
const tokenSchema = z.string().min(32).max(128)
const entityTypeSchema = z.enum(['Estate', 'Supplier', 'Employee', 'Factory', 'Route', 'Rate', 'Account'])
const entityRecordSchema = z.object({ id: z.string().uuid().or(z.string().min(8).max(80)).optional(), status: z.enum(['active', 'inactive']).optional() }).loose()

function decimalUnits(value: unknown, scale: number): number {
  const normalized = String(value ?? '0').trim()
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error('Invalid decimal value')
  const negative = normalized.startsWith('-')
  const [whole, fraction = ''] = normalized.replace('-', '').split('.')
  const padded = `${fraction}${'0'.repeat(scale)}`.slice(0, scale)
  const units = Number(BigInt(whole || '0') * BigInt(10 ** scale) + BigInt(padded || '0'))
  if (!Number.isSafeInteger(units)) throw new Error('Value is outside the supported range')
  return negative ? -units : units
}

function register<T>(channel: string, schema: z.ZodType<T>, handler: (event: IpcMainInvokeEvent, input: T) => unknown | Promise<unknown>): void {
  ipcMain.handle(channel, async (event, raw: unknown) => {
    try { return { ok: true, data: await handler(event, schema.parse(raw)) } }
    catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' } }
  })
}

export function registerIpcHandlers(): void {
  register('setup:status', z.null().optional(), () => ({ initialized: existsSync(databasePath()) }))
  register('setup:initialize', setupSchema, async (_event, input) => {
    if (existsSync(databasePath())) throw new Error('Application is already initialized')
    const keyMaterial = createAndPersistDatabaseKey()
    const db = openDatabase(keyMaterial.databaseKey)
    const now = new Date().toISOString()
    const userId = randomUUID()
    const passwordHash = await hashPassword(input.password)
    db.transaction(() => {
      db.prepare(`INSERT INTO company_profile(id,name,address,telephone,registration_no,default_language,created_at,updated_at) VALUES(1,?,?,?,?,?,?,?)`)
        .run(input.companyName, input.address, input.telephone, input.registrationNo, input.defaultLanguage, now, now)
      db.prepare(`INSERT INTO users(id,username,display_name,password_hash,role,permissions_json,password_changed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`)
        .run(userId, input.username, input.displayName, passwordHash, 'super_admin', '["*"]', now, now, now)
      appendAudit(db, { actorUserId: userId, action: 'setup.completed', entityType: 'company', entityId: '1' })
    })()
    return { recoveryKey: keyMaterial.recoveryKey }
  })
  register('security:recover', z.object({ recoveryKey: z.string().min(20).max(100) }), (_event, input) => {
    const key = recoverAndProtectDatabaseKey(input.recoveryKey)
    openDatabase(key)
    return { recovered: true }
  })
  register('auth:login', loginSchema, async (event, input) => {
    const db = getDatabase()
    const session = await login(db, input.username, input.password, event.sender.id)
    return { token: session.token, user: { id: session.userId, username: session.username, displayName: session.displayName, role: session.role, permissions: session.permissions }, expiresAt: session.expiresAt }
  })
  register('auth:logout', z.object({ token: tokenSchema }), (_event, input) => { logout(input.token); return null })
  register('session:current', z.object({ token: tokenSchema }), (event, input) => {
    const session = requireSession(input.token, event.sender.id)
    return { user: { id: session.userId, username: session.username, displayName: session.displayName, role: session.role, permissions: session.permissions }, expiresAt: session.expiresAt }
  })
  register('users:list', z.object({ token: tokenSchema }), (event, input) => {
    requireSession(input.token, event.sender.id, ['users.read'])
    return getDatabase().prepare('SELECT id,username,display_name AS displayName,role,active,created_at AS createdAt FROM users ORDER BY display_name').all()
  })
  register('users:create', z.object({ token: tokenSchema, username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/), displayName: z.string().min(2).max(120), password: z.string().min(12).max(128), role: z.enum(['admin','manager','supervisor','cashier','accountant']), permissions: z.array(z.string().max(80)).max(100) }), async (event, input) => {
    const actor = requireSession(input.token, event.sender.id, ['users.manage'])
    const db = getDatabase(); const id = randomUUID(); const now = new Date().toISOString()
    db.prepare('INSERT INTO users(id,username,display_name,password_hash,role,permissions_json,password_changed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(id, input.username, input.displayName, await hashPassword(input.password), input.role, JSON.stringify(input.permissions), now, now, now)
    appendAudit(db, { actorUserId: actor.userId, action: 'user.created', entityType: 'user', entityId: id, details: { role: input.role } })
    return { id }
  })
  register('backup:create', z.object({ token: tokenSchema, destination: z.string().max(500).optional() }), async (event, input) => {
    const actor = requireSession(input.token, event.sender.id, ['backup.create'])
    const result = await createVerifiedBackup(getDatabase(), input.destination)
    appendAudit(getDatabase(), { actorUserId: actor.userId, action: 'backup.created', entityType: 'backup', details: { sha256: result.sha256 } })
    return result
  })
  register('entities:list', z.object({ token: tokenSchema, entity: entityTypeSchema }), (event, input) => {
    requireSession(input.token, event.sender.id, ['records.read'])
    return getDatabase().prepare(`SELECT data_json FROM entity_records WHERE entity_type=? ORDER BY updated_at DESC`)
      .all(input.entity).map((row) => JSON.parse((row as { data_json: string }).data_json) as unknown)
  })
  register('entities:create', z.object({ token: tokenSchema, entity: entityTypeSchema, record: entityRecordSchema }), (event, input) => {
    const actor = requireSession(input.token, event.sender.id, ['records.manage'])
    const db = getDatabase(); const now = new Date().toISOString(); const id = String(input.record.id ?? randomUUID())
    const record = { ...input.record, id, status: input.record.status === 'inactive' ? 'inactive' : 'active', createdAt: now, updatedAt: now }
    db.transaction(() => {
      db.prepare('INSERT INTO entity_records(entity_type,id,data_json,status,created_at,updated_at) VALUES(?,?,?,?,?,?)')
        .run(input.entity, id, JSON.stringify(record), record.status, now, now)
      appendAudit(db, { actorUserId: actor.userId, action: 'record.created', entityType: input.entity, entityId: id })
    })()
    return record
  })
  register('entities:update', z.object({ token: tokenSchema, entity: entityTypeSchema, record: z.object({ id: z.string().min(8).max(80), status: z.enum(['active', 'inactive']).optional() }).loose() }), (event, input) => {
    const actor = requireSession(input.token, event.sender.id, ['records.manage'])
    const db = getDatabase(); const now = new Date().toISOString()
    const existing = db.prepare('SELECT data_json,created_at FROM entity_records WHERE entity_type=? AND id=?').get(input.entity, input.record.id) as { data_json: string; created_at: string } | undefined
    if (!existing) throw new Error('Record not found')
    const record = { ...JSON.parse(existing.data_json) as object, ...input.record, createdAt: existing.created_at, updatedAt: now }
    db.transaction(() => {
      db.prepare('UPDATE entity_records SET data_json=?,status=?,updated_at=? WHERE entity_type=? AND id=?')
        .run(JSON.stringify(record), input.record.status === 'inactive' ? 'inactive' : 'active', now, input.entity, input.record.id)
      appendAudit(db, { actorUserId: actor.userId, action: 'record.updated', entityType: input.entity, entityId: input.record.id })
    })()
    return record
  })
  register('collections:save', z.object({ token: tokenSchema, invoiceNumber: z.string().min(3).max(80), supplierId: z.string().min(1), estateId: z.string().optional(), operatorName: z.string().max(120), grossWeight: z.union([z.string(),z.number()]), bagWeight: z.union([z.string(),z.number()]), moistureDeduction: z.union([z.string(),z.number()]), otherWeightDeduction: z.union([z.string(),z.number()]), netWeight: z.union([z.string(),z.number()]), ratePerKg: z.union([z.string(),z.number()]), allowances: z.union([z.string(),z.number()]), financialDeductions: z.union([z.string(),z.number()]), totalAmount: z.union([z.string(),z.number()]), finalPayable: z.union([z.string(),z.number()]), amountPaid: z.union([z.string(),z.number()]), paymentMethod: z.string().max(30), paymentStatus: z.string().max(30), collectionLocation: z.string().max(200).optional(), notes: z.string().max(1000).optional(), idempotencyKey: z.string().min(8).max(120) }), (event, input) => {
    const actor = requireSession(input.token, event.sender.id, ['collections.create'])
    const db = getDatabase(); const id = randomUUID(); const now = new Date().toISOString()
    const snapshot = { ...input, token: undefined, id, savedAt: now }
    db.transaction(() => {
      db.prepare('INSERT INTO collection_documents(id,invoice_no,supplier_id,estate_id,operator_id,collected_at,net_weight_mg,payable_minor,payment_status,idempotency_key,snapshot_json,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, input.invoiceNumber, input.supplierId, input.estateId || null, actor.userId, now, decimalUnits(input.netWeight, 3), decimalUnits(input.finalPayable, 2), input.paymentStatus, input.idempotencyKey, JSON.stringify(snapshot), now)
      appendAudit(db, { actorUserId: actor.userId, action: 'collection.posted', entityType: 'leaf_collection', entityId: id, details: { invoiceNumber: input.invoiceNumber } })
    })()
    return snapshot
  })
  register('dashboard:snapshot', z.object({ token: tokenSchema }), (event, input) => {
    requireSession(input.token, event.sender.id, ['records.read'])
    const db = getDatabase(); const day = new Date().toISOString().slice(0, 10)
    const totals = db.prepare(`SELECT COALESCE(SUM(net_weight_mg),0) net, COALESCE(SUM(payable_minor),0) payable FROM collection_documents WHERE substr(collected_at,1,10)=?`).get(day) as { net: number; payable: number }
    const count = (entity: string) => (db.prepare('SELECT COUNT(*) count FROM entity_records WHERE entity_type=? AND status=\'active\'').get(entity) as { count: number }).count
    return { todayCollectedKg: totals.net / 1000, todayEstateHarvestKg: 0, totalSuppliers: count('Supplier'), totalEmployees: count('Employee'), todayPurchases: totals.payable / 100, todayRevenue: 0, todayExpenses: 0, supplierOutstanding: 0, factoryOutstanding: 0, monthlyEarnings: 0, netProfit: 0, currency: 'LKR', collectionTrend: [], estatePerformance: [], factoryPerformance: [], recentTransactions: [] }
  })
}

export function unlockDatabaseIfConfigured(): boolean {
  if (!existsSync(databasePath())) return false
  const key = loadDatabaseKey()
  if (!key) return false
  openDatabase(key)
  return true
}

