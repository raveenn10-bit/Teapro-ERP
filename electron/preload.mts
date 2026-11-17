import { contextBridge, ipcRenderer } from 'electron'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }
const invoke = <T,>(channel: string, input?: unknown) => ipcRenderer.invoke(channel, input) as Promise<Result<T>>

contextBridge.exposeInMainWorld('teaPro', Object.freeze({
  setup: Object.freeze({ status: () => invoke('setup:status'), initialize: (input: unknown) => invoke('setup:initialize', input) }),
  security: Object.freeze({ recover: (recoveryKey: string) => invoke('security:recover', { recoveryKey }) }),
  auth: Object.freeze({ login: (username: string, password: string) => invoke('auth:login', { username, password }), logout: (token: string) => invoke('auth:logout', { token }), current: (token: string) => invoke('session:current', { token }) }),
  users: Object.freeze({ list: (token: string) => invoke('users:list', { token }), create: (input: unknown) => invoke('users:create', input) }),
  backup: Object.freeze({ create: (token: string, destination?: string) => invoke('backup:create', { token, destination }) }),
  entities: Object.freeze({
    list: (token: string, entity: string) => invoke('entities:list', { token, entity }),
    create: (token: string, entity: string, record: unknown) => invoke('entities:create', { token, entity, record }),
    update: (token: string, entity: string, record: unknown) => invoke('entities:update', { token, entity, record }),
  }),
  collections: Object.freeze({ save: (input: unknown) => invoke('collections:save', input) }),
  dashboard: Object.freeze({ snapshot: (token: string) => invoke('dashboard:snapshot', { token }) }),
  platform: process.platform,
  versions: Object.freeze({ electron: process.versions.electron, chrome: process.versions.chrome }),
}))

