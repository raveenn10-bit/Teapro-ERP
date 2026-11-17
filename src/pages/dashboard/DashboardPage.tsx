import {
  ArrowDownToLine,
  ArrowRight,
  Banknote,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Factory,
  Leaf,
  Plus,
  ReceiptText,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Button, Card, EmptyState } from '../../components/ui'
import { MetricCard } from './MetricCard'
import { emptyDashboardSnapshot, type DashboardSnapshot } from './types'

const money = (value: number, currency: string) => new Intl.NumberFormat('en-LK', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
const weight = (value: number) => `${new Intl.NumberFormat('en-LK', { maximumFractionDigits: 2 }).format(value)} kg`
const compactMoney = (value: number, currency: string) => new Intl.NumberFormat('en-LK', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value)

const statusTone = { paid: 'success', pending: 'warning', partial: 'info', void: 'neutral' } as const

export function DashboardPage({
  data = emptyDashboardSnapshot,
  loading = false,
  companyName = 'TeaPro ERP',
  operatorName = 'Administrator',
  dateLabel = new Intl.DateTimeFormat('en-LK', { dateStyle: 'full' }).format(new Date()),
  onNewCollection,
  onExport,
  onDateRange,
  onViewReports,
}: {
  data?: DashboardSnapshot
  loading?: boolean
  companyName?: string
  operatorName?: string
  dateLabel?: string
  onNewCollection?: () => void
  onExport?: () => void
  onDateRange?: () => void
  onViewReports?: () => void
}) {
  const metrics = [
    ['Today’s leaf collection', weight(data.todayCollectedKg), 'Net accepted weight', <Leaf size={19} />, 'green'],
    ['Estate harvest', weight(data.todayEstateHarvestKg), 'Recorded today', <TrendingUp size={19} />, 'lime'],
    ['Active suppliers', data.totalSuppliers.toLocaleString('en-LK'), 'Registered supplier accounts', <UsersRound size={19} />, 'blue'],
    ['Employees', data.totalEmployees.toLocaleString('en-LK'), 'Active employee records', <UserRoundCheck size={19} />, 'amber'],
    ['Leaf purchases', money(data.todayPurchases, data.currency), 'Posted today', <WalletCards size={19} />, 'green'],
    ['Today’s revenue', money(data.todayRevenue, data.currency), 'Posted income', <CircleDollarSign size={19} />, 'lime'],
    ['Today’s expenses', money(data.todayExpenses, data.currency), 'Posted expenses', <ReceiptText size={19} />, 'amber'],
    ['Net profit', money(data.netProfit, data.currency), 'For selected period', <Banknote size={19} />, 'blue'],
  ] as const

  return (
    <div className={`tp-dashboard ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
      <div className="tp-dashboard__intro">
        <div>
          <span className="tp-dashboard__date">{dateLabel}</span>
          <h1>Good day, {operatorName}</h1>
          <p>Here is the latest operational picture for <strong>{companyName}</strong>.</p>
        </div>
        <div className="tp-dashboard__actions">
          <Button variant="secondary" icon={<CalendarDays size={17} />} onClick={onDateRange}>Date range</Button>
          <Button variant="secondary" icon={<ArrowDownToLine size={17} />} onClick={onExport}>Export</Button>
          <Button icon={<Plus size={17} />} onClick={onNewCollection}>New collection</Button>
        </div>
      </div>

      <section className="tp-metric-grid" aria-label="Business overview">
        {metrics.map(([label, value, hint, icon, tone], index) => <MetricCard key={label} label={label} value={value} hint={hint} icon={icon} tone={tone} index={index} />)}
      </section>

      <section className="tp-dashboard__highlights" aria-label="Financial highlights">
        <div><span>Supplier payments outstanding</span><strong>{money(data.supplierOutstanding, data.currency)}</strong></div>
        <div><span>Factory payments outstanding</span><strong>{money(data.factoryOutstanding, data.currency)}</strong></div>
        <div><span>Monthly earnings</span><strong>{money(data.monthlyEarnings, data.currency)}</strong></div>
      </section>

      <div className="tp-dashboard__grid">
        <Card className="tp-dashboard__trend" title="Collection movement" description="Net collected and factory dispatched weight" action={<Button variant="ghost" size="sm" onClick={onViewReports}>Full report <ArrowRight size={15} /></Button>}>
          {data.collectionTrend.length ? (
            <div className="tp-chart" role="img" aria-label="Collection and dispatch trend chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.collectionTrend} margin={{ top: 8, right: 6, bottom: 0, left: -14 }}>
                  <defs>
                    <linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86BC49" stopOpacity={0.35} /><stop offset="1" stopColor="#86BC49" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--tp-border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--tp-text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--tp-text-muted)', fontSize: 11 }} />
                  <Tooltip formatter={(value) => weight(Number(value))} contentStyle={{ borderRadius: 12, borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="collected" name="Collected" stroke="#86BC49" strokeWidth={2.5} fill="url(#collectionFill)" />
                  <Area type="monotone" dataKey="dispatched" name="Dispatched" stroke="#14532D" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState icon={<Leaf size={24} />} title="No collection activity yet" description="Collection movement will appear after leaf bills are posted for this period." />}
        </Card>

        <Card title="Estate performance" description="Harvest weight for the selected period">
          {data.estatePerformance.length ? (
            <div className="tp-chart tp-chart--compact" role="img" aria-label="Estate performance chart">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={data.estatePerformance} layout="vertical" margin={{ left: 8, right: 6 }}>
                <CartesianGrid strokeDasharray="3 5" horizontal={false} stroke="var(--tp-border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--tp-text-muted)', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={74} axisLine={false} tickLine={false} tick={{ fill: 'var(--tp-text-muted)', fontSize: 10 }} />
                <Tooltip formatter={(value) => weight(Number(value))} contentStyle={{ borderRadius: 12, borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', fontSize: 12 }} />
                <Bar dataKey="weight" name="Harvest" fill="#86BC49" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart></ResponsiveContainer>
            </div>
          ) : <EmptyState icon={<Building2 size={24} />} title="No estate records" description="Estate performance becomes available after harvest entries are recorded." />}
        </Card>
      </div>

      <div className="tp-dashboard__grid tp-dashboard__grid--lower">
        <Card title="Recent transactions" description="Latest operational and financial postings" action={<Button variant="ghost" size="sm" onClick={onViewReports}>View all <ArrowRight size={15} /></Button>}>
          {data.recentTransactions.length ? <div className="tp-transactions" role="table" aria-label="Recent transactions">
            {data.recentTransactions.slice(0, 6).map((transaction) => <div className="tp-transaction" role="row" key={transaction.id}>
              <div className={`tp-transaction__icon tp-transaction__icon--${transaction.type}`} aria-hidden="true">{transaction.type === 'dispatch' ? <Factory size={17} /> : transaction.type === 'collection' ? <Leaf size={17} /> : <ReceiptText size={17} />}</div>
              <div className="tp-transaction__party"><strong>{transaction.party}</strong><small>{transaction.reference} · {transaction.timestamp}</small></div>
              <Badge tone={statusTone[transaction.status]}>{transaction.status}</Badge>
              <strong className="tp-transaction__amount">{money(transaction.amount, data.currency)}</strong>
            </div>)}
          </div> : <EmptyState icon={<ReceiptText size={24} />} title="No recent transactions" description="New collections, payments, expenses and dispatches will appear here." />}
        </Card>
        <Card title="Factory performance" description="Accepted dispatch weight by factory">
          {data.factoryPerformance.length ? <div className="tp-factory-list">{data.factoryPerformance.slice(0, 6).map((factory, index) => {
            const maximum = Math.max(...data.factoryPerformance.map((item) => item.weight), 1)
            return <div className="tp-factory" key={`${factory.name}-${index}`}>
              <div><span>{factory.name}</span><strong>{weight(factory.weight)}</strong></div>
              <div className="tp-factory__track"><i style={{ width: `${Math.max((factory.weight / maximum) * 100, 3)}%` }} /></div>
              {factory.variance !== undefined && <small className={factory.variance < 0 ? 'is-negative' : ''}>{factory.variance > 0 ? '+' : ''}{factory.variance.toFixed(2)}% variance</small>}
            </div>
          })}</div> : <EmptyState icon={<Factory size={24} />} title="No factory dispatches" description="Factory acceptance and variance data will appear after dispatch reconciliation." />}
        </Card>
      </div>
      <span className="tp-sr-only">Current monthly earnings: {compactMoney(data.monthlyEarnings, data.currency)}</span>
    </div>
  )
}
