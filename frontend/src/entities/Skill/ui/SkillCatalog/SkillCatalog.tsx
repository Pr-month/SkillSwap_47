import styles from './SkillCatalog.module.css'
import bagIcon from '../../../../shared/assets/icons/bag.png'
import paletteIcon from '../../../../shared/assets/icons/palette.png'
import earthIcon from '../../../../shared/assets/icons/earth.png'
import bookIcon from '../../../../shared/assets/icons/book.png'
import homeIcon from '../../../../shared/assets/icons/home.png'
import leafIcon from '../../../../shared/assets/icons/leaf.png'
import { useAppSelector } from '../../../../app/store/store'

// Замените эти тестовые UUID на реальные ID корневых категорий
const categoryIcons: Record<string, string> = {
  '1bbf909d-d52c-4387-a745-4bb53f3b92e6': bagIcon,
  '5bf1920d-fe6b-410e-92c3-11f403916c98': paletteIcon,
  'a8050e14-8486-4bc5-b337-a0ee61469ed0': earthIcon,
  '0fbf0472-a14b-49e6-98b8-860353fd2a44': bookIcon,
  'c510d32b-d9b7-4c88-9515-906f1f319cb3': homeIcon,
  '30f21540-85a6-465b-b748-a24c2c7c45ee': leafIcon,
}

export const SkillCatalog = () => {
  const categories = useAppSelector((state) => state.skill.allCategories)

  return (
    <section className={styles.catalog}>
      {categories.map((category) => {
        const categorySubcategories = category.children || []
        const categoryIcon = categoryIcons[category.id]

        return (
          <div key={category.id} className={styles.catalogBlock}>
            <div className={styles.blockHeader}>
              {categoryIcon && <img src={categoryIcon} alt="" aria-hidden="true" />}
              <h2 className={styles.blockTitle}>{category.name}</h2>
            </div>

            <ul className={styles.blockList}>
              {categorySubcategories.map((subcategory) => (
                <li key={subcategory.id} className={styles.blockItem}>
                  {subcategory.name}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
