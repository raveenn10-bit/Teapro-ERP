import type { HTMLAttributes } from 'react'

export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'success' | 'warning' | 'info' | 'neutral' }) {
  const { tone = 'neutral', ...rest } = props
  return <span className={`tp-badge tp-badge--${tone} ${className}`} {...rest} />
}
