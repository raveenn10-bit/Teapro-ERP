import { useMemo, useState } from 'react'
import { CalendarRange, Download, FileBarChart2 } from 'lucide-react'
import { validateDateRange } from '../../domain/validation'
import './modules.css'

const reports = [
  ['daily-collection', 'Daily collection', 'Green leaf purchases grouped by collection date and operator.'],
  ['estate-production', 'Estate production', 'Yield by estate, division and harvesting team.'],
  ['supplier-statement', 'Supplier statement', 'Collections, advances, deductions, payments and balance.'],
  ['factory-dispatch', 'Factory dispatch', 'Dispatched, accepted and discrepancy weights by factory.'],
  ['outstanding-payments', 'Outstanding payments', 'Supplier payables and factory receivables awaiting settlement.'],
  ['profit-loss', 'Profit & loss', 'Posted income and expenses for the selected period.'],
  ['payroll', 'Payroll', 'Gross wages, deductions and net salary by employee.'],
  ['audit', 'Transaction audit', 'Corrections, voids and sensitive actions with user attribution.'],
]

export function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [selected, setSelected] = useState(reports[0][0])
  const error = useMemo(() => validateDateRange(from, to), [from, to])
  const current = reports.find(([id]) => id === selected) ?? reports[0]

  return <section className="module-page">
    <header className="module-header"><div><p className="module-eyebrow">Insights & compliance</p><h1>Reports & analytics</h1><p>Generate traceable operational and financial reports from posted local records.</p></div></header>
    <div className="reports-layout">
      <nav className="module-card report-list" aria-label="Report types">
        {reports.map(([id, name, description]) => <button key={id} type="button" className={selected === id ? 'report-item active' : 'report-item'} onClick={() => setSelected(id)}><FileBarChart2 size={18} /><span><b>{name}</b><small>{description}</small></span></button>)}
      </nav>
      <div className="module-card report-workspace">
        <div className="module-card-title"><CalendarRange size={20} /><div><h2>{current[1]}</h2><p>{current[2]}</p></div></div>
        <div className="report-filters">
          <label className="module-field"><span>From date</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="module-field"><span>To date</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        </div>
        {error ? <p className="module-error" role="alert">{error}</p> : <div className="report-empty"><FileBarChart2 size={34} /><h3>Ready to generate</h3><p>The report will use posted records between {from} and {to}. Empty periods remain empty; TeaPro does not invent missing data.</p></div>}
        <div className="module-actions"><button className="module-secondary" type="button" disabled={Boolean(error)}><Download size={17} /> Excel</button><button className="module-primary" type="button" disabled={Boolean(error)}>Generate report</button></div>
      </div>
    </div>
  </section>
}

