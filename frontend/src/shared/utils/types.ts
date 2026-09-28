//используем в компоненте UserList и UserCard(через пропс передаем)
export type TUser = {
  id: string
  name: string
  city: string
  birthDate: string
  gender?: string
  email?: string
  password?: string
  about?: string
  skillOfferedId: string
  subcategoriesWanted: string[]
  favoritesUserId?: string[]
  createdAt?: string
  updatedAt?: string
  avatarUrl: string
}

//понадобится тому, кто будет делать компонент с формой регистрации(можете изменять под себя, если понадобится)
export type TRegisterData = {
  email: string
  password: string
  name: string
  city: string
  birthDate: string
  gender: string
  about?: string
  subcategoriesWanted: string[]
  avatarUrl: string
}

//нужно тому, кто будет делать SkillCard
export type TSkill = {
  id: string
  categoryId: string
  subcategoryId: string
  userId: string
  title: string
  description: string
  imagesUrl: string[]
  updatedAt?: string
}

export type TCategory = {
  id: string // UUID
  name: string
  children?: TCategory[]
}

export type TSubcategory = {
  id: string
  name: string
  categoryId: string
}

/** Плоский список подкатегорий из дерева GET /api/categories */
export const flattenCategoriesToSubcategories = (categories: TCategory[]): TSubcategory[] =>
  categories.flatMap((category) =>
    (category.children ?? []).map((child) => ({
      id: child.id,
      name: child.name,
      categoryId: category.id,
    })),
  )
