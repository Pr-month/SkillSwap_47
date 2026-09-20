import { useAppDispatch, useAppSelector } from '../../app/store/store'
import {
  isFiltersActive,
  setCity,
  setGender,
  setSearchText,
  setSelectedCategories,
  setSelectedSubcategories,
  setSkillsType,
} from '../../entities/user/model/filterSlice'
import { CloseIcon } from '../../shared/assets/icons/CloseIcon'
import listStyles from '../UserList/UserList.module.css'
import styles from './AppliedFilterChips.module.css'

export const AppliedFilterChips = () => {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filter)
  const allSubcategories = useAppSelector((state) => state.skill.allSubcategories)
  const allCategories = useAppSelector((state) => state.skill.allCategories)

  if (!isFiltersActive(filters)) return null

  const appliedFilterChips: { id: string; label: string; onDismiss: () => void }[] = []

  if (filters.skillsType === 'wantToLearn') {
    appliedFilterChips.push({
      id: 'skillsType',
      label: 'Хочу научиться',
      onDismiss: () => dispatch(setSkillsType('all')),
    })
  } else if (filters.skillsType === 'canTeach') {
    appliedFilterChips.push({
      id: 'skillsType',
      label: 'Могу научить',
      onDismiss: () => dispatch(setSkillsType('all')),
    })
  }

  ;[...filters.selectedSubcategoryIds]
    .sort((a, b) => a - b)
    .forEach((subcategoryId) => {
      const sub = allSubcategories.find((s) => s.id === subcategoryId)
      if (!sub) return
      appliedFilterChips.push({
        id: `sub-${subcategoryId}`,
        label: sub.title,
        onDismiss: () => {
          const newSubcategoryIds = filters.selectedSubcategoryIds.filter(
            (id) => id !== subcategoryId,
          )
          dispatch(setSelectedSubcategories(newSubcategoryIds))
          const categorySubcategoryIds = allSubcategories
            .filter((s) => s.categoryId === sub.categoryId)
            .map((s) => s.id)
          const allSubsOfCategorySelected = categorySubcategoryIds.every((id) =>
            newSubcategoryIds.includes(id),
          )
          const newCategoryIds = allSubsOfCategorySelected
            ? [...new Set([...filters.selectedCategoryIds, sub.categoryId])]
            : filters.selectedCategoryIds.filter((id) => id !== sub.categoryId)
          dispatch(setSelectedCategories(newCategoryIds))
        },
      })
    })

  filters.selectedCategoryIds.forEach((categoryId) => {
    const subsInCategory = allSubcategories.filter((s) => s.categoryId === categoryId)
    if (subsInCategory.length > 0) return
    const category = allCategories.find((c) => c.id === categoryId)
    if (!category) return
    appliedFilterChips.push({
      id: `cat-${categoryId}`,
      label: category.title,
      onDismiss: () =>
        dispatch(
          setSelectedCategories(filters.selectedCategoryIds.filter((id) => id !== categoryId)),
        ),
    })
  })

  if (filters.gender === 'male') {
    appliedFilterChips.push({
      id: 'gender',
      label: 'Мужской',
      onDismiss: () => dispatch(setGender('all')),
    })
  } else if (filters.gender === 'female') {
    appliedFilterChips.push({
      id: 'gender',
      label: 'Женский',
      onDismiss: () => dispatch(setGender('all')),
    })
  }

  filters.city.forEach((cityName) => {
    appliedFilterChips.push({
      id: `city-${cityName}`,
      label: cityName,
      onDismiss: () => dispatch(setCity(filters.city.filter((c) => c !== cityName))),
    })
  })

  const query = filters.searchText.trim()
  if (query) {
    const preview = query.length > 36 ? `${query.slice(0, 36)}…` : query
    appliedFilterChips.push({
      id: 'search',
      label: `Поиск: ${preview}`,
      onDismiss: () => dispatch(setSearchText('')),
    })
  }

  if (appliedFilterChips.length === 0) return null

  return (
    <div className={styles.root} aria-label="Применённые фильтры">
      {appliedFilterChips.map((chip) => (
        <span key={chip.id} className={listStyles.filterChip}>
          <span className={listStyles.filterChipLabel}>{chip.label}</span>
          <button
            type="button"
            className={listStyles.filterChipRemove}
            aria-label={`Сбросить фильтр: ${chip.label}`}
            onClick={chip.onDismiss}
          >
            <CloseIcon />
          </button>
        </span>
      ))}
    </div>
  )
}
