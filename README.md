# TeaPro ERP

**Smart Tea. Smart Business.**  
Developed by **Harsh Apex Digital Solutions**

TeaPro ERP is an offline-first Windows desktop system for Sri Lankan tea estates, green-leaf collectors, suppliers and factory operations. It combines green-leaf billing, supplier settlements, estate production, payroll, factory dispatch, transport, accounting, reporting and local backup workflows.

## Technology

- Electron, React, TypeScript and Vite
- Tailwind CSS, Lucide, Recharts and Framer Motion
- SQLCipher-compatible local SQLite storage
- Argon2id password hashing and Windows `safeStorage` key protection
- i18next Sinhala/English localization
- Electron Builder / NSIS packaging

## Development

```bash
npm install
npm run dev
```

Production and Windows packaging are documented in [Build Instructions](docs/BUILD.md). Native modules must be rebuilt for the Electron runtime before packaging.

## Important status

This repository is under active implementation. A feature is production-ready only when its code, automated tests and applicable Windows/manual test evidence exist. The installer is unsigned unless a valid code-signing certificate is configured. Printer, scale and serial-device compatibility must be verified with each actual device model.

## Documentation

- [English User Manual](docs/USER-MANUAL-EN.md)
- [සිංහල පරිශීලක අත්පොත](docs/USER-MANUAL-SI.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Backup & Recovery](docs/BACKUP-RECOVERY.md)
- [Security](docs/SECURITY.md)
- [Hardware Configuration](docs/HARDWARE.md)
- [Database Migration](docs/DATA-MIGRATION.md)
- [Build Instructions](docs/BUILD.md)
- [Testing Record](docs/TESTING.md)
- [Architecture Decisions](docs/ARCHITECTURE.md)

## Data safety

Business data belongs outside the application installation folder. Never uninstall, delete or replace a customer database without a verified encrypted backup and explicit customer authorization. Software upgrades must preserve the configured data directory.

Copyright © Harsh Apex Digital Solutions. All rights reserved.
