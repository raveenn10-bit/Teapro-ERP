import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, CheckCircle2, Leaf, Printer, RotateCcw, Save, Scale, Search, TriangleAlert } from 'lucide-react'
import {
  calculateLeafCollection,
  createInvoiceNumber,
  formatLkr,
  type LeafCollectionInput,
  type PaymentMethod,
} from '../../lib/calculations/leafCollection'
import { saveThenPrint } from '../../lib/printing/printService'
import type { LeafInvoiceSnapshot, PrintOptions } from '../../lib/printing/types'

export interface PosSupplier { id: string; code: string; name: string; phone?: string; defaultRate?: string }
export interface PosEstate { id: string; name: string }

interface Draft extends LeafCollectionInput {
  supplierId: string
  estateId: string
  collectionLocation: string
  paymentMethod: PaymentMethod
  notes: string
}

export interface GreenLeafPosPageProps {
  suppliers?: PosSupplier[]
  estates?: PosEstate[]
  nextSequence?: number
  operatorName?: string
  onSave?: (draft: Draft & { invoiceNumber: string; operatorName: string }) => Promise<LeafInvoiceSnapshot>
}

const blankDraft = (): Draft => ({
  supplierId: '', estateId: '', collectionLocation: '', grossWeight: '', bagWeight: '0',
  moistureDeduction: '0', otherWeightDeduction: '0', ratePerKg: '', allowances: '0',
  financialDeductions: '0', amountPaid: '0', paymentMethod: 'cash', notes: '',
})

const fieldClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#86BC49] focus:ring-4 focus:ring-[#86BC49]/15 dark:border-white/10 dark:bg-white/5 dark:text-white'

function NumberField({ label, value, onChange, suffix = 'kg', autoFocus = false }: {
  label: string; value: string | number; onChange: (value: string) => void; suffix?: string; autoFocus?: boolean
}) {
  return <label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
    {label}<div className="relative"><input autoFocus={autoFocus} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)}
      className={`${fieldClass} pr-12 text-right font-mono text-base`} placeholder="0.00" aria-label={label} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">{suffix}</span></div>
  </label>
}

