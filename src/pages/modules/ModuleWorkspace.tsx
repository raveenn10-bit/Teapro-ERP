import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Download, Filter, Plus, Search, X } from 'lucide-react'
import { exportCsv } from '../../domain/export'
import { desktopEntityGateway } from '../../domain/gateway'
import { demoEntities } from '../../demo/demoData'
import './modules.css'

export type FieldOption = { label: string; value: string }
export type ModuleField = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'tel' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
}

export type ModuleColumn = {
  key: string
  label: string
  format?: (value: unknown, row: ModuleRecord) => string
}

export type ModuleRecord = Record<string, string | number | boolean> & { id: string }

export interface ModuleWorkspaceProps {
  eyebrow: string
  title: string
  description: string
  entityName: string
  emptyTitle: string
  emptyDescription: string
  fields: ModuleField[]
  columns: ModuleColumn[]
  initialRows?: ModuleRecord[]
  onCreate?: (record: ModuleRecord) => Promise<ModuleRecord> | ModuleRecord
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

export function ModuleWorkspace({
  eyebrow,
  title,
  description,
  entityName,
  emptyTitle,
  emptyDescription,
  fields,
  columns,
  initialRows = [],
  onCreate,
}: ModuleWorkspaceProps) {
  const [rows, setRows] = useState(initialRows)
  const [query, setQuery] = useState('')
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => {
    let cancelled = false
    void desktopEntityGateway.list(entityName).then((saved) => {
      if (cancelled) return
      if (saved.length) setRows(saved as ModuleRecord[])
      else if (!window.teaPro && demoEntities[entityName]) {
        const seeded = demoEntities[entityName] as ModuleRecord[]
        localStorage.setItem(`teapro.demo.entities.${entityName}`, JSON.stringify(seeded))
        setRows(seeded)
      }
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [entityName])

  const filteredRows = useMemo(() => {
    if (!deferredQuery) return rows
    return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(deferredQuery)))
  }, [deferredQuery, rows])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const missing = fields.find((field) => field.required && !form[field.key]?.trim())
    if (missing) {
      setError(`${missing.label} is required`)
      return
    }
    setError('')
    const now = new Date().toISOString()
    const draft: ModuleRecord = { id: newId(), status: 'active', createdAt: now, updatedAt: now }
    fields.forEach((field) => {
      const value = form[field.key] ?? ''
      draft[field.key] = field.type === 'number' ? Number(value) : value
    })
    try {
      const saved = onCreate ? await onCreate(draft) : await desktopEntityGateway.create(entityName, draft)
      setRows((current) => [saved, ...current])
      setForm({})
      setFormOpen(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save the record')
    }
  }

  return (
    <section className="module-page" aria-labelledby={`${entityName}-title`}>
      <header className="module-header">
        <div>
          <p className="module-eyebrow">{eyebrow}</p>
          <h1 id={`${entityName}-title`}>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="module-primary" type="button" onClick={() => setFormOpen(true)}>
          <Plus size={18} aria-hidden /> Add {entityName}
        </button>
      </header>

      <div className="module-toolbar" role="search">
        <label className="module-search">
          <Search size={18} aria-hidden />
          <span className="sr-only">Search {entityName}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${entityName.toLowerCase()} records…`} />
        </label>
        <button className="module-secondary" type="button" title="Advanced filters are applied per module">
          <Filter size={17} aria-hidden /> Filters
        </button>
        <button
          className="module-secondary"
          type="button"
          disabled={!filteredRows.length}
          onClick={() => exportCsv(`${entityName.toLowerCase().replaceAll(' ', '-')}.csv`, filteredRows)}
        >
          <Download size={17} aria-hidden /> Export CSV
        </button>
        <span className="module-count">{filteredRows.length} record{filteredRows.length === 1 ? '' : 's'}</span>
      </div>

      <div className="module-table-wrap">
        {filteredRows.length ? (
          <table className="module-table">
            <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => <td key={column.key}>{column.format ? column.format(row[column.key], row) : String(row[column.key] ?? '—')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="module-empty">
            <div className="module-empty-mark" aria-hidden>TP</div>
            <h2>{query ? 'No matching records' : emptyTitle}</h2>
            <p>{query ? 'Try a different name, code or telephone number.' : emptyDescription}</p>
            {!query && <button type="button" className="module-link" onClick={() => setFormOpen(true)}>Create the first record</button>}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="module-modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <div className="module-modal" role="dialog" aria-modal="true" aria-labelledby="record-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="module-modal-head">
              <div><p className="module-eyebrow">New record</p><h2 id="record-form-title">Add {entityName}</h2></div>
              <button className="module-icon-button" type="button" onClick={() => setFormOpen(false)} aria-label="Close form"><X size={20} /></button>
            </div>
            <form className="module-form" onSubmit={submit}>
              {fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' ? 'module-field module-field-wide' : 'module-field'}>
                  <span>{field.label}{field.required && <b aria-hidden> *</b>}</span>
                  {field.type === 'select' ? (
                    <select value={form[field.key] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required}>
                      <option value="">Select…</option>
                      {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} rows={3} />
                  ) : (
                    <input type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? '0.001' : undefined} value={form[field.key] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} required={field.required} />
                  )}
                </label>
              ))}
              {error && <p className="module-error" role="alert">{error}</p>}
              <div className="module-actions">
                <button type="button" className="module-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="module-primary">Save {entityName}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

