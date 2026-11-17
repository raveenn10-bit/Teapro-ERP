# Windows installer assets

`installer.nsh` contains the NSIS lifecycle hooks. Branding files generated under
`public/branding/` should be converted to a multi-resolution `build/icon.ico`
before a release build. Do not substitute an unrelated placeholder icon.

The application stores databases and backups outside the installation directory.
The uninstaller intentionally leaves business data in place. A signed release
requires a valid Windows code-signing certificate supplied through the release
environment; unsigned test installers must be identified as unsigned.