export default function GreenLeafPosPage({ suppliers = [], estates = [], nextSequence = 1, operatorName = 'Current user', onSave }: GreenLeafPosPageProps) {
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [supplierQuery, setSupplierQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [lastSaved, setLastSaved] = useState<LeafInvoiceSnapshot | null>(null)
  const invoiceNumber = useMemo(() => createInvoiceNumber(nextSequence), [nextSequence])
  const grossWeightRef = useRef<HTMLInputElement | null>(null)

  const filteredSuppliers = suppliers.filter((supplier) => `${supplier.code} ${supplier.name} ${supplier.phone ?? ''}`.toLowerCase().includes(supplierQuery.toLowerCase())).slice(0, 8)
  const calculation = useMemo(() => {
    try { return { totals: calculateLeafCollection(draft), error: '' } }
    catch (error) { return { totals: null, error: error instanceof Error ? error.message : 'Invalid calculation' } }
  }, [draft])

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const selectSupplier = (supplier: PosSupplier) => {
    setDraft((current) => ({ ...current, supplierId: supplier.id, ratePerKg: supplier.defaultRate || current.ratePerKg }))
    setSupplierQuery(`${supplier.code} — ${supplier.name}`)
    grossWeightRef.current?.focus()
  }

  const save = async () => {
    if (!draft.supplierId) throw new Error('Select a supplier before saving.')
    if (!calculation.totals) throw new Error(calculation.error)
    if (!onSave) throw new Error('Desktop database service is unavailable. Open TeaPro ERP desktop application.')
    return onSave({ ...draft, invoiceNumber, operatorName })
  }

  const complete = async (printOptions?: PrintOptions) => {
    setStatus('saving'); setMessage('Saving transaction securely…')
    try {
      let saved: LeafInvoiceSnapshot
      if (printOptions) {
        const result = await saveThenPrint({ ...draft, invoiceNumber }, () => save(), printOptions)
        saved = result.savedInvoice
        setMessage(result.printResult.success ? 'Transaction saved and sent to printer.' : `Saved safely. Printing failed: ${result.printResult.error}`)
      } else {
        saved = await save()
        setMessage('Transaction saved successfully.')
      }
      setLastSaved(saved); setStatus('saved')
    } catch (error) {
      setStatus('error'); setMessage(error instanceof Error ? error.message : 'Unable to save transaction.')
    }
  }

  const reset = () => { setDraft(blankDraft()); setSupplierQuery(''); setLastSaved(null); setStatus('idle'); setMessage('') }

  return <section className="min-h-full bg-[#F5F7F2] p-4 text-slate-900 dark:bg-[#0d1712] dark:text-white lg:p-6" aria-labelledby="pos-title">
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#14532D] text-white shadow-lg shadow-green-950/15"><Leaf size={22} /></div>
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#5b7d35]">Collection desk</p><h1 id="pos-title" className="text-2xl font-black tracking-tight">Green Leaf POS</h1></div></div>
        <div className="flex items-center gap-2 rounded-xl border border-green-900/10 bg-white px-4 py-2 dark:border-white/10 dark:bg-white/5"><span className="text-xs text-slate-500">Invoice</span><b className="font-mono text-sm text-[#14532D] dark:text-[#a4d66a]">{invoiceNumber}</b></div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.55fr)]">
        <div className="space-y-5">
          <article className="rounded-3xl border border-green-950/10 bg-white p-5 shadow-[0_18px_50px_rgba(20,83,45,.06)] dark:border-white/10 dark:bg-white/[.045]">
            <div className="mb-4 flex items-center gap-2"><Search size={18} className="text-[#5f8e31]"/><h2 className="font-extrabold">Supplier & collection</h2></div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="relative"><label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Supplier
                <input className={fieldClass} value={supplierQuery} onChange={(event) => { setSupplierQuery(event.target.value); update('supplierId', '') }} placeholder="Search ID, name or phone…" />
              </label>{supplierQuery && !draft.supplierId && <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#14251D]">
                {filteredSuppliers.length ? filteredSuppliers.map((supplier) => <button key={supplier.id} type="button" onClick={() => selectSupplier(supplier)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-[#86BC49]/10"><span><b className="block text-sm">{supplier.name}</b><small className="text-slate-500">{supplier.code} · {supplier.phone || 'No phone'}</small></span><span className="text-xs font-bold text-[#5f8e31]">{supplier.defaultRate ? `Rs. ${supplier.defaultRate}` : ''}</span></button>) : <p className="p-3 text-sm text-slate-500">No matching suppliers</p>}
              </div>}</div>
              <label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Estate<select className={fieldClass} value={draft.estateId} onChange={(event) => update('estateId', event.target.value)}><option value="">Select estate</option>{estates.map((estate) => <option key={estate.id} value={estate.id}>{estate.name}</option>)}</select></label>
              <label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500 lg:col-span-2">Collection location<input className={fieldClass} value={draft.collectionLocation} onChange={(event) => update('collectionLocation', event.target.value)} placeholder="Route or collection centre" /></label>
            </div>
          </article>

          <article className="rounded-3xl border border-green-950/10 bg-white p-5 shadow-[0_18px_50px_rgba(20,83,45,.06)] dark:border-white/10 dark:bg-white/[.045]">
            <div className="mb-4 flex items-center gap-2"><Scale size={18} className="text-[#5f8e31]"/><h2 className="font-extrabold">Weight & pricing</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Gross weight<div className="relative"><input ref={grossWeightRef} inputMode="decimal" value={draft.grossWeight} onChange={(event) => update('grossWeight', event.target.value)} className={`${fieldClass} pr-12 text-right font-mono text-base`} placeholder="0.000"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span></div></label>
              <NumberField label="Bag weight" value={draft.bagWeight} onChange={(value) => update('bagWeight', value)} />
              <NumberField label="Moisture deduction" value={draft.moistureDeduction} onChange={(value) => update('moistureDeduction', value)} />
              <NumberField label="Other deduction" value={draft.otherWeightDeduction} onChange={(value) => update('otherWeightDeduction', value)} />
              <NumberField label="Rate per kg" value={draft.ratePerKg} onChange={(value) => update('ratePerKg', value)} suffix="LKR" />
              <NumberField label="Allowances" value={draft.allowances} onChange={(value) => update('allowances', value)} suffix="LKR" />
              <NumberField label="Financial deductions" value={draft.financialDeductions} onChange={(value) => update('financialDeductions', value)} suffix="LKR" />
              <NumberField label="Amount paid" value={draft.amountPaid} onChange={(value) => update('amountPaid', value)} suffix="LKR" />
            </div>
          </article>

          <article className="rounded-3xl border border-green-950/10 bg-white p-5 dark:border-white/10 dark:bg-white/[.045]">
            <div className="grid gap-4 lg:grid-cols-3"><label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Payment method<select className={fieldClass} value={draft.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value as PaymentMethod)}><option value="cash">Cash</option><option value="bank">Bank</option><option value="credit">Credit / pending</option></select></label>
              <label className="grid gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500 lg:col-span-2">Notes<input className={fieldClass} value={draft.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Optional internal note" /></label></div>
          </article>
        </div>

        <aside className="xl:sticky xl:top-5 xl:self-start">
          <div className="overflow-hidden rounded-3xl bg-[#14251D] text-white shadow-2xl shadow-green-950/20"><div className="border-b border-white/10 p-5"><div className="flex items-center justify-between"><span className="text-sm font-bold text-white/65">Live calculation</span><Banknote size={20} className="text-[#a9dd70]"/></div><p className="mt-4 text-3xl font-black tracking-tight">{formatLkr(calculation.totals?.finalPayable || 0)}</p><p className="mt-1 text-xs text-white/55">Final supplier payable</p></div>
            <dl className="space-y-3 p-5 text-sm">{[
              ['Gross weight', `${draft.grossWeight || '0.000'} kg`], ['Total deductions', `${calculation.totals?.approvedWeightDeductions || '0.000'} kg`],
              ['Net weight', `${calculation.totals?.netWeight || '0.000'} kg`], ['Leaf value', formatLkr(calculation.totals?.totalAmount || 0)],
              ['Paid now', formatLkr(calculation.totals?.amountPaid || 0)], ['Outstanding', formatLkr(calculation.totals?.outstandingAmount || 0)],
            ].map(([name, value], index) => <div key={name} className={`flex items-center justify-between gap-4 ${index === 2 ? 'border-y border-white/10 py-3 font-bold text-[#b9e788]' : ''}`}><dt className="text-white/60">{name}</dt><dd className="font-mono font-bold">{value}</dd></div>)}</dl>
            {calculation.error && <div className="mx-5 mb-4 flex gap-2 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-200"><TriangleAlert size={16} className="shrink-0" />{calculation.error}</div>}
            <div className="grid gap-2 border-t border-white/10 p-5"><button type="button" disabled={status === 'saving' || !calculation.totals} onClick={() => void complete()} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#86BC49] font-black text-[#14251D] transition hover:bg-[#a0d363] disabled:cursor-not-allowed disabled:opacity-50"><Save size={18}/>{status === 'saving' ? 'Saving…' : 'Save transaction'}</button>
              <div className="grid grid-cols-2 gap-2"><button type="button" disabled={status === 'saving' || !calculation.totals} onClick={() => void complete({ format: '58mm', language: 'bilingual', copies: 1, silent: false })} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold hover:bg-white/10"><Printer size={16}/>58mm</button><button type="button" disabled={status === 'saving' || !calculation.totals} onClick={() => void complete({ format: '80mm', language: 'bilingual', copies: 1, silent: false })} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold hover:bg-white/10"><Printer size={16}/>80mm</button></div>
              <button type="button" disabled={status === 'saving' || !calculation.totals} onClick={() => void complete({ format: 'a4', language: 'bilingual', copies: 1, silent: false, showSignature: true })} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-bold hover:bg-white/10"><Printer size={16}/>Save & print A4 invoice</button>
              <button type="button" onClick={reset} className="flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold text-white/55 hover:bg-white/5 hover:text-white"><RotateCcw size={15}/>New transaction</button></div>
          </div>
          <AnimatePresence>{status !== 'idle' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className={`mt-3 flex items-start gap-2 rounded-2xl border p-3 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'}`}>{status === 'error' ? <TriangleAlert size={18}/> : <CheckCircle2 size={18}/>}<span>{message}{lastSaved && <small className="mt-1 block opacity-70">Saved reference: {lastSaved.invoiceNumber}</small>}</span></motion.div>}</AnimatePresence>
          <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-slate-500">Transaction commits to the local database before any print job starts. A printer failure will never duplicate or discard the bill.</p>
        </aside>
      </div>
    </div>
  </section>
}
