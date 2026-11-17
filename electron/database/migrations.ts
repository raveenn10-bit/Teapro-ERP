export type Migration = { version: number; name: string; sql: string }

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'secure_core_and_erp_schema',
    sql: `
      CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);
      CREATE TABLE company_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL, address TEXT NOT NULL DEFAULT '',
        telephone TEXT NOT NULL DEFAULT '', registration_no TEXT NOT NULL DEFAULT '', logo_path TEXT,
        default_language TEXT NOT NULL CHECK(default_language IN ('en','si')) DEFAULT 'en',
        timezone TEXT NOT NULL DEFAULT 'Asia/Colombo', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE users (
        id TEXT PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE, display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('super_admin','admin','manager','supervisor','cashier','accountant')),
        permissions_json TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
        failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TEXT, password_changed_at TEXT NOT NULL,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE app_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL, updated_by TEXT REFERENCES users(id));
      CREATE TABLE audit_log (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL UNIQUE, occurred_at TEXT NOT NULL,
        actor_user_id TEXT REFERENCES users(id), action TEXT NOT NULL, entity_type TEXT NOT NULL,
        entity_id TEXT, details_json TEXT NOT NULL, previous_hash TEXT, entry_hash TEXT NOT NULL UNIQUE
      );
      CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
      CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
      CREATE TABLE login_history (
        id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), username_attempted TEXT NOT NULL,
        success INTEGER NOT NULL CHECK(success IN(0,1)), occurred_at TEXT NOT NULL, reason TEXT
      );
      CREATE TABLE estates (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, acreage TEXT NOT NULL DEFAULT '0', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE suppliers (id TEXT PRIMARY KEY, supplier_code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, nic TEXT, telephone TEXT, address TEXT, bank_details_json TEXT NOT NULL DEFAULT '{}', category TEXT NOT NULL DEFAULT 'standard', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE employees (id TEXT PRIMARY KEY, employee_code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, nic TEXT, telephone TEXT, wage_rule_json TEXT NOT NULL DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE factories (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, telephone TEXT, address TEXT, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE rates (id TEXT PRIMARY KEY, rate_type TEXT NOT NULL, party_id TEXT, amount_minor INTEGER NOT NULL, effective_from TEXT NOT NULL, effective_to TEXT, provisional INTEGER NOT NULL DEFAULT 0, created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL);
      CREATE TABLE leaf_collections (
        id TEXT PRIMARY KEY, invoice_no TEXT NOT NULL UNIQUE, supplier_id TEXT NOT NULL REFERENCES suppliers(id), estate_id TEXT REFERENCES estates(id),
        collected_at TEXT NOT NULL, location TEXT, gross_weight_mg INTEGER NOT NULL, bag_deduction_mg INTEGER NOT NULL DEFAULT 0,
        moisture_deduction_mg INTEGER NOT NULL DEFAULT 0, other_deduction_mg INTEGER NOT NULL DEFAULT 0, net_weight_mg INTEGER NOT NULL,
        rate_minor_per_kg INTEGER NOT NULL, base_amount_minor INTEGER NOT NULL, allowances_minor INTEGER NOT NULL DEFAULT 0,
        deductions_minor INTEGER NOT NULL DEFAULT 0, payable_minor INTEGER NOT NULL, paid_minor INTEGER NOT NULL DEFAULT 0,
        payment_method TEXT NOT NULL, payment_status TEXT NOT NULL, calculation_snapshot_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'posted' CHECK(status IN('posted','voided','corrected')), notes TEXT,
        operator_id TEXT NOT NULL REFERENCES users(id), idempotency_key TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE accounting_entries (
        id TEXT PRIMARY KEY, source_type TEXT NOT NULL, source_id TEXT NOT NULL, account_code TEXT NOT NULL,
        debit_minor INTEGER NOT NULL DEFAULT 0, credit_minor INTEGER NOT NULL DEFAULT 0, posted_at TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id), UNIQUE(source_type, source_id, account_code, debit_minor, credit_minor)
      );
      CREATE INDEX idx_collections_date ON leaf_collections(collected_at);
      CREATE INDEX idx_collections_supplier_date ON leaf_collections(supplier_id, collected_at);
      CREATE INDEX idx_audit_time ON audit_log(occurred_at);
      CREATE INDEX idx_rates_effective ON rates(rate_type, party_id, effective_from);
    `,
  },
  {
    version: 2,
    name: 'extensible_operational_records',
    sql: `
      CREATE TABLE entity_records (
        entity_type TEXT NOT NULL, id TEXT NOT NULL, data_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','inactive')),
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
        PRIMARY KEY(entity_type, id)
      );
      CREATE INDEX idx_entity_records_type_updated ON entity_records(entity_type, updated_at DESC);
      CREATE TABLE collection_documents (
        id TEXT PRIMARY KEY, invoice_no TEXT NOT NULL UNIQUE, supplier_id TEXT NOT NULL,
        estate_id TEXT, operator_id TEXT NOT NULL REFERENCES users(id), collected_at TEXT NOT NULL,
        net_weight_mg INTEGER NOT NULL, payable_minor INTEGER NOT NULL,
        payment_status TEXT NOT NULL, idempotency_key TEXT NOT NULL UNIQUE,
        snapshot_json TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE INDEX idx_collection_documents_date ON collection_documents(collected_at DESC);
    `,
  },
]

