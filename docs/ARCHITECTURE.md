# Architecture Decisions

- **Renderer:** React UI only; it cannot load Node.js, open the database or access keys.
- **Preload:** small typed allowlist invoking named IPC channels.
- **Main process:** authorization, validation, transactions, printing, backup, files and hardware adapters.
- **Database:** encrypted SQLite with foreign keys, migrations, indexes, snapshots and append-only audit records.

Money and weight use exact decimal/integer representations rather than floating point. Each bill stores immutable inputs, deductions, rate and outputs.

Posted financial transactions are not deleted. An authorized void/correction creates linked reversing/replacement records with reason, user and time. Accounting postings use idempotency keys.

Data lives in the Windows per-user app-data directory, not the installation folder. Schema migrations run transactionally after a verified backup. Unsupported future schema versions are rejected.

Business timestamps follow Asia/Colombo semantics and preserve an unambiguous instant plus business date.
