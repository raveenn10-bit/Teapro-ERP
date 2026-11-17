# Installation Guide

## Supported target

TeaPro ERP targets Windows 10 and Windows 11 x64. Final acceptance testing must be performed on clean, supported Windows machines; Linux development checks do not verify NSIS, Windows printer enumeration, DPAPI or device drivers.

## Customer installation

1. Copy `TeaPro-ERP-Setup.exe` to the customer computer.
2. Verify the SHA-256 supplied by Harsh Apex Digital Solutions.
3. If the build is unsigned, Windows SmartScreen may display an unknown-publisher warning. Confirm the installer came directly from the developer before continuing.
4. Run the installer and launch TeaPro ERP from the desktop or Start menu.
5. Complete first-time setup. Create a unique administrator username and strong password; there is no default password.
6. Print or securely store the one-time recovery key away from the computer.
7. Choose a backup folder on a different physical drive when possible.
8. Configure and test each receipt/A4 printer before live billing.

## Upgrade and uninstall

Create and verify an encrypted backup before upgrading. The application data directory is separate from the program directory. Never manually copy a live database while TeaPro ERP is running. Uninstall must not silently remove business data; delete customer data only after explicit authorization and a verified retained backup.
