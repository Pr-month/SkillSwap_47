import styles from './UserList.module.css'
import { useState, useCallback, useEffect, useRef } from 'react'
import sorticon from '/src/shared/assets/icons/sort.png'
import arrowright from '/src/shared/assets/icons/arrowright.png'
import { useAppSelector } from '../../app/store/store'
import {
  selectPopularUsers,
  selectNewUsers,
  selectRecommendedUsers,
  selectFilteredUsers,
} from '../../entities/user/model/selectors'
import { UserCard } from '../UserCard/UserCard'
import { isFiltersActive } from '../../entities/user/model/filterSlice'
import { Button } from '../../shared/ui/Button'
import type { TSkill, TUser, TSubcategory } from '../../shared/utils/types'

const PAGE_SIZE = 20
const DEFAULT_SKILL: TSkill = {
  id: 0,
  categoryId: 0,
  subcategoryId: 0,
  userId: 0,
  title: 'Навыки не указаны',
  description: 'Пользователь еще не заполнил информацию о своих услугах',
  imagesUrl: [],
}

function useInfiniteVisibleCount(totalLength: number, resetKey: unknown) {
  const [data, setData] = useState({ count: PAGE_SIZE, key: resetKey })

  // Если resetKey изменился, сбрасываем состояние прямо во время рендера (это паттерн React)
  if (data.key !== resetKey) {
    setData({
      count: Math.min(PAGE_SIZE, Math.max(0, totalLength)),
      key: resetKey,
    })
  }

  const loadMore = useCallback(() => {
    setData((prev) => ({ ...prev, count: Math.min(prev.count + PAGE_SIZE, totalLength) }))
  }, [totalLength])

  const hasMore = data.count < totalLength
  return { visibleCount: data.count, loadMore, hasMore }
}

function InfiniteScrollSentinel({
  hasMore,
  onLoadMore,
}: {
  hasMore: boolean
  onLoadMore: () => void
}) {
  const ref = useRef<HTMLLIElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const el = ref.current
    if (!el || !hasMore) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMoreRef.current()
      },
      { rootMargin: '300px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore])

  if (!hasMore) return null
  return <li ref={ref} style={{ listStyle: 'none', height: '1px' }} aria-hidden />
}

interface SkillLayoutProps {
  currentCategoryId?: number
  currentUserId?: number
  allUsers: TUser[]
  allSkills: TSkill[]
  allSubcategories: TSubcategory[]
}

export const SkillLayout = ({
  currentCategoryId,
  currentUserId,
  allUsers,
  allSkills,
  allSubcategories,
}: SkillLayoutProps) => {
  const [showAllSkillpage, setShowAllSkillpage] = useState(false)

  if (!currentCategoryId) return null

  const usersWithSkills = allUsers.map((user) => {
    const userSkill = allSkills.find((skill) => skill.userId === user.id)
    return { user, userSkill }
  })

  const similarUsers = usersWithSkills.filter(
    ({ user, userSkill }) =>
      userSkill?.categoryId === currentCategoryId && user.id !== currentUserId,
  )

  return (
    <div className={styles.container}>
      <section className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Похожие предложения</h2>
        <Button variant="tertiary" onClick={() => setShowAllSkillpage(!showAllSkillpage)}>
          Смотреть все <img className={styles.imgBtn} src={arrowright} alt="стрелка" />
        </Button>
      </section>
      <ul className={styles.userListSkill}>
        {(showAllSkillpage ? similarUsers : similarUsers.slice(0, 4)).map(({ user, userSkill }) => {
          const userSubs = allSubcategories.filter((sub) =>
            user.subcategoriesWanted.includes(sub.id),
          )

          return (
            <UserCard
              key={user.id}
              user={user}
              subcategories={userSubs}
              skill={userSkill || DEFAULT_SKILL}
            />
          )
        })}
      </ul>
    </div>
  )
}

interface FavoritesLayoutProps {
  allUsers: TUser[]
  favoriteSkillIds: number[]
  allSubcategories: TSubcategory[]
  allSkills: TSkill[]
}

