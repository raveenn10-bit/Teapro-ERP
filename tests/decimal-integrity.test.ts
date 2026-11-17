import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'

describe('financial and weight precision contract', () => {
  it('does not use binary floating point for leaf settlement totals', () => {
    const grossWeight = new Decimal('128.350')
    const deductions = new Decimal('2.125').plus('0.750')
    const netWeight = grossWeight.minus(deductions)
    const total = netWeight.mul('237.45')
    const payable = total.plus('450.00').minus('1250.00')

    expect(netWeight.toFixed(3)).toBe('125.475')
    expect(total.toFixed(2)).toBe('29794.04')
    expect(payable.toFixed(2)).toBe('28994.04')
  })

  it('rounds currency only at the presentation boundary', () => {
    const lineItems = ['10.005', '10.005', '10.005'].map((value) => new Decimal(value))
    const sum = Decimal.sum(...lineItems)

    expect(sum.toString()).toBe('30.015')
    expect(sum.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)).toBe('30.02')
  })
})
