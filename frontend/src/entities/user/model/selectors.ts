import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../../app/store/store'
import type { TUser } from '../../../shared/utils/types'
import { initialState as filterInitialState } from './filterSlice'

const selectUsers = (state: RootState) => state.user.allUsers
const selectSkills = (state: RootState) => state.skill.allSkills
const selectFilters = (state: RootState) => state.filter
const selectAllSubcategories = (state: RootState) => state.skill.allSubcategories

/** Число чипов в шапке «Фильтры (N)» — совпадает с чипами в UserList. */
export const selectAppliedFilterChipCount = createSelector(
  [selectFilters, selectAllSubcategories],
  (filter, allSubcategories) => {
    let n = 0
    if (filter.skillsType !== filterInitialState.skillsType) n += 1
    if (filter.gender !== filterInitialState.gender) n += 1
    if (filter.searchText.trim() !== '') n += 1
    n += filter.city.length
    n += filter.selectedSubcategoryIds.length
    const categoryIdsWithSubcategories = new Set(allSubcategories.map((s) => s.categoryId))
    for (const categoryId of filter.selectedCategoryIds) {
      if (!categoryIdsWithSubcategories.has(categoryId)) n += 1
    }
    return n
  },
)

// Достаём отфильтрованных пользователей из селектора
// UserList - достает всегда отфильтрованных
//   const filteredUsers = useAppSelector(selectFilteredUsers)

export const selectFilteredUsers = createSelector(
  [selectUsers, selectSkills, selectFilters],
  (users, skills, filters) => {
    return (
      users
        .filter((user) => {
          const usersSkills = skills.filter((skill) => skill.userId === user.id)
          //при all не работала сортировка вообще, исправлено
          if (filters.selectedSubcategoryIds.length > 0) {
            const canTeach = usersSkills.some((skill) =>
              filters.selectedSubcategoryIds.includes(skill.subcategoryId),
            )

            const wantLearn = user.subcategoriesWanted.some((subId) =>
              filters.selectedSubcategoryIds.includes(subId),
            )

            if (filters.skillsType === 'canTeach' && !canTeach) return false
            if (filters.skillsType === 'wantToLearn' && !wantLearn) return false
            if (filters.skillsType === 'all' && !canTeach && !wantLearn) return false
          }

          if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase()
            const hasMatch = usersSkills.some((skill) =>
              skill.title.toLowerCase().includes(searchLower),
            )
            if (!hasMatch) return false
          }

          if (filters.gender !== 'all' && user.gender !== filters.gender) return false

          if (filters.city.length > 0 && !filters.city.includes(user.city)) return false

          return true
        })
        //добавила сортировку конечного списка по алфавиту(видела в ТЗ)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    )
  },
)

export const selectPopularUsers = createSelector([selectUsers], (users) => {
  const allFavorites: number[] = users.flatMap((user) => user.favoritesSkills ?? [])
  const skillCountMap: Record<number, number> = {}
  allFavorites.forEach((skillId) => {
    skillCountMap[skillId] = (skillCountMap[skillId] || 0) + 1
  })
  return [...users].sort((a, b) => {
    const aScore = skillCountMap[a.skillOfferedId] || 0
    const bScore = skillCountMap[b.skillOfferedId] || 0

    //если разное количество очков, то по популярности
    if (bScore !== aScore) {
      return bScore - aScore
    }

    //если одинаковое между двумя - по алфавиту
    return a.name.localeCompare(b.name, undefined, {
      sensitivity: 'base',
    })
  })
})

//если это просто раздел "Новое" =>
// вызываем так const usersNew = useAppSelector(selectFilteredUsers)

//если нужно включить доп фильтрацию по кнопке "Сначала новые" => вызываем так
// const filteredUsers = useAppSelector(selectFilteredUsers)(получение отфильтрованных пользователей в начале страницы)
//const filteredPlusNewUsers = useAppSelector((state) => selectNewUsers(state, filteredUsers)) (по кнопке отдаем filteredPlusNewUsers, при повторном нажатии filteredUsers)
export const selectNewUsers = createSelector(
  [selectUsers, (_: RootState, users?: TUser[]) => users],
  (storeUsers, filteredUsers) => {
    const users = filteredUsers ?? storeUsers
    return [...users].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0

      //если разные даты, то по новизне
      if (bTime !== aTime) {
        return bTime - aTime
      }

      //если одинаковое между двумя - по алфавиту
      return a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      })
    })
  },
)

export const selectRecommendedUsers = createSelector([selectUsers], (users) => {
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
  return shuffledUsers.slice(0, 9)
})
