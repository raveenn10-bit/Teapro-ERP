export interface EntityGateway<T extends { id: string }> {
  list(entity: string): Promise<T[]>
  create(entity: string, record: T): Promise<T>
  update(entity: string, record: T): Promise<T>
}

const api = () => window.teaPro
const token = () => sessionStorage.getItem('teapro.session') ?? ''

export function hasDesktopEntityGateway() {
  return Boolean(api()?.entities)
}

const demoKey = (entity: string) => `teapro.demo.entities.${entity}`
const readDemo = <T extends { id: string }>(entity: string): T[] => {
  try { return JSON.parse(localStorage.getItem(demoKey(entity)) ?? '[]') as T[] } catch { return [] }
}
const writeDemo = <T extends { id: string }>(entity: string, rows: T[]) => localStorage.setItem(demoKey(entity), JSON.stringify(rows))

export const desktopEntityGateway: EntityGateway<{ id: string }> = {
  async list<T extends { id: string }>(entity: string) {
    const result = await api()?.entities?.list<T>(token(), entity)
    if (!result) return readDemo<T>(entity)
    if (!result.ok) throw new Error(result.error)
    return result.data
  },
  async create<T extends { id: string }>(entity: string, record: T) {
    const result = await api()?.entities?.create(token(), entity, record)
    if (!result) { writeDemo(entity, [record, ...readDemo<T>(entity)]); return record }
    if (!result.ok) throw new Error(result.error)
    return result.data
  },
  async update<T extends { id: string }>(entity: string, record: T) {
    const result = await api()?.entities?.update(token(), entity, record)
    if (!result) { writeDemo(entity, readDemo<T>(entity).map((row) => row.id === record.id ? record : row)); return record }
    if (!result.ok) throw new Error(result.error)
    return result.data
  },
}

