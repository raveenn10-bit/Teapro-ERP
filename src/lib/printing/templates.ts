import { formatLkr } from '../calculations/leafCollection'
import type { LeafInvoiceSnapshot, PrintOptions } from './types'

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;')

const label = (en: string, si: string, language: PrintOptions['language']) => {
  if (language === 'si') return si
  if (language === 'bilingual') return `${en} / ${si}`
  return en
}

const row = (name: string, value: string, strong = false) => `<tr class="${strong ? 'strong' : ''}"><th>${name}</th><td>${escapeHtml(value)}</td></tr>`

export function createLeafInvoiceHtml(invoice: LeafInvoiceSnapshot, options: PrintOptions) {
  const thermal = options.format !== 'a4'
  const width = options.format === '58mm' ? '48mm' : options.format === '80mm' ? '72mm' : '190mm'
  const page = options.format === 'a4' ? 'A4' : `${options.format} auto`
  const locale = options.language === 'si' ? 'si-LK' : 'en-LK'
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' })
    .format(new Date(invoice.createdAt))
  const l = (en: string, si: string) => label(en, si, options.language)
  const logo = invoice.company.logoDataUrl
    ? `<img class="logo" src="${escapeHtml(invoice.company.logoDataUrl)}" alt="" />`
    : `<div class="mark">TP</div>`
  const qr = options.showQrReference ? `<div class="reference">${l('Reference', 'යොමුව')}: ${escapeHtml(invoice.invoiceNumber)}</div>` : ''

  return `<!doctype html><html lang="${options.language === 'si' ? 'si' : 'en'}"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
  @page{size:${page};margin:${options.marginMm ?? (thermal ? 2 : 10)}mm}*{box-sizing:border-box}
  body{margin:0;background:#fff;color:#14251d;font-family:"Noto Sans Sinhala","Noto Sans",Arial,sans-serif;font-size:${thermal ? 10 : 11}pt;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .sheet{width:${width};max-width:100%;margin:0 auto;padding:${thermal ? '1mm' : '8mm'};font-size:${options.fontScale ?? 1}em}
  header{text-align:center;border-bottom:${thermal ? '1px dashed #65756b' : '3px solid #14532d'};padding-bottom:10px;margin-bottom:10px}.logo{display:block;max-width:${thermal ? '22mm' : '38mm'};max-height:${thermal ? '16mm' : '22mm'};object-fit:contain;margin:0 auto 5px}.mark{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;margin:0 auto 5px;background:#14532d;color:#fff;font-weight:800}.company{font-weight:800;font-size:1.18em}.muted{color:#53645a;font-size:.85em}.title{font-size:${thermal ? '1.05em' : '1.5em'};font-weight:800;margin:10px 0 4px;color:#14532d}
  .meta{display:grid;grid-template-columns:${thermal ? '1fr' : 'repeat(2,1fr)'};gap:4px 18px;margin:10px 0}.meta div{display:flex;justify-content:space-between;gap:8px}.meta span:first-child{color:#53645a}.meta b{text-align:right}
  table{width:100%;border-collapse:collapse;margin:8px 0}th,td{padding:${thermal ? '4px 0' : '7px 8px'};border-bottom:1px solid #dce4de;text-align:left}td{text-align:right;font-variant-numeric:tabular-nums}.strong th,.strong td{font-size:1.12em;font-weight:800;border-top:2px solid #14532d;color:#14532d}.status{text-transform:uppercase;font-weight:800;letter-spacing:.04em}.notes{padding:8px;background:#f5f7f2;border-radius:6px;margin-top:10px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:52px}.signature{border-top:1px solid #14251d;text-align:center;padding-top:5px}.footer{text-align:center;margin-top:14px;padding-top:8px;border-top:1px dashed #65756b;font-size:.78em}.reference{font-family:monospace;overflow-wrap:anywhere;margin-top:8px}@media print{.sheet{margin:0}.no-print{display:none}}
  </style></head><body><main class="sheet"><header>${logo}<div class="company">${escapeHtml(invoice.company.name)}</div><div class="muted">${escapeHtml(invoice.company.address)}</div><div class="muted">${escapeHtml(invoice.company.telephone)}</div><div class="title">${l('GREEN LEAF COLLECTION', 'අමු තේ දළු එකතු කිරීම')}</div></header>
  <section class="meta"><div><span>${l('Bill No.', 'බිල් අංකය')}</span><b>${escapeHtml(invoice.invoiceNumber)}</b></div><div><span>${l('Date', 'දිනය')}</span><b>${escapeHtml(date)}</b></div><div><span>${l('Supplier', 'සැපයුම්කරු')}</span><b>${escapeHtml(invoice.supplierName)}</b></div><div><span>${l('Estate', 'වත්ත')}</span><b>${escapeHtml(invoice.estateName || '—')}</b></div></section>
  <table><tbody>
  ${row(l('Gross weight', 'දළ බර'), `${invoice.grossWeight} kg`)}${row(l('Bag weight', 'බෑග් බර'), `-${invoice.bagWeight} kg`)}${row(l('Moisture deduction', 'තෙතමනය අඩු කිරීම'), `-${invoice.moistureDeduction} kg`)}${row(l('Other deductions', 'අනෙකුත් අඩු කිරීම්'), `-${invoice.otherWeightDeduction} kg`)}${row(l('Net weight', 'ශුද්ධ බර'), `${invoice.totals.netWeight} kg`, true)}${row(l('Rate / kg', 'කිලෝවක මිල'), formatLkr(invoice.ratePerKg, locale))}${row(l('Leaf value', 'දළු වටිනාකම'), formatLkr(invoice.totals.totalAmount, locale))}${row(l('Allowances', 'දීමනා'), formatLkr(invoice.allowances, locale))}${row(l('Financial deductions', 'මූල්‍ය අඩු කිරීම්'), `-${formatLkr(invoice.financialDeductions, locale)}`)}${row(l('Final payable', 'අවසන් ගෙවීම'), formatLkr(invoice.totals.finalPayable, locale), true)}${row(l('Paid', 'ගෙවූ මුදල'), formatLkr(invoice.totals.amountPaid, locale))}${row(l('Outstanding', 'හිඟ මුදල'), formatLkr(invoice.totals.outstandingAmount, locale))}
  </tbody></table><div class="meta"><div><span>${l('Payment', 'ගෙවීම')}</span><b>${escapeHtml(invoice.paymentMethod)}</b></div><div><span>${l('Status', 'තත්ත්වය')}</span><b class="status">${escapeHtml(invoice.totals.paymentStatus)}</b></div><div><span>${l('Operator', 'ක්‍රියාකරු')}</span><b>${escapeHtml(invoice.operatorName)}</b></div></div>
  ${invoice.notes ? `<div class="notes"><b>${l('Notes', 'සටහන්')}:</b> ${escapeHtml(invoice.notes)}</div>` : ''}
  ${options.showSignature && !thermal ? `<div class="signatures"><div class="signature">${l('Supplier signature', 'සැපයුම්කරුගේ අත්සන')}</div><div class="signature">${l('Authorized signature', 'බලයලත් අත්සන')}</div></div>` : ''}
  <footer class="footer">${escapeHtml(invoice.company.footer || 'TeaPro ERP · Smart Tea. Smart Business.')} ${qr}</footer></main></body></html>`
}
