import { useEffect, useMemo, useState } from 'react'
import { AppShell, DashboardPage, emptyDashboardSnapshot, type DashboardSnapshot } from './ui'
import { AuthScreen, type AuthUser } from './pages/auth'
import { GreenLeafPosPage } from './pages/pos'
import { AccountingPage, EmployeeManagementPage, EstateManagementPage, FactoryManagementPage, PayrollCalculatorPage, RateManagementPage, ReportsPage, RoutesTransportPage, SettingsPage, SupplierManagementPage } from './pages/modules'
import { calculateLeafCollection } from './lib/calculations'
import type { LeafInvoiceSnapshot } from './lib/printing'

type Session = { token: string; user: AuthUser; expiresAt?: string }
type EntityRecord = Record<string, unknown> & { id: string }

function App() {
  const [checking, setChecking] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [active, setActive] = useState('dashboard')
  const [dashboard, setDashboard] = useState<DashboardSnapshot>(emptyDashboardSnapshot)
  const [suppliers, setSuppliers] = useState<EntityRecord[]>([])
  const [estates, setEstates] = useState<EntityRecord[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!window.teaPro) { setInitialized(true); setChecking(false); return }
      const result = await window.teaPro.setup.status()
      if (!cancelled) { setInitialized(result.ok ? result.data.initialized : false); setChecking(false) }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!session || !window.teaPro) return
    sessionStorage.setItem('teapro.session', session.token)
    let cancelled = false
    void (async () => {
      const [snapshot, supplierRows, estateRows] = await Promise.all([
        window.teaPro!.dashboard.snapshot(session.token),
        window.teaPro!.entities.list<EntityRecord>(session.token, 'Supplier'),
        window.teaPro!.entities.list<EntityRecord>(session.token, 'Estate'),
      ])
      if (cancelled) return
      if (snapshot.ok) setDashboard(snapshot.data as DashboardSnapshot)
      if (supplierRows.ok) setSuppliers(supplierRows.data)
      if (estateRows.ok) setEstates(estateRows.data)
    })()
    return () => { cancelled = true }
  }, [session, active])

  const content = useMemo(() => {
    const operatorName = session?.user.displayName || session?.user.username || 'Administrator'
    switch (active) {
      case 'collections': return <GreenLeafPosPage operatorName={operatorName} suppliers={suppliers.map((row) => ({ id: row.id, code: String(row.supplierCode ?? ''), name: String(row.name ?? ''), phone: String(row.telephone ?? ''), defaultRate: String(row.ratePerKg ?? '') }))} estates={estates.map((row) => ({ id: row.id, name: String(row.name ?? '') }))} onSave={async (draft) => {
        if (!window.teaPro || !session) throw new Error('Secure desktop database is unavailable.')
        const totals = calculateLeafCollection(draft)
        const supplier = suppliers.find((row) => row.id === draft.supplierId)
        const estate = estates.find((row) => row.id === draft.estateId)
        const paymentStatus = Number(totals.outstandingAmount) <= 0 ? 'paid' : Number(totals.amountPaid) > 0 ? 'partial' : 'pending'
        const result = await window.teaPro.collections.save({ token: session.token, ...draft, ...totals, paymentStatus, idempotencyKey: `${draft.invoiceNumber}:${draft.supplierId}` })
        if (!result.ok) throw new Error(result.error)
        const saved = result.data as { id: string; savedAt: string }
        return { id: saved.id, invoiceNumber: draft.invoiceNumber, createdAt: saved.savedAt, savedAt: saved.savedAt, supplierId: draft.supplierId, supplierName: String(supplier?.name ?? ''), supplierPhone: String(supplier?.telephone ?? ''), estateName: String(estate?.name ?? ''), collectionLocation: draft.collectionLocation, operatorName, grossWeight: String(draft.grossWeight), bagWeight: String(draft.bagWeight), moistureDeduction: String(draft.moistureDeduction), otherWeightDeduction: String(draft.otherWeightDeduction), ratePerKg: String(draft.ratePerKg), allowances: String(draft.allowances), financialDeductions: String(draft.financialDeductions), paymentMethod: draft.paymentMethod, notes: draft.notes, totals, company: { name: 'TeaPro ERP', address: '', telephone: '', footer: 'Smart Tea. Smart Business.' } } satisfies LeafInvoiceSnapshot
      }} />
      case 'suppliers': return <SupplierManagementPage />
      case 'estates': return <EstateManagementPage />
      case 'employees': return <EmployeeManagementPage />
      case 'payroll': return <PayrollCalculatorPage />
      case 'factories': return <FactoryManagementPage />
      case 'transport': return <RoutesTransportPage />
      case 'rates': return <RateManagementPage />
      case 'accounts': return <AccountingPage />
      case 'reports': return <ReportsPage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage data={dashboard} operatorName={operatorName} companyName="TeaPro ERP" onNewCollection={() => setActive('collections')} onViewReports={() => setActive('reports')} />
    }
  }, [active, dashboard, estates, session, suppliers])

  if (checking) return <div className="app-loading" role="status">Opening secure workspace…</div>
  if (!session) return <AuthScreen initialized={initialized} onInitialized={() => setInitialized(true)} onAuthenticated={setSession} />
  return <AppShell activeItem={active} operatorName={session.user.displayName || session.user.username} role={session.user.role || 'User'} onNavigate={setActive} onLock={() => { sessionStorage.removeItem('teapro.session'); setSession(null) }}>{content}</AppShell>
}

export default App
