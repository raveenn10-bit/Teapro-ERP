import { useMemo, useState } from 'react'
import { Calculator, Printer } from 'lucide-react'
import { calculatePayroll, formatLkr } from '../../domain/calculations'
import type { PayrollInput } from '../../domain/types'
import './modules.css'

const empty: PayrollInput = { basePay: '', overtime: '', bonuses: '', incentives: '', advances: '', deductions: '' }

export function PayrollCalculatorPage() {
  const [input, setInput] = useState(empty)
  const result = useMemo(() => calculatePayroll(input), [input])
  const update = (key: keyof PayrollInput, value: string) => setInput((current) => ({ ...current, [key]: value }))

  return (
    <section className="module-page">
      <header className="module-header">
        <div><p className="module-eyebrow">Payroll workspace</p><h1>Payroll calculator</h1><p>Calculate a reviewed pay run using exact decimal arithmetic before posting it to the employee ledger.</p></div>
      </header>
      <div className="calculator-layout">
        <form className="module-card calculator-fields" onSubmit={(event) => event.preventDefault()}>
          <div className="module-card-title"><Calculator size={20} /><div><h2>Pay components</h2><p>Enter the approved values for this pay period.</p></div></div>
          {([
            ['basePay', 'Base pay'], ['overtime', 'Overtime'], ['bonuses', 'Bonuses'], ['incentives', 'Incentives'],
            ['advances', 'Advances recovered'], ['deductions', 'Other deductions'],
          ] as [keyof PayrollInput, string][]).map(([key, label]) => (
            <label className="module-field" key={key}><span>{label} (LKR)</span><input inputMode="decimal" value={input[key]} onChange={(event) => update(key, event.target.value)} placeholder="0.00" /></label>
          ))}
        </form>
        <aside className="module-card payroll-summary" aria-live="polite">
          <p className="module-eyebrow">Calculation preview</p><h2>Net salary</h2><strong>{formatLkr(result.netPay)}</strong>
          <dl><div><dt>Gross pay</dt><dd>{formatLkr(result.grossPay)}</dd></div><div><dt>Total deductions</dt><dd>− {formatLkr(result.totalDeductions)}</dd></div></dl>
          <p className="summary-note">This preview is not posted until an authorized payroll workflow confirms the employee and pay period.</p>
          <button className="module-primary" type="button" disabled><Printer size={17} /> Post & print payslip</button>
        </aside>
      </div>
    </section>
  )
}

