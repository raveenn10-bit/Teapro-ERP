import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  padded?: boolean
}

export function Card({ title, description, action, padded = true, className = '', children, ...props }: CardProps) {
  return (
    <section className={`tp-card ${padded ? 'tp-card--padded' : ''} ${className}`} {...props}>
      {(title || description || action) && (
        <header className="tp-card__header">
          <div>
            {title && <h2 className="tp-card__title">{title}</h2>}
            {description && <p className="tp-card__description">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
