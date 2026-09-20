import clsx from 'clsx'
import styles from './Button.module.css'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Нужно прописать вариант кнопки в виде <Button variant="primary">Подробнее</Button>

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  children: ReactNode
  className?: string
}

export const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => (
  <button className={clsx(styles.button, styles[variant], className)} {...props}>
    {children}
  </button>
)
