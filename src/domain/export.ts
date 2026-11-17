export type ExportRow = Record<string, string | number | boolean | null | undefined>

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function exportCsv(filename: string, rows: ExportRow[]) {
  if (!rows.length) return false
  const headers = Object.keys(rows[0])
  const csv = [headers.map(escapeCsv).join(','), ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','))].join('\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
  return true
}

