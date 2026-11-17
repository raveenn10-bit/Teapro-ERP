import * as XLSX from 'xlsx'
import type { LeafInvoiceSnapshot } from '../printing/types'

export function exportLeafCollectionsExcel(invoices: LeafInvoiceSnapshot[], filename = 'tea-collections.xlsx') {
  const rows = invoices.map((invoice) => ({
    'Invoice No': invoice.invoiceNumber,
    Date: invoice.createdAt,
    'Supplier ID': invoice.supplierId,
    Supplier: invoice.supplierName,
    Estate: invoice.estateName ?? '',
    'Gross Weight (kg)': Number(invoice.grossWeight),
    'Deductions (kg)': Number(invoice.totals.approvedWeightDeductions),
    'Net Weight (kg)': Number(invoice.totals.netWeight),
    'Rate (LKR/kg)': Number(invoice.ratePerKg),
    'Payable (LKR)': Number(invoice.totals.finalPayable),
    'Paid (LKR)': Number(invoice.totals.amountPaid),
    'Outstanding (LKR)': Number(invoice.totals.outstandingAmount),
    Status: invoice.totals.paymentStatus,
  }))
  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [14, 22, 14, 24, 20, 18, 18, 18, 18, 18, 16, 20, 12].map((wch) => ({ wch }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaf Collections')
  XLSX.writeFile(workbook, filename, { compression: true })
}
