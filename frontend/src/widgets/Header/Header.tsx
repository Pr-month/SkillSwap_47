import { useRef, useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { ArrowDown, ArrowUp } from '../../shared/assets/icons'
import likeIcon from '/src/shared/assets/icons/HeartIcon.png'
import moonIcon from '../../shared/assets/icons/moon.png'
import logoutIcon from '../../shared/assets/icons/logout.png'
import notificationIcon from '../../shared/assets/icons/notification.png'
import close from '../../shared/assets/icons/close.png'
import { Button } from '../../shared/ui/Button'
import { IconButton } from '../../shared/ui/IconButton'
import { Logo } from '../../shared/ui/Logo'
import { SearchInput } from '../../shared/ui/TextInput'
import styles from './Header.module.css'
import { SkillCatalogModal } from '../Modals/SkillCatalogModal/SkillCatalogModal'
import { useDismiss } from '../../shared/lib/useDismiss'
import { PopupNotifications } from '../PopupNotifications'
import { setSearchText } from '../../entities/user/model/filterSlice'
import { logoutUser } from '../../entities/user/model/userSlice'
import { useAppDispatch } from '../../app/store/store'
import { useAppSelector } from '../../app/store/store'

interface Props {
  variant?: 'default' | 'auth' // Добавляем типы для вариантов
  withFakeNotifications?: boolean
}

export const Header = ({ withFakeNotifications = false, variant = 'default' }: Props) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isNotificationsRead, setIsNotificationsRead] = useState(false)
  const notificationsRef = useRef(null)
  useDismiss({
    ref: notificationsRef,
    onDismiss: () => setIsNotificationsOpen(false),
    enabled: isNotificationsOpen,
  })

  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false)
  const profileActionsRef = useRef(null)
  useDismiss({
    ref: profileActionsRef,
    onDismiss: () => setIsProfileActionsOpen(false),
    enabled: isProfileActionsOpen,
  })

  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const profileUser = useAppSelector((state) => state.user.profileUser)
  const isAuth = !!profileUser
  const userAvatar = useMemo(() => {
    if (!profileUser?.avatarUrl) return '/images/users/default-avatar.png'

    // if (profileUser.avatarUrl instanceof File) {
    //   return URL.createObjectURL(profileUser.avatarUrl)
    // }

    return profileUser.avatarUrl
  }, [profileUser?.avatarUrl])

  const userName = profileUser?.name || 'Пользователь'

  const catalogIcon = isCatalogOpen ? <ArrowUp /> : <ArrowDown />

  const dispatch = useAppDispatch()

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setSearchText(searchValue))
    }, 500) //debounce поиска
    return () => clearTimeout(timeout)
  }, [searchValue, dispatch])

  if (variant === 'auth') {
    return (
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerAuth}`}>
          <Logo />
          <Button variant="tertiary" className={styles.btn} onClick={() => navigate('/')}>
            Закрыть
            <img className={styles.img} src={close} alt="" />
          </Button>
        </div>
      </header>
    )
  }
  return (
    <header className={styles.header}>
      <SkillCatalogModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      <div className={styles.container}>
        <div className={styles.leftSide}>
          <Logo />

          <nav aria-label="Основная навигация" className={styles.navigation}>
            <ul className={styles.navigationList}>
              <li>
                <Button type="button" variant="tertiary" className={styles.navButton}>
                  О проекте
                </Button>
              </li>
              <li>
                <Button
                  type="button"
                  variant="tertiary"
                  className={styles.catalogButton}
                  onClick={() => setIsCatalogOpen((prevState) => !prevState)}
                  aria-expanded={isCatalogOpen}
                  aria-haspopup="listbox"
                >
                  <span>Все навыки</span>
                  <span className={styles.catalogIcon} aria-hidden="true">
                    {catalogIcon}
                  </span>
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.searchWrapper}>
          <SearchInput value={searchValue} onChange={setSearchValue} placeholder="Искать навык" />
        </div>

        <div className={styles.rightSide}>
          <IconButton
            icon={<img src={moonIcon} alt="" className={styles.actionIcon} />}
            aria-label="Переключить тему"
            type="button"
          />

          {isAuth ? (
            <>
              <IconButton
                icon={<img src={notificationIcon} alt="" className={styles.actionIcon} />}
                aria-label="Уведомления"
                type="button"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  setIsNotificationsOpen((prev) => !prev)
                  setIsNotificationsRead(true)
                }}
              />
              {!isNotificationsRead && withFakeNotifications && (
                <div className={styles.notificationsIndicator}></div>
              )}

              <IconButton
                icon={<img src={likeIcon} alt="" className={styles.actionIcon} />}
                aria-label="Избранное"
                type="button"
                onClick={() => navigate('/favorites')}
              />

              <div
                className={styles.profileBlock}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation()
                  setIsProfileActionsOpen((prev) => !prev)
                }}
              >
                <span className={styles.userName}>{userName}</span>
                <img
                  src={userAvatar}
                  alt={`Аватар пользователя ${userName}`}
                  className={styles.avatar}
                />
                {isProfileActionsOpen && (
                  <div className={styles.profileActionsContainer} ref={profileActionsRef}>
                    <Link to="/profile" className={styles.profileAction}>
                      Личный кабинет
                    </Link>
                    <button
                      type="button"
                      className={clsx(styles.profileAction, styles.profileActionButton)}
                      onClick={() => {
                        dispatch(logoutUser())
                        navigate('/')
                      }}
                    >
                      <span>Выйти из аккаунта</span>
                      <img src={logoutIcon} alt="иконка выхода из аккаунта" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.authActions}>
              <Link to="/login">
                <Button type="button" variant="secondary" className={styles.authButton}>
                  Войти
                </Button>
              </Link>
              <Link to="/register/step-1" className={styles.authButton}>
                <Button type="button" variant="primary" className={styles.authButton}>
                  Зарегистрироваться
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      {isNotificationsOpen && (
        <PopupNotifications ref={notificationsRef} withFakeNotifications={withFakeNotifications} />
      )}
    </header>
  )
}
