import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/store/store'
import type { TSubcategory } from '../../shared/utils/types'
import { Button } from '../../shared/ui/Button'
import { IconButton } from '../../shared/ui/IconButton'
import { SkillCard } from '../../widgets/SkillCard'
import { UserList } from '../../widgets/UserList/UserList'
import { UserCard } from '../../widgets/UserCard'
import { ExchangeOfferedModal } from '../../widgets/Modals/ExchangeOfferedModal'
import styles from './Skill.module.css'
// import likeOutlineIcon from '../../shared/assets/icons/like-outline.png'
import shareIcon from '../../shared/assets/icons/share.png'
import moreSquareIcon from '../../shared/assets/icons/more-square.png'
import { useAppDispatch } from '../../app/store/store'
import { toggleFavorite } from '../../entities/user/model/userSlice'
import { addToSwap } from '../../entities/Skill/model/skillSlice'
import clsx from 'clsx'

const FALLBACK_IMAGE = '/images/skills/sk1-1.png'

const getSafeSubcategories = (
  wantedIds: number[] | undefined,
  allSubcategories: TSubcategory[],
): TSubcategory[] => {
  const selected = (wantedIds || [])
    .map((id) => allSubcategories.find((sub) => sub.id === id))
    .filter((sub): sub is TSubcategory => Boolean(sub))

  if (selected.length >= 2) {
    return selected
  }

  const fallback = allSubcategories.filter(
    (sub) => !selected.some((existing) => existing.id === sub.id),
  )
  return [...selected, ...fallback].slice(0, 2)
}

const SkillPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const skillId = Number(id)

  const skill = useAppSelector((state) =>
    state.skill.allSkills.find((currentSkill) => currentSkill.id === skillId),
  )

  const user = useAppSelector((state) =>
    state.user.allUsers.find((currentUser) => currentUser.id === skill?.userId),
  )

  const allSubcategories = useAppSelector((state) => state.skill.allSubcategories)
  const allCategories = useAppSelector((state) => state.skill.allCategories)
  const profileUser = useAppSelector((state) => state.user.profileUser)
  const profileSkill = useAppSelector((state) => state.skill.isForSwap)

  const userSubcategories = useMemo(
    () => getSafeSubcategories(user?.subcategoriesWanted, allSubcategories),
    [user?.subcategoriesWanted, allSubcategories],
  )

  const categoryText = useMemo(() => {
    if (!skill) return ''

    const categoryTitle = allCategories.find((category) => category.id === skill.categoryId)?.title
    const subcategoryTitle = allSubcategories.find(
      (subcategory) => subcategory.id === skill.subcategoryId,
    )?.title

    return [categoryTitle, subcategoryTitle].filter(Boolean).join(' / ')
  }, [skill, allCategories, allSubcategories])

  const [uiLiked, setUiLiked] = useState<boolean | null>(null)
  const dispatch = useAppDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isLikedFromStore =
    typeof skill?.id === 'number' && !Number.isNaN(skill?.id)
      ? profileUser?.favoritesSkills?.includes(skill?.id)
      : false
  const isLiked = uiLiked ?? isLikedFromStore
  const isForSwap =
    profileUser && typeof skill?.id === 'number' ? profileSkill?.includes(skill.id) : false
  const localUser = localStorage.getItem('draftUser')
  const localUserId = localUser ? JSON.parse(localUser).id : null
  const isLocalProfileUser = profileUser?.id === localUserId

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (!profileUser) {
      navigate('/login')
    }

    const id = skill?.id

    if (typeof id !== 'number' || Number.isNaN(id)) return

    if (isLocalProfileUser) {
      dispatch(toggleFavorite(id))
      return
    }

    setUiLiked((prev) => (prev === null ? !isLiked : !prev))
  }

  const isLoadingSkill = useAppSelector((state) => state.skill.isLoading)
  const isLoadingUser = useAppSelector((state) => state.user.isLoadingUsers)

  if (isLoadingSkill || isLoadingUser) {
    return (
      <section className={styles.page}>
        <div className={styles.notFoundCard}>
          <h1 className={styles.notFoundTitle}>Идет загрузка навыка</h1>
          <p className={styles.notFoundText}>
            Гружусь и очень стараюсь. Пожалуйста, подождите, еще немного...
          </p>
        </div>
      </section>
    )
  }

  if (!skill || !user) {
    return (
      <section className={styles.page}>
        <div className={styles.notFoundCard}>
          <h1 className={styles.notFoundTitle}>Навык не найден</h1>
          <p className={styles.notFoundText}>
            Проверьте корректность ссылки или выберите другой навык.
          </p>
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </section>
    )
  }

  const handleOfferClick = () => {
    if (!profileUser) {
      navigate('/login')
      return
    }
    const id = skill?.id
    if (typeof id !== 'number') return

    dispatch(addToSwap(id))
    setIsModalOpen(true)
  }

  return (
    <section className={styles.page}>
      <div className={styles.topSection}>
        <UserCard
          variant="detailed"
          user={user}
          skill={skill}
          subcategories={userSubcategories}
          className={styles.userCard}
        />

        <div className={styles.skillColumn}>
          <div className={styles.actions}>
            <IconButton
              icon={
                <img
                  src={
                    isLiked
                      ? '/src/shared/assets/icons/HeartFilled.png'
                      : '/src/shared/assets/icons/HeartIcon.png'
                  }
                  alt="избранное"
                />
              }
              type="button"
              className={styles.actionButton}
              aria-label="Добавить в избранное"
              onClick={handleLikeClick}
            />
            <IconButton
              icon={<img src={shareIcon} alt="поделиться" />}
              type="button"
              aria-label="Поделиться"
              className={styles.actionButton}
            />
            <IconButton
              icon={<img src={moreSquareIcon} alt="дополнительно" />}
              type="button"
              aria-label="Дополнительные действия"
              className={styles.actionButton}
            />
          </div>

          <SkillCard
            title={skill.title}
            category={categoryText}
            description={skill.description}
            images={skill.imagesUrl.length > 0 ? skill.imagesUrl : [FALLBACK_IMAGE]}
          >
            {/* <Button className={styles.exchangeButton} onClick={handleOfferClick} disabled={isForSwap} >
              Предложить обмен
            </Button> */}
            <Button
              variant={isForSwap ? 'secondary' : 'primary'}
              // disabled={isForSwap}
              onClick={handleOfferClick}
              className={clsx(styles.exchangeButton, {
                [styles.activeSwap]: isForSwap,
              })}
              disabled={isForSwap}
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
                'Предложить обмен'
              )}
            </Button>
          </SkillCard>
        </div>
      </div>

      <UserList
        variant="skillpage"
        currentCategoryId={skill.categoryId}
        currentUserId={skill.userId}
      />
      <ExchangeOfferedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  )
}

export default SkillPage
