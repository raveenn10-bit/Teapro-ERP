import type { LeafCollectionTotals, PaymentMethod } from '../calculations/leafCollection'

export type ReceiptFormat = '58mm' | '80mm' | 'a4'
export type ReceiptLanguage = 'en' | 'si' | 'bilingual'

export interface CompanyPrintProfile {
  name: string
  address: string
  telephone: string
  registrationNumber?: string
  logoDataUrl?: string
  footer?: string
}

export interface LeafInvoiceSnapshot {
  id: string
  invoiceNumber: string
  createdAt: string
  supplierId: string
  supplierName: string
  supplierPhone?: string
  estateName?: string
  collectionLocation?: string
  operatorName: string
  grossWeight: string
  bagWeight: string
  moistureDeduction: string
  otherWeightDeduction: string
  ratePerKg: string
  allowances: string
  financialDeductions: string
  paymentMethod: PaymentMethod
  notes?: string
  totals: LeafCollectionTotals
  company: CompanyPrintProfile
  savedAt: string
}

export interface PrintOptions {
  format: ReceiptFormat
  language: ReceiptLanguage
  copies: number
  printerName?: string
  silent?: boolean
  marginMm?: number
  fontScale?: number
  showSignature?: boolean
  showQrReference?: boolean
}

export interface PrintResult {
  success: boolean
  jobId?: string
  error?: string
}
