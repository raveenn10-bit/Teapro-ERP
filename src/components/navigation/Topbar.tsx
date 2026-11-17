import { Bell, ChevronDown, Languages, LockKeyhole, Moon, Search, Sun } from 'lucide-react'
import { Button } from '../ui/Button'

export function Topbar({
  theme,
  language,
  operatorName,
  role,
  onThemeToggle,
  onLanguageToggle,
  onLock,
  onSearch,
}: {
  theme: 'light' | 'dark'
  language: 'en' | 'si'
  operatorName: string
  role: string
  onThemeToggle: () => void
  onLanguageToggle: () => void
  onLock: () => void
  onSearch?: (value: string) => void
}) {
  return (
    <header className="tp-topbar">
      <label className="tp-topbar__search">
        <Search size={18} aria-hidden="true" />
        <span className="tp-sr-only">Search</span>
        <input placeholder={language === 'si' ? 'සොයන්න…' : 'Search suppliers, bills, employees…'} onChange={(event) => onSearch?.(event.target.value)} />
        <kbd>Ctrl K</kbd>
      </label>
      <div className="tp-topbar__actions">
        <Button variant="ghost" iconOnly aria-label="Change language" title="Change language" icon={<Languages size={19} />} onClick={onLanguageToggle} />
        <span className="tp-topbar__locale">{language === 'en' ? 'EN' : 'සිං'}</span>
        <Button variant="ghost" iconOnly aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} icon={theme === 'light' ? <Moon size={19} /> : <Sun size={19} />} onClick={onThemeToggle} />
        <Button variant="ghost" iconOnly aria-label="Notifications" icon={<Bell size={19} />} />
        <Button variant="ghost" iconOnly aria-label="Lock application" icon={<LockKeyhole size={18} />} onClick={onLock} />
        <button className="tp-user-menu" aria-label="Open user menu">
          <span className="tp-user-menu__avatar" aria-hidden="true">{operatorName.charAt(0).toUpperCase()}</span>
          <span className="tp-user-menu__copy"><strong>{operatorName}</strong><small>{role}</small></span>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  )
}
