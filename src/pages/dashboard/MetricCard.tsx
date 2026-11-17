import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function MetricCard({ label, value, hint, icon, tone = 'green', index = 0 }: { label: string; value: string; hint?: string; icon: ReactNode; tone?: 'green' | 'lime' | 'blue' | 'amber'; index?: number }) {
  return (
    <motion.article
      className={`tp-metric tp-metric--${tone}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.2) }}
    >
      <div className="tp-metric__head"><span>{label}</span><span className="tp-metric__icon" aria-hidden="true">{icon}</span></div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </motion.article>
  )
}
