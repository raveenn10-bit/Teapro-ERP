# Backup and Recovery Guide

## Backup policy

- Keep at least three copies, on two storage types, with one copy away from the main computer.
- Schedule a daily encrypted backup and verify it automatically.
- Retain daily, weekly and monthly restore points according to business policy.
- Use a separate USB/external drive; a copy on the same failing disk is not sufficient.

## Manual backup

1. Sign in as an authorized administrator.
2. Open **Settings → Backup & Recovery** and select **Create backup**.
3. Choose an approved destination and wait for integrity/verification checks.
4. Record the file name, timestamp and verification result.

Never copy live SQLite files directly while transactions can be written. Use the application's SQLite-consistent backup operation.

## Restore

Stop billing, ask users to sign out and create a safety backup of the current database. Review the restore preview, re-authenticate, restore, restart, then verify supplier balances, recent invoices, audit records and printing. A backup is not proven until a restore has been verified.

On a replacement computer, use the encrypted backup and recovery material. DPAPI-protected secrets from the old Windows profile may not be portable; the recovery key is required to unlock and re-protect the database key.
