export type EntityId = string

export type RecordStatus = 'active' | 'inactive'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'void'
export type PaymentMethod = 'cash' | 'bank' | 'credit'

export interface AuditedRecord {
  id: EntityId
  createdAt: string
  updatedAt: string
  status: RecordStatus
}

export interface Estate extends AuditedRecord {
  code: string
  name: string
  division: string
  acreage: number
  supervisor: string
  telephone: string
}

export interface Supplier extends AuditedRecord {
  supplierCode: string
  name: string
  nic: string
  telephone: string
  address: string
  category: string
  bankAccount?: string
  ratePerKg?: string
}

export type WageType = 'daily' | 'weight' | 'monthly'

export interface Employee extends AuditedRecord {
  employeeCode: string
  name: string
  nic: string
  telephone: string
  role: string
  wageType: WageType
  baseRate: string
}

export interface Factory extends AuditedRecord {
  factoryCode: string
  name: string
  contactPerson: string
  telephone: string
  address: string
  defaultRate: string
}

export interface CollectionRoute extends AuditedRecord {
  routeCode: string
  name: string
  collectionCenter: string
  driver: string
  vehicleNumber: string
  distanceKm: number
}

export interface TeaRate extends AuditedRecord {
  rateType: 'daily' | 'monthly' | 'supplier' | 'factory'
  partyId?: EntityId
  amount: string
  effectiveFrom: string
  effectiveTo?: string
  provisional: boolean
  notes?: string
}

export interface Account extends AuditedRecord {
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  openingBalance: string
}

export interface PayrollInput {
  basePay: string
  overtime: string
  bonuses: string
  incentives: string
  advances: string
  deductions: string
}

export interface PayrollResult {
  grossPay: string
  totalDeductions: string
  netPay: string
}

export interface LeafPurchaseInput {
  grossWeight: string
  bagWeight: string
  moistureDeduction: string
  otherWeightDeduction: string
  ratePerKg: string
  allowances: string
  financialDeductions: string
}

export interface LeafPurchaseTotals {
  totalWeightDeductions: string
  netWeight: string
  totalAmount: string
  finalPayable: string
}

export interface ReportFilter {
  from: string
  to: string
  query?: string
  status?: string
}

