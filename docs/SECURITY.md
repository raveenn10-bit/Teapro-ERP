# Security Documentation

## Design

- Argon2id hashes passwords with unique salts; plaintext passwords are never stored.
- The local database uses a SQLCipher-compatible encrypted SQLite engine.
- The database key stays in the main process and is protected through Windows DPAPI/Electron `safeStorage`.
- Renderer processes use context isolation, sandboxing and a minimal validated preload API. Node integration is disabled.
- Privileged IPC requires input validation, authentication and server-side permission checks.
- Financial mutations use transactions, immutable calculation snapshots and append-only audit entries.
- Rate limiting, temporary lockout, session timeout and re-authentication protect interactive access.
- CSP and blocked unexpected navigation/windows reduce injection risk.

## Known limits

No offline desktop application can completely protect data from a malicious Windows administrator, malware with equal/higher privileges, physical memory attacks or an attacker who controls an unlocked authorized session. DPAPI does not replace BitLocker, endpoint security, strong Windows accounts and restricted physical access.

An unsigned installer does not provide publisher identity assurance. Configure Authenticode signing when a valid certificate is available.

Security reports must exclude passwords, recovery keys, database keys and unredacted personal data.
