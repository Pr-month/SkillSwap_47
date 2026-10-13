import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import styles from './IconButton.module.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
}
//  Пример использования:
//  <IconButton
//   icon={<HeartIcon />}
//   onClick={() => console.log('Like')}
//   aria-label="Лайк"
// />

export const IconButton = ({ icon, className, ...props }: IconButtonProps) => (
  <button className={clsx(styles.iconButton, className)} {...props}>
    {icon}
  </button>
)
