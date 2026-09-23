import { request } from './base'
import type { TSubcategory } from '../shared/utils/types'
import { delay } from '../shared/lib/delay'

type TSubcategoryResponse = {
  subcategoryList: TSubcategory[]
}

//метод для получения всех подкатегорий из json
export const getSubcategoriesApi = async (): Promise<TSubcategory[]> => {
  await delay()
  const data = await request<TSubcategoryResponse>('/db/subcategories.json')
  return data.subcategoryList
}

//метод для получения всех подкатегорий по ID категории(используется на странице регистрации - шаг 2)
// export const getSubcategoriesByCategoryIdApi = async (
//   categoryId: number,
// ): Promise<TSubcategory[]> => {
//   const allSubcategories = await getSubcategoriesApi()
//   const subcategoriesByCategoryId = allSubcategories.filter((sub) => sub.categoryId === categoryId)
//   return subcategoriesByCategoryId
// }

//не потребуется, можно в компоненте достать все категории и подкатегории из стора и отфильтровать их по айди категории
//можно прямо так
//const allSubcategories = useAppSelector(state => state.category.allSubcategories) (с категориями аналогично)
//categoriesArray = allCategories.map(elem => elem.id)
//тут либо запускайте цикл по каждой, либо доставайте конкретную, массив айди категорий у вас есть
//   const subcategoriesByCategoryId = allSubcategories.filter((sub) => sub.categoryId === categoryId)
