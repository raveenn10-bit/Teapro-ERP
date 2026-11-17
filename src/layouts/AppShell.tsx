import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar, Topbar } from '../components/navigation'

export function AppShell({
  children,
  activeItem = 'dashboard',
  operatorName = 'Administrator',
  role = 'Super Administrator',
  onNavigate = () => undefined,
  onLock = () => undefined,
  demoMode = false,
}: {
  children: ReactNode
  activeItem?: string
  operatorName?: string
  role?: string
  onNavigate?: (id: string) => void
  onLock?: () => void
  demoMode?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('teapro-theme') === 'dark' ? 'dark' : 'light'))
  const [language, setLanguage] = useState<'en' | 'si'>(() => (localStorage.getItem('teapro-language') === 'si' ? 'si' : 'en'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('teapro-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('teapro-language', language)
  }, [language])

  return (
    <div className={`tp-shell ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <button className="tp-mobile-toggle" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => { setCollapsed(false); setMobileOpen(!mobileOpen) }}>{mobileOpen ? '✕' : '☰'}</button>
      {mobileOpen && <button className="tp-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <Sidebar collapsed={collapsed} activeItem={activeItem} onToggle={() => { setCollapsed((value) => !value); setMobileOpen(false) }} onNavigate={(id) => { onNavigate(id); setMobileOpen(false); window.scrollTo(0, 0) }} />
      <div className="tp-shell__body">
        {demoMode && <div className="tp-demo-banner"><strong>Interactive demo</strong><span>Sample data only · Desktop edition uses an encrypted local database</span></div>}
        <Topbar
          theme={theme}
          language={language}
          operatorName={operatorName}
          role={role}
          onThemeToggle={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}
          onLanguageToggle={() => setLanguage((value) => value === 'en' ? 'si' : 'en')}
          onLock={onLock}
        />
        <main className="tp-main" id="main-content">{children}</main>
      </div>
    </div>
  )
}
