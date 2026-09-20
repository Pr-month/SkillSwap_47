import styles from './NotificationItem.module.css'
import { Button } from '../../../shared/ui/Button'
import lightBulbIcon from '../../../shared/assets/icons/light-bulb.png'
import clsx from 'clsx'

export type TNotificationItem = {
  title: string
  description: string
  date: string
  variant: 'new' | 'viewed'
  className?: string
}

export const NotificationItem = ({
  title,
  description,
  date,
  variant,
  className,
}: TNotificationItem) => {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.infoContainer}>
        <img src={lightBulbIcon} alt="иконка лампочки" className={styles.icon} />
        <div className={styles.textContainer}>
          <span className={styles.title}>{title}</span>
          <p className={styles.description}>{description}</p>
        </div>
        <span className={styles.date}>{date}</span>
      </div>
      {variant === 'new' && <Button variant="primary">Перейти</Button>}
    </div>
  )
}
