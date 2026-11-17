import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { LeafInvoiceSnapshot } from '../printing/types'

export function exportLeafCollectionsPdf(invoices: LeafInvoiceSnapshot[], filename = 'tea-collections.pdf') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  doc.setTextColor(20, 83, 45)
  doc.setFontSize(18)
  doc.text('TeaPro ERP — Green Leaf Collection Report', 14, 16)
  doc.setTextColor(65, 82, 71)
  doc.setFontSize(9)
  doc.text(`Generated: ${new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }).format(new Date())}`, 14, 22)
  autoTable(doc, {
    startY: 28,
    head: [['Invoice', 'Date', 'Supplier', 'Gross kg', 'Net kg', 'Rate', 'Payable LKR', 'Status']],
    body: invoices.map((item) => [item.invoiceNumber, item.createdAt.slice(0, 10), item.supplierName, item.grossWeight,
      item.totals.netWeight, item.ratePerKg, item.totals.finalPayable, item.totals.paymentStatus]),
    headStyles: { fillColor: [20, 83, 45], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 242] },
    styles: { fontSize: 8, cellPadding: 2.5 },
  })
  doc.save(filename)
}
