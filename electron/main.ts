import { app, BrowserWindow, session, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { closeDatabase } from './database/client.js'
import { registerIpcHandlers, unlockDatabaseIfConfigured } from './ipc.js'
import { clearSessionsForWindow } from './services/auth.js'

const isDev = !app.isPackaged
const __dirname = dirname(fileURLToPath(import.meta.url))
let mainWindow: BrowserWindow | null = null

function applySecurityHeaders(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://localhost:* http://localhost:*; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [csp], 'X-Content-Type-Options': ['nosniff'], 'Referrer-Policy': ['no-referrer'] } })
  })
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false))
  session.defaultSession.setPermissionCheckHandler(() => false)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700, show: false, backgroundColor: '#F5F7F2',
    title: 'TeaPro ERP',
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'), contextIsolation: true, sandbox: true, nodeIntegration: false,
      webSecurity: true, allowRunningInsecureContent: false, spellcheck: false,
    },
  })
  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://harshapex.com.lk')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev ? url.startsWith('http://localhost:') : url.startsWith('file:')
    if (!allowed) event.preventDefault()
  })
  mainWindow.webContents.on('destroyed', () => clearSessionsForWindow(mainWindow?.webContents.id ?? -1))
  if (isDev && process.env.VITE_DEV_SERVER_URL) void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  else void mainWindow.loadFile(join(__dirname, '../dist/renderer/index.html'))
}

app.whenReady().then(() => {
  applySecurityHeaders()
  registerIpcHandlers()
  unlockDatabaseIfConfigured()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('before-quit', closeDatabase)

