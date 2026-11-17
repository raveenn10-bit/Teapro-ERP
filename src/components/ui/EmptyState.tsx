import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="tp-empty">
    <div>
      <div className="tp-empty__icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  </div>
}
