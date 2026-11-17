# Build Instructions

## Prerequisites

- Node.js/npm versions supported by the committed toolchain and lockfile
- Windows 10/11 x64 build/verification machine for final NSIS acceptance
- Native build tools for the selected Electron/native module versions
- Optional Authenticode certificate with secure signing configuration

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run dist:win
```

Rebuild native dependencies for the exact Electron version. Keep Electron, SQLCipher-compatible SQLite, Argon2 and serial-port native binaries aligned.

Expected artifact: `release/TeaPro-ERP-Setup.exe` (path/version may be configured by Electron Builder).

Before release, test clean install, setup, upgrade, uninstall, encrypted DB, all three physical paper sizes, Sinhala output, offline behavior and restore on a replacement Windows profile. Verify the installer SHA-256. Sign when a certificate is available; otherwise label it unsigned.

Linux checks alone do not verify NSIS, DPAPI, Windows printers, COM devices or physical hardware.
