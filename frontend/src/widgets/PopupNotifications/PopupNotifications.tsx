import { forwardRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './PopupNotifications.module.css'
import { NotificationItem, type TNotificationItem } from './NotificationItem/NotificationItem'
import { Button } from '../../shared/ui/Button'
import clsx from 'clsx'

interface PopupNotificationsProps {
  notifications?: TNotificationItem[]
  className?: string
  withFakeNotifications?: boolean
}

export const PopupNotifications = forwardRef<HTMLDivElement, PopupNotificationsProps>(
  ({ notifications, className, withFakeNotifications = false }, ref) => {
    const newNotifications =
      notifications?.filter((notification) => notification.variant === 'new') || []
    const viewedNotifications =
      notifications?.filter((notification) => notification.variant === 'viewed') || []
    const showNewButton = newNotifications.length > 0 || withFakeNotifications
    const showViewedButton = viewedNotifications.length > 0 || withFakeNotifications

    return createPortal(
      <div className={clsx(styles.container, className)} ref={ref}>
        <div className={clsx(styles.newNotifications, styles.notificationsSection)}>
          <div className={styles.notificationsHeader}>
            <h3 className={styles.notificationsTitle}>Новые уведомления</h3>
            {showNewButton && (
              <Button variant="tertiary" className={styles.button}>
                Прочитать все
              </Button>
            )}
          </div>
          {withFakeNotifications ? (
            <ul className={styles.notificationsList}>
              <li className={styles.notificationItem}>
                <NotificationItem
                  title="Николай принял ваш обмен"
                  description="Перейдите в профиль, чтобы обсудить детали"
                  date="сегодня"
                  variant="new"
                />
              </li>
              <li className={styles.notificationItem}>
                <NotificationItem
                  title="Татьяна предлагает вам обмен"
                  description="Перейдите в профиль, чтобы обсудить детали"
                  date="сегодня"
                  variant="new"
                />
              </li>
            </ul>
          ) : newNotifications?.length > 0 ? (
            <ul className={styles.notificationsList}>
              {newNotifications.map((notification, index) => (
                <li className={styles.notificationItem}>
                  <NotificationItem key={index} {...notification} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noNotifications}>Нет новых уведомлений</p>
          )}
        </div>

        <div className={clsx(styles.viewedNotifications, styles.notificationsSection)}>
          <div className={styles.notificationsHeader}>
            <h3 className={styles.notificationsTitle}>Просмотренные</h3>
            {showViewedButton && (
              <Button variant="tertiary" className={styles.button}>
                Очистить
              </Button>
            )}
          </div>
          {withFakeNotifications ? (
            <ul className={styles.notificationsList}>
              <li className={clsx(styles.viewedNotificationItem, styles.notificationItem)}>
                <NotificationItem
                  title="Олег предлагает вам обмен"
                  description="Примите обмен, чтобы обсудить детали"
                  date="вчера"
                  variant="viewed"
                />
              </li>
              <li className={clsx(styles.viewedNotificationItem, styles.notificationItem)}>
                <NotificationItem
                  title="Игорь принял ваш обмен"
                  description="Перейдите в профиль, чтобы обсудить детали"
                  date="23 мая"
                  variant="viewed"
                />
              </li>
            </ul>
          ) : viewedNotifications?.length > 0 ? (
            <ul className={styles.notificationsList}>
              {viewedNotifications.map((notification, index) => (
                <li className={styles.viewedNotificationItem} key={index}>
                  <NotificationItem {...notification} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noNotifications}>Нет просмотренных уведомлений</p>
          )}
        </div>
      </div>,
      document.body,
    )
  },
)
