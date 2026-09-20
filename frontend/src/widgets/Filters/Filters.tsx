import { useMemo, useState } from 'react'
import styles from './Filters.module.css'
import { RadioInput } from '../../shared/ui/RadioInput'
import { Checkbox } from '../../shared/ui/CheckboxInput'
import { ArrowDown, ArrowUp } from '../../shared/assets/icons'
import { useAppDispatch, useAppSelector } from '../../app/store/store'
import { selectAppliedFilterChipCount } from '../../entities/user/model/selectors'
import {
  resetFilters,
  setCity,
  setGender,
  setSelectedCategories,
  setSelectedSubcategories,
  setSkillsType,
} from '../../entities/user/model/filterSlice'
import { CloseIcon } from '../../shared/assets/icons/CloseIcon'

const DEFAULTVISIBLECATEGORYCOUNT = 5
const DEFAULTVISIBLECITYCOUNT = 5

export const Filters = () => {
  const dispatch = useAppDispatch()

  const categories = useAppSelector((state) => state.skill.allCategories)
  const subcategories = useAppSelector((state) => state.skill.allSubcategories)
  const users = useAppSelector((state) => state.user.allUsers)
  const filterState = useAppSelector((state) => state.filter)
  const { skillsType, gender, selectedCategoryIds, selectedSubcategoryIds, city } = filterState
  const appliedCount = useAppSelector(selectAppliedFilterChipCount)

  const [showAllCategories, setShowAllCategories] = useState(false)
  const [showAllCities, setShowAllCities] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
  const [, setActiveArrowCategoryId] = useState<number | null>(null)

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, DEFAULTVISIBLECATEGORYCOUNT)

  const cities = useMemo(
    () => Array.from(new Set(users.map((user) => user.city))).filter(Boolean),
    [users],
  )
  const visibleCities = showAllCities ? cities : cities.slice(0, DEFAULTVISIBLECITYCOUNT)

  const handleCategoryToggle = (categoryId: number) => {
    const hasSubcategories = subcategories.some(
      (subcategory) => subcategory.categoryId === categoryId,
    )
    const categorySubcategoryIds = subcategories
      .filter((subcategory) => subcategory.categoryId === categoryId)
      .map((subcategory) => subcategory.id)

    const isCategorySelected = selectedCategoryIds.includes(categoryId)

    if (isCategorySelected) {
      dispatch(setSelectedCategories(selectedCategoryIds.filter((id) => id !== categoryId)))
      dispatch(
        setSelectedSubcategories(
          selectedSubcategoryIds.filter(
            (subcategoryId) => !categorySubcategoryIds.includes(subcategoryId),
          ),
        ),
      )
      if (hasSubcategories && expandedCategoryId === categoryId) {
        setExpandedCategoryId(null)
      }
      return
    }

    dispatch(setSelectedCategories([...selectedCategoryIds, categoryId]))
    dispatch(
      setSelectedSubcategories([
        ...new Set([...selectedSubcategoryIds, ...categorySubcategoryIds]),
      ]),
    )

    if (hasSubcategories) {
      setActiveArrowCategoryId(categoryId)
      setExpandedCategoryId(categoryId)
    }
  }

  const handleSubcategoryToggle = (subcategoryId: number, categoryId: number) => {
    const isSelected = selectedSubcategoryIds.includes(subcategoryId)
    const newSubcategoryIds = isSelected
      ? selectedSubcategoryIds.filter((id) => id !== subcategoryId)
      : [...selectedSubcategoryIds, subcategoryId]

    dispatch(setSelectedSubcategories(newSubcategoryIds))

    const categorySubcategoryIds = subcategories
      .filter((subcategory) => subcategory.categoryId === categoryId)
      .map((subcategory) => subcategory.id)

    const allSubcategoriesSelected = categorySubcategoryIds.every((id) =>
      newSubcategoryIds.includes(id),
    )
    const newCategoryIds = allSubcategoriesSelected
      ? [...new Set([...selectedCategoryIds, categoryId])]
      : selectedCategoryIds.filter((id) => id !== categoryId)

    dispatch(setSelectedCategories(newCategoryIds))
  }
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId))
  }

  const handleCityToggle = (cityName: string) => {
    const newCities = city.includes(cityName)
      ? city.filter((c) => c !== cityName)
      : [...city, cityName]
    dispatch(setCity(newCities))
  }

  return (
    <aside className={styles.root} aria-label="Фильтры">
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Фильтры{appliedCount > 0 ? ` (${appliedCount})` : ''}</h2>
        {appliedCount > 0 && (
          <button
            type="button"
            className={styles.resetChip}
            aria-label="Сбросить все фильтры"
            onClick={() => dispatch(resetFilters())}
          >
            <span className={styles.resetChipLabel}>Сбросить</span>
            <span className={styles.resetChipIcon}>
              <CloseIcon />
            </span>
          </button>
        )}
      </div>

      <fieldset className={`${styles.group} ${styles.firstGroup}`}>
        <legend className={styles.visuallyHidden}>Тип навыков</legend>
        <div className={styles.options}>
          <RadioInput
            name="skills-type"
            label="Все"
            value="all"
            checked={skillsType === 'all'}
            onChange={() => dispatch(setSkillsType('all'))}
          />
          <RadioInput
            name="skills-type"
            label="Хочу научиться"
            value="wantToLearn"
            checked={skillsType === 'wantToLearn'}
            onChange={() => dispatch(setSkillsType('wantToLearn'))}
          />
          <RadioInput
            name="skills-type"
            label="Могу научить"
            value="canTeach"
            checked={skillsType === 'canTeach'}
            onChange={() => dispatch(setSkillsType('canTeach'))}
          />
        </div>
      </fieldset>

      <fieldset className={`${styles.group} ${styles.skillsGroup}`}>
        <legend className={styles.title}>Навыки</legend>
        <ul className={styles.list}>
          {visibleCategories.map((category) => {
            const categorySubcategories = subcategories.filter(
              (subcategory) => subcategory.categoryId === category.id,
            )
            const selectedSubcategoriesCount = categorySubcategories.filter((subcategory) =>
              selectedSubcategoryIds.includes(subcategory.id),
            ).length
            const isCategoryIndeterminate =
              selectedSubcategoriesCount > 0 &&
              selectedSubcategoriesCount < categorySubcategories.length
            const isExpanded = expandedCategoryId === category.id

            return (
              <li key={category.id} className={styles.listItem}>
                <div className={styles.categoryRow}>
                  <Checkbox
                    label={category.title}
                    checked={selectedCategoryIds.includes(category.id) || isCategoryIndeterminate}
                    showArrow={false}
                    isIndeterminate={isCategoryIndeterminate}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  {categorySubcategories.length > 0 && (
                    <button
                      type="button"
                      className={styles.expandButton}
                      aria-label={`Показать подкатегории: ${category.title}`}
                      onClick={() => toggleCategoryExpand(category.id)}
                    >
                      <span className={styles.expandIcon}>
                        {isExpanded ? <ArrowUp /> : <ArrowDown />}
                      </span>
                    </button>
                  )}
                </div>

                {categorySubcategories.length > 0 && isExpanded && (
                  <ul className={styles.sublist}>
                    {categorySubcategories.map((subcategory) => (
                      <li key={subcategory.id} className={styles.sublistItem}>
                        <Checkbox
                          label={subcategory.title}
                          checked={selectedSubcategoryIds.includes(subcategory.id)}
                          showArrow={false}
                          onChange={() => handleSubcategoryToggle(subcategory.id, category.id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowAllCategories((prev) => !prev)}
        >
          {showAllCategories ? 'Скрыть категории' : 'Все категории'}
          <span className={styles.toggleIcon}>
            <ArrowDown />
          </span>
        </button>
      </fieldset>

      <fieldset className={`${styles.group} ${styles.genderGroup}`}>
        <legend className={styles.title}>Пол автора</legend>
        <div className={styles.options}>
          <RadioInput
            name="gender"
            label="Не имеет значения"
            value="all"
            checked={gender === 'all'}
            onChange={() => dispatch(setGender('all'))}
          />
          <RadioInput
            name="gender"
            label="Мужской"
            value="male"
            checked={gender === 'male'}
            onChange={() => dispatch(setGender('male'))}
          />
          <RadioInput
            name="gender"
            label="Женский"
            value="female"
            checked={gender === 'female'}
            onChange={() => dispatch(setGender('female'))}
          />
        </div>
      </fieldset>

      <fieldset className={`${styles.group} ${styles.cityGroup}`}>
        <legend className={styles.title}>Город</legend>
        <ul className={styles.list}>
          {visibleCities.map((cityName) => (
            <li key={cityName} className={styles.listItem}>
              <Checkbox
                label={cityName}
                checked={city.includes(cityName)}
                showArrow={false}
                value={cityName}
                onChange={() => handleCityToggle(cityName)}
              />
            </li>
          ))}
        </ul>

        {cities.length > DEFAULTVISIBLECITYCOUNT && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowAllCities((prev) => !prev)}
          >
            {showAllCities ? 'Скрыть города' : 'Все города'}
            <span className={styles.toggleIcon}>
              <ArrowDown />
            </span>
          </button>
        )}
      </fieldset>
    </aside>
  )
}
