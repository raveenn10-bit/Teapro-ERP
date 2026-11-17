import { useState, type FormEvent } from 'react'
import { CheckCircle2, Eye, EyeOff, KeyRound, Leaf, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import '../../styles/auth.css'

export type AuthUser = {
  id?: string
  username: string
  displayName?: string
  role?: string
}

type AuthScreenProps = {
  initialized: boolean
  onAuthenticated: (session: { token: string; user: AuthUser; expiresAt?: string }) => void
  onInitialized: () => void
}

type SetupValues = {
  companyName: string
  address: string
  telephone: string
  registrationNo: string
  username: string
  displayName: string
  password: string
  confirmPassword: string
  defaultLanguage: 'en' | 'si'
}

const initialSetup: SetupValues = {
  companyName: '', address: '', telephone: '', registrationNo: '', username: '',
  displayName: '', password: '', confirmPassword: '', defaultLanguage: 'en',
}

function BrandPanel() {
  return (
    <aside className="auth-brand" aria-label="TeaPro ERP">
      <div className="auth-brand__overlay" />
      <div className="auth-brand__content">
        <div className="auth-brand__mark"><Leaf size={28} strokeWidth={2.3} /></div>
        <p className="auth-brand__eyebrow">Harsh Apex Digital Solutions</p>
        <h1>TeaPro ERP</h1>
        <p className="auth-brand__tagline">Smart Tea. Smart Business.</p>
        <div className="auth-brand__trust"><ShieldCheck size={18} /> Offline-first • Encrypted local data • Built for Sri Lanka</div>
      </div>
    </aside>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="auth-field"><span>{label}</span><input {...props} /></label>
}

export function AuthScreen({ initialized, onAuthenticated, onInitialized }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [setup, setSetup] = useState(initialSetup)
  const [login, setLogin] = useState({ username: '', password: '' })

  const desktopRequired = !window.teaPro

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!window.teaPro) return setError('Open TeaPro through the Windows desktop application.')
    setBusy(true)
    const result = await window.teaPro.auth.login(login.username.trim(), login.password)
    setBusy(false)
    if (!result.ok) return setError(result.error)
    onAuthenticated(result.data as { token: string; user: AuthUser; expiresAt?: string })
  }

  async function submitSetup(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (setup.password.length < 10) return setError('Administrator password must contain at least 10 characters.')
    if (setup.password !== setup.confirmPassword) return setError('Passwords do not match.')
    if (!window.teaPro) return setError('First-time setup is only available inside the desktop application.')
    setBusy(true)
    const result = await window.teaPro.setup.initialize({
      companyName: setup.companyName.trim(), address: setup.address.trim(), telephone: setup.telephone.trim(),
      registrationNo: setup.registrationNo.trim(), username: setup.username.trim(), displayName: setup.displayName.trim(),
      password: setup.password, defaultLanguage: setup.defaultLanguage,
    })
    setBusy(false)
    if (!result.ok) return setError(result.error)
    setRecoveryKey(result.data.recoveryKey)
  }

  if (recoveryKey) {
    return <main className="auth-layout"><BrandPanel /><section className="auth-form-panel"><div className="auth-card recovery-card">
      <div className="auth-icon auth-icon--success"><CheckCircle2 /></div>
      <p className="auth-kicker">Setup complete</p><h2>Save your recovery key</h2>
      <p className="auth-copy">This offline key is required to recover access. Store it away from this computer. TeaPro cannot recreate it later.</p>
      <div className="recovery-key"><KeyRound size={20} /><code>{recoveryKey}</code></div>
      <Button size="lg" onClick={onInitialized}>I have stored the recovery key</Button>
    </div></section></main>
  }

  return (
    <main className="auth-layout">
      <BrandPanel />
      <section className="auth-form-panel">
        <div className={`auth-card ${initialized ? '' : 'auth-card--wide'}`}>
          <div className="auth-icon"><LockKeyhole /></div>
          <p className="auth-kicker">{initialized ? 'Secure sign in' : 'First-time setup'}</p>
          <h2>{initialized ? 'Welcome back' : 'Configure your business'}</h2>
          <p className="auth-copy">{initialized ? 'Sign in to continue to your offline workspace.' : 'Create the first administrator account. Public registration remains disabled.'}</p>
          {desktopRequired && <div className="auth-notice">Browser mode is a visual preview. Secure setup and sign-in run only in the packaged desktop app.</div>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          {initialized ? (
            <form onSubmit={submitLogin} className="auth-form">
              <Field label="Username" autoComplete="username" required value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} />
              <label className="auth-field"><span>Password</span><div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              <Button size="lg" type="submit" disabled={busy || desktopRequired}>{busy ? 'Signing in…' : 'Sign in securely'}</Button>
            </form>
          ) : (
            <form onSubmit={submitSetup} className="auth-form auth-form--grid">
              <Field label="Company name" required value={setup.companyName} onChange={e => setSetup({ ...setup, companyName: e.target.value })} />
              <Field label="Telephone" required value={setup.telephone} onChange={e => setSetup({ ...setup, telephone: e.target.value })} />
              <Field label="Business registration" value={setup.registrationNo} onChange={e => setSetup({ ...setup, registrationNo: e.target.value })} />
              <Field label="Administrator display name" required value={setup.displayName} onChange={e => setSetup({ ...setup, displayName: e.target.value })} />
              <label className="auth-field auth-field--full"><span>Business address</span><input required value={setup.address} onChange={e => setSetup({ ...setup, address: e.target.value })} /></label>
              <Field label="Administrator username" autoComplete="username" required value={setup.username} onChange={e => setSetup({ ...setup, username: e.target.value })} />
              <label className="auth-field"><span>Default language</span><select value={setup.defaultLanguage} onChange={e => setSetup({ ...setup, defaultLanguage: e.target.value as 'en' | 'si' })}><option value="en">English</option><option value="si">සිංහල</option></select></label>
              <Field label="Administrator password" type="password" autoComplete="new-password" minLength={10} required value={setup.password} onChange={e => setSetup({ ...setup, password: e.target.value })} />
              <Field label="Confirm password" type="password" autoComplete="new-password" minLength={10} required value={setup.confirmPassword} onChange={e => setSetup({ ...setup, confirmPassword: e.target.value })} />
              <div className="auth-field--full"><Button size="lg" type="submit" disabled={busy || desktopRequired}>{busy ? 'Creating secure workspace…' : 'Create administrator & initialize'}</Button></div>
            </form>
          )}
          <p className="auth-footer">Data stays on this computer • Asia/Colombo • LKR</p>
        </div>
      </section>
    </main>
  )
}
