import Decimal from 'decimal.js'
import type { LeafPurchaseInput, LeafPurchaseTotals, PayrollInput, PayrollResult } from './types'

Decimal.set({ precision: 24, rounding: Decimal.ROUND_HALF_UP })

const decimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

const fixed = (value: Decimal, scale = 2) => value.toDecimalPlaces(scale).toFixed(scale)

export function calculateLeafPurchase(input: LeafPurchaseInput): LeafPurchaseTotals {
  const grossWeight = decimal(input.grossWeight)
  const deductions = decimal(input.bagWeight)
    .plus(input.moistureDeduction || 0)
    .plus(input.otherWeightDeduction || 0)

  const netWeight = Decimal.max(grossWeight.minus(deductions), 0)
  const totalAmount = netWeight.times(decimal(input.ratePerKg))
  const finalPayable = Decimal.max(
    totalAmount.plus(decimal(input.allowances)).minus(decimal(input.financialDeductions)),
    0,
  )

  return {
    totalWeightDeductions: fixed(deductions, 3),
    netWeight: fixed(netWeight, 3),
    totalAmount: fixed(totalAmount),
    finalPayable: fixed(finalPayable),
  }
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const grossPay = decimal(input.basePay)
    .plus(input.overtime || 0)
    .plus(input.bonuses || 0)
    .plus(input.incentives || 0)
  const totalDeductions = decimal(input.advances).plus(input.deductions || 0)
  return {
    grossPay: fixed(grossPay),
    totalDeductions: fixed(totalDeductions),
    netPay: fixed(Decimal.max(grossPay.minus(totalDeductions), 0)),
  }
}

export function formatLkr(value: string | number) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0)
}

