import type { RootState } from '../../app/store/store'
import type { TRegisterBody } from '../../api/authApi'
import type { TRegisterData } from '../../shared/utils/types'

type RegistrationDraftUser = Partial<TRegisterData> & {
  categoryId?: string
  subcategoryId?: string
}

const toIsoBirthdate = (value: string | undefined): string => {
  const raw = (value ?? '').trim()
  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw)
  if (!dotted) return raw
  return `${dotted[3]}-${dotted[2]}-${dotted[1]}`
}

const toApiGender = (value: string | undefined): TRegisterBody['gender'] => {
  const label = (value ?? '').trim()
  if (label === '' || label === 'Не указан') {
    throw new Error('Укажите пол')
  }
  if (label === 'Мужской' || label === 'male') return 'male'
  if (label === 'Женский' || label === 'female') return 'female'
  throw new Error('Укажите пол')
}

export const toRegisterDto = (state: RootState): TRegisterBody => {
  const draftUser = state.user.draftUser as RegistrationDraftUser
  const { draftSkill, allSubcategories } = state.skill
  const learnSubcategoryId = String(
    draftUser.subcategoryId || draftUser.subcategoriesWanted?.[0] || '',
  )
  const parentCategory = allSubcategories.find((sub) => String(sub.id) === learnSubcategoryId)
  const learnCategoryId = String(
    draftUser.categoryId ||
      parentCategory?.categoryId ||
      localStorage.getItem('register_category') ||
      '',
  )
  const images = (draftSkill.imagesUrl ?? []).filter(
    (image): image is string => typeof image === 'string',
  )

  return {
    email: draftUser.email ?? '',
    password: draftUser.password ?? '',
    name: draftUser.name ?? '',
    birthdate: toIsoBirthdate(draftUser.birthDate),
    gender: toApiGender(draftUser.gender),
    city: draftUser.city ?? '',
    wantToLearn: {
      categoryId: learnCategoryId,
      subcategoryId: learnSubcategoryId,
    },
    skill: {
      title: draftSkill.title ?? '',
      categoryId: String(draftSkill.categoryId ?? ''),
      subcategoryId: String(draftSkill.subcategoryId ?? ''),
      description: draftSkill.description ?? '',
      images,
    },
  }
}
