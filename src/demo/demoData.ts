import type { DashboardSnapshot } from '../pages/dashboard'

const now = new Date().toISOString()

export const demoSession = { token: 'teapro-browser-demo', user: { id: 'demo-admin', username: 'demo.admin', displayName: 'Demo Administrator', role: 'Manager' } }

export const demoSuppliers = [
  { id: 'sup-001', supplierCode: 'SUP-0001', name: 'Sunil Tea Growers', nic: 'Demo record', telephone: '077 123 4567', address: 'Galle', category: 'individual', ratePerKg: '235', status: 'active', createdAt: now, updatedAt: now },
  { id: 'sup-002', supplierCode: 'SUP-0002', name: 'Ruhunu Leaf Centre', nic: 'Demo record', telephone: '071 554 8812', address: 'Akmeemana', category: 'agent', ratePerKg: '238', status: 'active', createdAt: now, updatedAt: now },
  { id: 'sup-003', supplierCode: 'SUP-0003', name: 'Green Valley Growers', nic: 'Demo record', telephone: '075 224 9010', address: 'Yakkalamulla', category: 'estate', ratePerKg: '240', status: 'active', createdAt: now, updatedAt: now },
]

export const demoEstates = [
  { id: 'est-001', code: 'EST-001', name: 'Hillside Estate', division: 'Upper Division', acreage: 84, supervisor: 'N. Perera', telephone: '077 440 1188', status: 'active', createdAt: now, updatedAt: now },
  { id: 'est-002', code: 'EST-002', name: 'Ruhunu Gardens', division: 'South Division', acreage: 62, supervisor: 'S. Kumara', telephone: '071 301 2244', status: 'active', createdAt: now, updatedAt: now },
  { id: 'est-003', code: 'EST-003', name: 'Emerald Ridge', division: 'Central Division', acreage: 45, supervisor: 'A. Silva', telephone: '076 118 9900', status: 'active', createdAt: now, updatedAt: now },
]

export const demoEntities: Record<string, Array<Record<string, string | number | boolean> & { id: string }>> = {
  Supplier: demoSuppliers,
  Estate: demoEstates,
  Employee: [
    { id: 'emp-001', employeeCode: 'EMP-0001', name: 'Kasun Perera', nic: 'Demo record', telephone: '077 211 9090', role: 'Field Supervisor', wageType: 'monthly', baseRate: 68000, status: 'active' },
    { id: 'emp-002', employeeCode: 'EMP-0002', name: 'Nimali Fernando', nic: 'Demo record', telephone: '071 445 1200', role: 'Leaf Collector', wageType: 'weight', baseRate: 42, status: 'active' },
  ],
  Factory: [
    { id: 'fac-001', factoryCode: 'FAC-001', name: 'Southern Tea Factory', contactPerson: 'Operations Desk', telephone: '091 222 4477', address: 'Galle', defaultRate: 262, status: 'active' },
    { id: 'fac-002', factoryCode: 'FAC-002', name: 'Ruhunu Tea Processors', contactPerson: 'Dispatch Office', telephone: '091 555 1280', address: 'Akuressa', defaultRate: 265, status: 'active' },
  ],
  Route: [
    { id: 'rte-001', routeCode: 'RTE-001', name: 'Galle North', collectionCenter: 'Walahanduwa', driver: 'Ruwan', vehicleNumber: 'WP CAB-2481', distanceKm: 28.5, status: 'active' },
    { id: 'rte-002', routeCode: 'RTE-002', name: 'Yakkalamulla', collectionCenter: 'Nakiyadeniya', driver: 'Saman', vehicleNumber: 'SP LF-6142', distanceKm: 41.2, status: 'active' },
  ],
  Rate: [
    { id: 'rate-001', rateType: 'daily', partyReference: 'All suppliers', amount: 235, effectiveFrom: '2026-11-01', effectiveTo: '', provisional: 'false', status: 'active' },
    { id: 'rate-002', rateType: 'factory', partyReference: 'FAC-001', amount: 262, effectiveFrom: '2026-11-01', effectiveTo: '', provisional: 'true', status: 'active' },
  ],
  Account: [
    { id: 'acc-001', code: '1000', name: 'Cash on hand', type: 'asset', openingBalance: 425000, status: 'active' },
    { id: 'acc-002', code: '4000', name: 'Tea leaf sales', type: 'income', openingBalance: 0, status: 'active' },
    { id: 'acc-003', code: '5000', name: 'Green leaf purchases', type: 'expense', openingBalance: 0, status: 'active' },
  ],
}

export const demoDashboard: DashboardSnapshot = {
  todayCollectedKg: 4286.75, todayEstateHarvestKg: 1384.5, totalSuppliers: 128, totalEmployees: 46,
  todayPurchases: 1007386.25, todayRevenue: 1289420, todayExpenses: 184650, supplierOutstanding: 2841500,
  factoryOutstanding: 4128000, monthlyEarnings: 9876400, netProfit: 1248700, currency: 'LKR',
  collectionTrend: [
    { label: 'Mon', collected: 3650, dispatched: 3410 }, { label: 'Tue', collected: 4020, dispatched: 3890 },
    { label: 'Wed', collected: 3780, dispatched: 3600 }, { label: 'Thu', collected: 4450, dispatched: 4210 },
    { label: 'Fri', collected: 4287, dispatched: 4068 }, { label: 'Sat', collected: 4690, dispatched: 4440 },
  ],
  estatePerformance: [{ name: 'Hillside', weight: 1840 }, { name: 'Ruhunu', weight: 1515 }, { name: 'Emerald', weight: 1120 }],
  factoryPerformance: [{ name: 'Southern Tea', weight: 12480, variance: -1.2 }, { name: 'Ruhunu Processors', weight: 9640, variance: 0.7 }],
  recentTransactions: [
    { id: 'txn-1', reference: 'GLC-261117-042', party: 'Sunil Tea Growers', type: 'collection', amount: 84600, status: 'paid', timestamp: '10:42 AM' },
    { id: 'txn-2', reference: 'DSP-261117-008', party: 'Southern Tea Factory', type: 'dispatch', amount: 326880, status: 'pending', timestamp: '9:55 AM' },
    { id: 'txn-3', reference: 'PAY-261117-014', party: 'Ruhunu Leaf Centre', type: 'payment', amount: 125000, status: 'partial', timestamp: '9:18 AM' },
    { id: 'txn-4', reference: 'EXP-261117-005', party: 'Transport & fuel', type: 'expense', amount: 28600, status: 'paid', timestamp: '8:30 AM' },
  ],
}
