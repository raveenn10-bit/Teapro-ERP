import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconOnly?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'tp-button',
    `tp-button--${variant}`,
    size !== 'md' ? `tp-button--${size}` : '',
    iconOnly ? 'tp-button--icon' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button type={type} className={classes} {...props}>{icon}{children}</button>
}
