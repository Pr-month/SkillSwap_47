import { useState } from 'react'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'
import { getAge } from '../../shared/lib/getAge'
import type { TUser, TSubcategory, TSkill } from '../../shared/utils/types'
import styles from './UserCard.module.css'
import { IconButton } from '../../shared/ui/IconButton'
import { useAppDispatch, useAppSelector } from '../../app/store/store'
import { toggleFavorite } from '../../entities/user/model/userSlice'

const categoryColors: Record<number, string> = {
  1: '#EEE7F7',
  2: '#F7E7F2',
  3: '#EBE5C5',
  4: '#E7F2F6',
  5: '#F7EBE5',
  6: '#E9F7E7',
}

export interface UserCardProps {
  user: TUser
  subcategories: TSubcategory[]
  skill: TSkill
  onLikeClick?: () => void // для отправки данных в json ????
  // isLiked?: boolean
  variant?: 'compact' | 'detailed'
  className?: string
}

export const UserCard = ({
  user,
  subcategories,
  skill,
  onLikeClick,
  // isLiked = false,
  variant = 'compact',
  className,
}: UserCardProps) => {
  const [uiLiked, setUiLiked] = useState<boolean | null>(null)
  const dispatch = useAppDispatch()
  const profileUser = useAppSelector((state) => state.user.profileUser)
  const profileSkill = useAppSelector((state) => state.skill.isForSwap)
  const isLikedFromStore = profileUser?.favoritesSkills?.includes(user.skillOfferedId)
  const isLiked = uiLiked ?? isLikedFromStore
  const isForSwap = profileUser ? profileSkill?.includes(user.skillOfferedId) : false
  const localUser = localStorage.getItem('draftUser')
  const localUserId = localUser ? JSON.parse(localUser).id : null

  const isLocalProfileUser = profileUser?.id === localUserId
  const navigate = useNavigate()

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!profileUser) {
      navigate('/login')
    } //здесь потом можно добавить навигацию на логин
    if (isLocalProfileUser) {
      dispatch(toggleFavorite(user.skillOfferedId))
      return
    }
    setUiLiked((prev) => (prev === null ? !isLiked : !prev))
    onLikeClick?.()
  }

  return (
    <article className={clsx(styles.card, styles[variant], className)}>
      <div className={styles.top}>
        {variant === 'compact' && (
          <IconButton
            icon={
              <img
                src={
                  isLiked
                    ? '/src/shared/assets/icons/HeartFilled.png'
                    : '/src/shared/assets/icons/HeartIcon.png'
                }
                alt="лайк"
              />
            }
            className={styles.likeButton}
            onClick={handleLikeClick}
          />
        )}
        <img className={styles.avatar} src={user.avatarUrl} alt={user.name} />
        <div className={styles.userInfo}>
          <h3 className={styles.name}>{user.name}</h3>
          <p className={styles.meta}>
            {user.city}, {getAge(user.birthDate)} лет
          </p>
        </div>
      </div>

      <div className={variant === 'detailed' ? styles.detailedContent : styles.content}>
        {variant === 'detailed' && user.about && <p className={styles.about}>{user.about}</p>}

        <div className={variant === 'detailed' ? styles.detailedSection : styles.section}>
          <h4 className={styles.sectionTitle}>Может научить</h4>
          <ul className={styles.skillList}>
            <li
              key={skill.id}
              className={styles.skillTag}
              style={{ backgroundColor: categoryColors[skill.categoryId] || '#eee' }}
            >
              {skill.title}
            </li>
          </ul>
        </div>

        <div className={variant === 'detailed' ? styles.detailedSection : styles.section}>
          <h4 className={styles.sectionTitle}>Хочет научиться</h4>
          <ul className={styles.skillList}>
            <li
              key={subcategories[0].id}
              className={styles.skillTag}
              style={{ backgroundColor: categoryColors[subcategories[0].categoryId] || '#eee' }}
            >
              {subcategories[0].title}
            </li>
            <li
              key={subcategories[1].id}
              className={styles.skillTag}
              style={{ backgroundColor: categoryColors[subcategories[1].categoryId] || '#eee' }}
            >
              {subcategories[1].title}
            </li>
            <li>
              {subcategories.length > 2 && (
                <span className={styles.skillTag}>+{subcategories.length - 2}</span>
              )}
            </li>
          </ul>
        </div>
      </div>

      {variant === 'compact' && (
        <div className={styles.bottom}>
          <Link to={`/skill/${user.skillOfferedId}`}>
            <Button
              variant={isForSwap ? 'secondary' : 'primary'}
              className={clsx(styles.detailsButton, {
                [styles.activeSwap]: isForSwap,
              })}
            >
              {isForSwap ? (
                <>
                  <img
                    src="/src/shared/assets/icons/time.png"
                    alt="иконка обмена"
                    className={styles.icon}
                  />
                  <span>Обмен предложен</span>
                </>
              ) : (
                'Подробнее'
              )}
            </Button>
          </Link>
        </div>
      )}
    </article>
  )
}

export default UserCard
