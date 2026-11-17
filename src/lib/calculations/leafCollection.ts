import Decimal from 'decimal.js'
import { z } from 'zod'

Decimal.set({ precision: 24, rounding: Decimal.ROUND_HALF_UP })

export type PaymentMethod = 'cash' | 'bank' | 'credit'
export type PaymentStatus = 'paid' | 'partial' | 'pending'

export interface LeafCollectionInput {
  grossWeight: string | number
  bagWeight: string | number
  moistureDeduction: string | number
  otherWeightDeduction: string | number
  ratePerKg: string | number
  allowances: string | number
  financialDeductions: string | number
  amountPaid: string | number
}

export interface LeafCollectionTotals {
  approvedWeightDeductions: string
  netWeight: string
  totalAmount: string
  finalPayable: string
  amountPaid: string
  outstandingAmount: string
  paymentStatus: PaymentStatus
}

const decimalField = z.union([z.string(), z.number()]).transform((value, ctx) => {
  try {
    const parsed = new Decimal(value || 0)
    if (!parsed.isFinite() || parsed.isNegative()) throw new Error('invalid')
    return parsed
  } catch {
    ctx.addIssue({ code: 'custom', message: 'Enter a valid non-negative number' })
    return z.NEVER
  }
})

const inputSchema = z.object({
  grossWeight: decimalField,
  bagWeight: decimalField,
  moistureDeduction: decimalField,
  otherWeightDeduction: decimalField,
  ratePerKg: decimalField,
  allowances: decimalField,
  financialDeductions: decimalField,
  amountPaid: decimalField,
})

const normalized = (value: Decimal, places = 2) => value.toDecimalPlaces(places).toFixed(places)

export function calculateLeafCollection(input: LeafCollectionInput): LeafCollectionTotals {
  const parsed = inputSchema.parse(input)
  const weightDeductions = parsed.bagWeight.plus(parsed.moistureDeduction).plus(parsed.otherWeightDeduction)
  const netWeight = parsed.grossWeight.minus(weightDeductions)
  if (netWeight.isNegative()) throw new Error('Weight deductions cannot exceed gross weight')

  const totalAmount = netWeight.times(parsed.ratePerKg)
  const payable = totalAmount.plus(parsed.allowances).minus(parsed.financialDeductions)
  if (payable.isNegative()) throw new Error('Financial deductions cannot exceed the payable amount')
  if (parsed.amountPaid.greaterThan(payable)) throw new Error('Amount paid cannot exceed the final payable amount')

  const outstanding = payable.minus(parsed.amountPaid)
  const status: PaymentStatus = parsed.amountPaid.isZero()
    ? 'pending'
    : outstanding.isZero()
      ? 'paid'
      : 'partial'

  return {
    approvedWeightDeductions: normalized(weightDeductions, 3),
    netWeight: normalized(netWeight, 3),
    totalAmount: normalized(totalAmount),
    finalPayable: normalized(payable),
    amountPaid: normalized(parsed.amountPaid),
    outstandingAmount: normalized(outstanding),
    paymentStatus: status,
  }
}

export function formatLkr(value: Decimal.Value, locale: 'en-LK' | 'si-LK' = 'en-LK') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(new Decimal(value).toNumber())
}

export function createInvoiceNumber(sequence: number, date = new Date()) {
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Invoice sequence must be a positive integer')
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `TPC-${stamp}-${String(sequence).padStart(6, '0')}`
}
