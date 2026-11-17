import { describe, expect, it } from 'vitest'
import { calculateLeafPurchase, calculatePayroll } from './calculations'

describe('tea purchase calculations', () => {
  it('uses exact decimal arithmetic for weight and money', () => {
    expect(calculateLeafPurchase({
      grossWeight: '100.125', bagWeight: '1.125', moistureDeduction: '2.000', otherWeightDeduction: '0.500',
      ratePerKg: '185.50', allowances: '250', financialDeductions: '100',
    })).toEqual({ totalWeightDeductions: '3.625', netWeight: '96.500', totalAmount: '17900.75', finalPayable: '18050.75' })
  })

  it('never produces a negative payable or weight', () => {
    const result = calculateLeafPurchase({ grossWeight: '1', bagWeight: '5', moistureDeduction: '0', otherWeightDeduction: '0', ratePerKg: '100', allowances: '0', financialDeductions: '100' })
    expect(result.netWeight).toBe('0.000')
    expect(result.finalPayable).toBe('0.00')
  })
})

describe('payroll calculations', () => {
  it('calculates gross, deductions and net pay', () => {
    expect(calculatePayroll({ basePay: '50000', overtime: '2000.50', bonuses: '1000', incentives: '500', advances: '2500', deductions: '750.25' }))
      .toEqual({ grossPay: '53500.50', totalDeductions: '3250.25', netPay: '50250.25' })
  })
})