export const FavoritesLayout = ({
  allUsers,
  favoriteSkillIds,
  allSubcategories,
  allSkills,
}: FavoritesLayoutProps) => {
  const favoriteUsers = allUsers.filter((user) => favoriteSkillIds.includes(user.skillOfferedId))
  const { visibleCount, loadMore, hasMore } = useInfiniteVisibleCount(
    favoriteUsers.length,
    'favorites',
  )
  return (
    <div className={styles.container}>
      <ul className={styles.userList}>
        {favoriteUsers.slice(0, visibleCount).map((user) => {
          const userSubs = allSubcategories.filter((sub) =>
            user.subcategoriesWanted.includes(sub.id),
          )
          const userSkill = allSkills.find((skill) => skill.userId === user.id)
          return (
            <UserCard
              key={user.id}
              user={user}
              subcategories={userSubs}
              skill={userSkill || DEFAULT_SKILL}
            />
          )
        })}
        <InfiniteScrollSentinel hasMore={hasMore} onLoadMore={loadMore} />
      </ul>
    </div>
  )
}

export const UserList = ({
  variant = 'homepage',
  currentCategoryId,
  currentUserId,
}: {
  variant?: 'homepage' | 'skillpage' | 'favoritpage'
  currentCategoryId?: number
  currentUserId?: number
}) => {
  // Состояния для отображения
  const [showAllPopular, toggleShowAllPopular] = useState(false)
  const [showAllNew, toggleShowAllNew] = useState(false)

  // состояние сортировки
  const [isNewFirst, setIsNewFirst] = useState(true)
  const toggleSort = () => {
    setIsNewFirst(!isNewFirst)
    // Здесь также можно вызвать функцию самой сортировки filteredUsers
  }
  //вытаскиваем все фильтры
  const filters = useAppSelector((state) => state.filter)
  //вытаскиваем всех пользователей
  const allUsers = useAppSelector((state) => state.user.allUsers)
  //вытаскиваем пользователей, отфильтрованных по популярности
  const usersPopular = useAppSelector(selectPopularUsers)
  //вытаскиваем всех пользователей, отфильтрованных по дате
  const usersNew = useAppSelector(selectNewUsers)
  //вытаскиваем пользователей-список рекомендаций
  const usersRecommended = useAppSelector(selectRecommendedUsers)
  //вытаскиваем все подкатегории
  const allSubcategories = useAppSelector((state) => state.skill.allSubcategories)
  //вытаскиваем все скиллы
  const allSkills = useAppSelector((state) => state.skill.allSkills)
  //вытаскиваем отфильтрованных пользователей или найденных по поиску
  const filteredUsers = useAppSelector(selectFilteredUsers)
  //подключаем сортировку по новизне для отфильтрованных пользователей
  const filteredPlusNewUsers = useAppSelector((state) => selectNewUsers(state, filteredUsers))
  const displayedUsers = isNewFirst ? filteredUsers : filteredPlusNewUsers
  //
  const favoriteSkillIds = useAppSelector((state) => state.user.profileUser?.favoritesSkills || [])
  // Для стабильности работы
  const filtersActive = isFiltersActive(filters)

  const {
    visibleCount: fVis,
    loadMore: fLoad,
    hasMore: fHas,
  } = useInfiniteVisibleCount(filteredUsers.length, filtersActive)
  const {
    visibleCount: pVis,
    loadMore: pLoad,
    hasMore: pHas,
  } = useInfiniteVisibleCount(usersPopular.length, showAllPopular)
  const {
    visibleCount: nVis,
    loadMore: nLoad,
    hasMore: nHas,
  } = useInfiniteVisibleCount(usersNew.length, showAllNew)
  const {
    visibleCount: rVis,
    loadMore: rLoad,
    hasMore: rHas,
  } = useInfiniteVisibleCount(usersRecommended.length, 'recommended')

  if (allSubcategories.length === 0) return null
  // Сценарий 1: Пользователь что-то ищет или применил фильтры
  if (variant === 'skillpage') {
    return (
      <SkillLayout
        allUsers={allUsers}
        allSkills={allSkills}
        allSubcategories={allSubcategories}
        currentCategoryId={currentCategoryId}
        currentUserId={currentUserId}
      />
    )
  }

  if (variant === 'favoritpage') {
    return (
      <FavoritesLayout
        allUsers={allUsers}
        allSkills={allSkills}
        allSubcategories={allSubcategories}
        favoriteSkillIds={favoriteSkillIds}
      />
    )
  }

  if (filtersActive) {
    const slice = displayedUsers.slice(0, fVis)

    return (
      <div className={styles.container}>
        <section className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Подходящие предложения: {filteredUsers.length}</h2>
          <Button variant="tertiary" onClick={toggleSort}>
            <img src={sorticon} alt="сортировка" className={styles.imgBtn} />
            {isNewFirst ? 'Сначала новые' : 'По алфавиту'}
          </Button>
        </section>
        <ul className={styles.userList}>
          {slice.map((user) => {
            const userSubs = allSubcategories.filter((sub) =>
              user.subcategoriesWanted.includes(sub.id),
            )
            const userSkill = allSkills.find((skill) => skill.userId === user.id)
            return (
              <UserCard
                key={user.id}
                user={user}
                subcategories={userSubs}
                skill={userSkill || DEFAULT_SKILL}
              />
            )
          })}
          <InfiniteScrollSentinel hasMore={fHas} onLoadMore={fLoad} />
        </ul>
      </div>
    )
  }

  // Сценарий 2: Дефолтная главная страница (блоки по категориям)
  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <section className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Популярное</h2>
          {!showAllPopular && (
            <Button variant="tertiary" onClick={() => toggleShowAllPopular(!showAllPopular)}>
              Смотреть все <img className={styles.imgBtn} src={arrowright} alt="стрелка" />
            </Button>
          )}
        </section>
        <ul className={styles.userList}>
          {(showAllPopular ? usersPopular.slice(0, pVis) : usersPopular.slice(0, 3)).map((user) => {
            const userSubs = allSubcategories.filter((sub) =>
              user.subcategoriesWanted.includes(sub.id),
            )
            const userSkill = allSkills.find((skill) => skill.userId === user.id)
            return (
              <UserCard
                key={user.id}
                user={user}
                subcategories={userSubs}
                skill={userSkill || DEFAULT_SKILL}
              />
            )
          })}
          {showAllPopular && <InfiniteScrollSentinel hasMore={pHas} onLoadMore={pLoad} />}
        </ul>
      </section>

      <section className={styles.section}>
        <section className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Новое</h2>
          {!showAllNew && (
            <Button variant="tertiary" onClick={() => toggleShowAllNew(!showAllNew)}>
              Смотреть все <img className={styles.imgBtn} src={arrowright} alt="стрелка" />
            </Button>
          )}
        </section>
        <ul className={styles.userList}>
          {(showAllNew ? usersNew.slice(0, nVis) : usersNew.slice(0, 3)).map((user) => {
            const userSubs = allSubcategories.filter((sub) =>
              user.subcategoriesWanted.includes(sub.id),
            )
            const userSkill = allSkills.find((skill) => skill.userId === user.id)
            return (
              <UserCard
                key={user.id}
                user={user}
                subcategories={userSubs}
                skill={userSkill || DEFAULT_SKILL}
              />
            )
          })}
          {showAllNew && <InfiniteScrollSentinel hasMore={nHas} onLoadMore={nLoad} />}
        </ul>
      </section>

      <section className={styles.section}>
        <section className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Рекомендуем</h2>
        </section>
        <ul className={styles.userList}>
          {usersRecommended.slice(0, rVis).map((user) => {
            const userSubs = allSubcategories.filter((sub) =>
              user.subcategoriesWanted.includes(sub.id),
            )
            const userSkill = allSkills.find((skill) => skill.userId === user.id)
            return (
              <UserCard
                key={user.id}
                user={user}
                subcategories={userSubs}
                skill={userSkill || DEFAULT_SKILL}
              />
            )
          })}
          <InfiniteScrollSentinel hasMore={rHas} onLoadMore={rLoad} />
        </ul>
      </section>
    </div>
  )
}
