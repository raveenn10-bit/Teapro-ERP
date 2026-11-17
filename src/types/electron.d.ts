export {}

type IpcResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string }

declare global {
  interface Window {
    teaPro?: {
      setup: { status(): Promise<IpcResult<{ initialized: boolean }>>; initialize(input: unknown): Promise<IpcResult<{ recoveryKey: string }>> }
      security: { recover(recoveryKey: string): Promise<IpcResult> }
      auth: { login(username: string, password: string): Promise<IpcResult>; logout(token: string): Promise<IpcResult>; current(token: string): Promise<IpcResult> }
      users: { list(token: string): Promise<IpcResult>; create(input: unknown): Promise<IpcResult> }
      backup: { create(token: string, destination?: string): Promise<IpcResult> }
      entities: {
        list<T>(token: string, entity: string): Promise<IpcResult<T[]>>
        create<T>(token: string, entity: string, record: T): Promise<IpcResult<T>>
        update<T>(token: string, entity: string, record: T): Promise<IpcResult<T>>
      }
      collections: { save(input: unknown): Promise<IpcResult> }
      dashboard: { snapshot(token: string): Promise<IpcResult> }
      platform: string
      versions: { electron: string; chrome: string }
    }
  }
}
