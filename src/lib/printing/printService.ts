import { createLeafInvoiceHtml } from './templates'
import type { LeafInvoiceSnapshot, PrintOptions, PrintResult } from './types'

interface NativePrintBridge {
  printHtml(payload: { html: string; options: PrintOptions }): Promise<PrintResult>
  exportPdf?(payload: { html: string; suggestedName: string }): Promise<{ success: boolean; path?: string; error?: string }>
}

const nativeBridge = () => (window as unknown as { teaPro?: { printing?: NativePrintBridge } }).teaPro?.printing

export async function printLeafInvoice(invoice: LeafInvoiceSnapshot, options: PrintOptions): Promise<PrintResult> {
  if (!invoice.id || !invoice.savedAt) return { success: false, error: 'The transaction must be saved before printing.' }
  const html = createLeafInvoiceHtml(invoice, options)
  const bridge = nativeBridge()
  if (bridge) return bridge.printHtml({ html, options })

  const preview = window.open('', '_blank', 'noopener,noreferrer,width=900,height=760')
  if (!preview) return { success: false, error: 'Print preview was blocked. Enable pop-ups and try again.' }
  preview.document.open()
  preview.document.write(html)
  preview.document.close()
  preview.addEventListener('load', () => preview.print(), { once: true })
  return { success: true, jobId: `browser-${Date.now()}` }
}

export async function saveThenPrint<TDraft>(
  draft: TDraft,
  save: (draft: TDraft) => Promise<LeafInvoiceSnapshot>,
  options: PrintOptions,
) {
  const savedInvoice = await save(draft)
  const printResult = await printLeafInvoice(savedInvoice, options)
  return { savedInvoice, printResult }
}
