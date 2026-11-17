import {
  BarChart3,
  BookOpenCheck,
  Building2,
  Calculator,
  ChevronLeft,
  CircleDollarSign,
  Factory,
  Gauge,
  Leaf,
  MapPinned,
  PackageSearch,
  ReceiptText,
  Settings2,
  Truck,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { ComponentType } from 'react'
import { TeaProMark } from '../brand/TeaProMark'

export type NavigationItem = {
  id: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

export const defaultNavigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'collections', label: 'Leaf Collection', icon: Leaf },
  { id: 'suppliers', label: 'Suppliers', icon: UsersRound },
  { id: 'estates', label: 'Tea Estates', icon: MapPinned },
  { id: 'employees', label: 'Employees & Payroll', icon: WalletCards },
  { id: 'factories', label: 'Factories', icon: Factory },
  { id: 'transport', label: 'Routes & Transport', icon: Truck },
  { id: 'rates', label: 'Rate Management', icon: CircleDollarSign },
  { id: 'accounts', label: 'Accounting', icon: Calculator },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'imports', label: 'Data Migration', icon: PackageSearch },
]

export function Sidebar({
  collapsed,
  activeItem,
  navigation = defaultNavigation,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean
  activeItem: string
  navigation?: NavigationItem[]
  onToggle: () => void
  onNavigate: (id: string) => void
}) {
  return (
    <motion.aside
      className="tp-sidebar"
      animate={{ width: collapsed ? 'var(--tp-sidebar-collapsed)' : 'var(--tp-sidebar-width)' }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      aria-label="Primary navigation"
    >
      <div className="tp-sidebar__brand">
        <TeaProMark size={40} />
        {!collapsed && <div className="tp-sidebar__brand-copy"><strong>TeaPro</strong><span>Smart Tea. Smart Business.</span></div>}
      </div>
      <nav className="tp-sidebar__nav">
        <span className={collapsed ? 'tp-sr-only' : 'tp-sidebar__eyebrow'}>Workspace</span>
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tp-sidebar__item ${activeItem === id ? 'is-active' : ''}`}
            aria-current={activeItem === id ? 'page' : undefined}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} strokeWidth={activeItem === id ? 2.4 : 1.9} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>
      <div className="tp-sidebar__footer">
        <button className="tp-sidebar__item" aria-label={collapsed ? 'Settings' : undefined} title={collapsed ? 'Settings' : undefined} onClick={() => onNavigate('settings')}>
          <Settings2 size={19} /><span hidden={collapsed}>Settings</span>
        </button>
        <button className="tp-sidebar__item" aria-label={collapsed ? 'User manual' : undefined} title={collapsed ? 'User manual' : undefined} onClick={() => onNavigate('help')}>
          <BookOpenCheck size={19} /><span hidden={collapsed}>User Manual</span>
        </button>
        <button className="tp-sidebar__collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronLeft size={17} className={collapsed ? 'is-reversed' : ''} />
          {!collapsed && <span>Collapse menu</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export const navigationIconSet = { Building2, ReceiptText }
