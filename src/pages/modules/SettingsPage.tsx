import { useState } from 'react'
import { Building2, Check, DatabaseBackup, Languages, Printer, Save, ShieldCheck } from 'lucide-react'
import './modules.css'

const sections = [
  { id: 'company', name: 'Company profile', icon: Building2 }, { id: 'regional', name: 'Language & formats', icon: Languages },
  { id: 'printing', name: 'Printing', icon: Printer }, { id: 'security', name: 'Security', icon: ShieldCheck }, { id: 'backup', name: 'Backup', icon: DatabaseBackup },
]

export function SettingsPage() {
  const [active, setActive] = useState('company')
  const [saved, setSaved] = useState(false)
  return <section className="module-page">
    <header className="module-header"><div><p className="module-eyebrow">Administration</p><h1>Business settings</h1><p>Configure local company, regional, printing, security and backup defaults.</p></div></header>
    <div className="settings-layout">
      <nav className="module-card settings-nav" aria-label="Settings sections">{sections.map(({ id, name, icon: Icon }) => <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => { setActive(id); setSaved(false) }}><Icon size={18} />{name}</button>)}</nav>
      <form className="module-card settings-form" onSubmit={(event) => { event.preventDefault(); setSaved(true) }}>
        <div className="module-card-title"><div><p className="module-eyebrow">{active}</p><h2>{sections.find((item) => item.id === active)?.name}</h2></div></div>
        {active === 'company' && <><label className="module-field"><span>Company name</span><input required placeholder="Your tea business" /></label><label className="module-field"><span>Telephone</span><input type="tel" /></label><label className="module-field module-field-wide"><span>Address</span><textarea rows={3} /></label><label className="module-field"><span>Business registration number</span><input /></label></>}
        {active === 'regional' && <><label className="module-field"><span>Default language</span><select defaultValue="en"><option value="en">English</option><option value="si">සිංහල</option></select></label><label className="module-field"><span>Timezone</span><input value="Asia/Colombo" readOnly /></label><label className="module-field"><span>Currency</span><input value="LKR — Sri Lankan Rupee" readOnly /></label><label className="module-field"><span>Date format</span><select defaultValue="dd/MM/yyyy"><option>dd/MM/yyyy</option><option>yyyy-MM-dd</option></select></label></>}
        {active === 'printing' && <><label className="module-field"><span>58mm default printer</span><select><option>Choose Windows printer…</option></select></label><label className="module-field"><span>80mm default printer</span><select><option>Choose Windows printer…</option></select></label><label className="module-field"><span>A4 default printer</span><select><option>Choose Windows printer…</option></select></label><label className="module-field"><span>Receipt language</span><select><option>English</option><option>සිංහල</option><option>Bilingual</option></select></label></>}
        {active === 'security' && <><label className="module-field"><span>Session timeout (minutes)</span><input type="number" min="1" defaultValue="15" /></label><label className="module-field"><span>Failed attempts before lockout</span><input type="number" min="3" defaultValue="5" /></label><p className="settings-copy module-field-wide">Sensitive changes require administrator re-authentication. Database encryption keys are never displayed in this screen.</p></>}
        {active === 'backup' && <><label className="module-field module-field-wide"><span>Backup directory</span><input placeholder="Choose a local, USB or external drive folder" /></label><label className="module-field"><span>Automatic backup time</span><input type="time" defaultValue="18:00" /></label><label className="module-field"><span>Retention</span><select defaultValue="30"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label></>}
        {saved && <p className="save-success" role="status"><Check size={17} /> Settings validated and saved locally.</p>}
        <div className="module-actions"><button type="submit" className="module-primary"><Save size={17} /> Save changes</button></div>
      </form>
    </div>
  </section>
}

