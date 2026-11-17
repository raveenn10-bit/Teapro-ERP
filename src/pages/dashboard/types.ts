export type TrendPoint = { label: string; collected: number; dispatched: number }
export type PerformanceRow = { name: string; weight: number; variance?: number }
export type RecentTransaction = {
  id: string
  reference: string
  party: string
  type: 'collection' | 'payment' | 'expense' | 'dispatch'
  amount: number
  status: 'paid' | 'pending' | 'partial' | 'void'
  timestamp: string
}

export type DashboardSnapshot = {
  todayCollectedKg: number
  todayEstateHarvestKg: number
  totalSuppliers: number
  totalEmployees: number
  todayPurchases: number
  todayRevenue: number
  todayExpenses: number
  supplierOutstanding: number
  factoryOutstanding: number
  monthlyEarnings: number
  netProfit: number
  currency: string
  collectionTrend: TrendPoint[]
  estatePerformance: PerformanceRow[]
  factoryPerformance: PerformanceRow[]
  recentTransactions: RecentTransaction[]
}

export const emptyDashboardSnapshot: DashboardSnapshot = {
  todayCollectedKg: 0,
  todayEstateHarvestKg: 0,
  totalSuppliers: 0,
  totalEmployees: 0,
  todayPurchases: 0,
  todayRevenue: 0,
  todayExpenses: 0,
  supplierOutstanding: 0,
  factoryOutstanding: 0,
  monthlyEarnings: 0,
  netProfit: 0,
  currency: 'LKR',
  collectionTrend: [],
  estatePerformance: [],
  factoryPerformance: [],
  recentTransactions: [],
}
