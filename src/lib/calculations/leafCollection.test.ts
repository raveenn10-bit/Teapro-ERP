import { describe, expect, it } from 'vitest'
import { calculateLeafCollection, createInvoiceNumber } from './leafCollection'

describe('leaf collection calculations', () => {
  it('uses decimal-safe weight and money calculations', () => {
    expect(calculateLeafCollection({
      grossWeight: '100.125', bagWeight: '1.125', moistureDeduction: '2', otherWeightDeduction: '0.5',
      ratePerKg: '245.75', allowances: '100', financialDeductions: '50', amountPaid: '20000',
    })).toEqual({
      approvedWeightDeductions: '3.625', netWeight: '96.500', totalAmount: '23714.88',
      finalPayable: '23764.88', amountPaid: '20000.00', outstandingAmount: '3764.88', paymentStatus: 'partial',
    })
  })

  it('rejects deductions above gross weight', () => {
    expect(() => calculateLeafCollection({
      grossWeight: 10, bagWeight: 11, moistureDeduction: 0, otherWeightDeduction: 0,
      ratePerKg: 200, allowances: 0, financialDeductions: 0, amountPaid: 0,
    })).toThrow('Weight deductions')
  })

  it('creates deterministic daily invoice references', () => {
    expect(createInvoiceNumber(42, new Date(2026, 10, 17))).toBe('TPC-20261117-000042')
  })
})
