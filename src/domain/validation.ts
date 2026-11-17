import { z } from 'zod'

export const nonNegativeDecimal = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,3})?$/, 'Enter a valid non-negative number')

export const sriLankanTelephone = z
  .string()
  .trim()
  .regex(/^(?:\+94|0)?7\d{8}$/, 'Enter a valid Sri Lankan mobile number')

export const nic = z
  .string()
  .trim()
  .regex(/^(?:\d{9}[vVxX]|\d{12})$/, 'Enter a valid NIC number')

export const requiredText = z.string().trim().min(1, 'This field is required').max(160)

export function validateDateRange(from: string, to: string) {
  if (!from || !to) return 'Select both dates'
  return new Date(from) <= new Date(to) ? null : 'From date cannot be after To date'
}

