import type { TRegisterData, TSkill } from '../../shared/utils/types'

export type TRegisterWantToLearn = {
  categoryId: string
  subcategoryId: string
}

export type TRegisterSkillDto = {
  title: string
  categoryId: string
  subcategoryId: string
  description: string
  images?: string[]
}

export type TRegisterDto = {
  email: string
  password: string
  name: string
  birthdate: string
  gender: 'male' | 'female'
  city: string
  wantToLearn: TRegisterWantToLearn
  skill: TRegisterSkillDto
}

export type TRegisterDraftUser = Partial<TRegisterData> & {
  categoryId?: string
  subcategoryId?: string
}

const requireString = (value: string | undefined, fieldLabel: string): string => {
  const trimmed = value?.trim()
  if (!trimmed) {
    throw new Error(`Не заполнено поле: ${fieldLabel}`)
  }
  return trimmed
}

const mapGender = (gender: string | undefined): 'male' | 'female' => {
  const normalized = gender?.trim()

  if (normalized === 'Мужской' || normalized === 'male') {
    return 'male'
  }
  if (normalized === 'Женский' || normalized === 'female') {
    return 'female'
  }

  throw new Error('Укажите пол')
}

const mapBirthdate = (birthDate: string | undefined): string => {
  const value = requireString(birthDate, 'дата рождения')

  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  if (dotted) {
    const [, day, month, year] = dotted
    return `${year}-${month}-${day}`
  }

  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (iso) {
    return iso[1]
  }

  throw new Error('Некорректная дата рождения')
}

const resolveWantToLearnCategoryId = (draftUser: TRegisterDraftUser): string => {
  const fromDraft = draftUser.categoryId?.trim()
  if (fromDraft) {
    return fromDraft
  }

  const fromStorage = localStorage.getItem('register_category')?.trim()
  if (fromStorage) {
    return fromStorage
  }

  throw new Error('Не заполнено поле: категория для изучения')
}

const resolveWantToLearnSubcategoryId = (draftUser: TRegisterDraftUser): string => {
  const fromDraft = draftUser.subcategoryId?.trim()
  if (fromDraft) {
    return fromDraft
  }

  const fromWanted = draftUser.subcategoriesWanted?.[0]?.trim()
  if (fromWanted) {
    return fromWanted
  }

  throw new Error('Не заполнено поле: подкатегория для изучения')
}

export const buildRegisterDto = (
  draftUser: TRegisterDraftUser,
  draftSkill: Partial<TSkill>,
): TRegisterDto => {
  const skillImages = draftSkill.imagesUrl?.filter((url) => url.trim().length > 0)

  const skill: TRegisterSkillDto = {
    title: requireString(draftSkill.title, 'название навыка'),
    categoryId: requireString(draftSkill.categoryId, 'категория навыка'),
    subcategoryId: requireString(draftSkill.subcategoryId, 'подкатегория навыка'),
    description: requireString(draftSkill.description, 'описание навыка'),
  }

  if (skillImages && skillImages.length > 0) {
    skill.images = skillImages
  }

  return {
    email: requireString(draftUser.email, 'email'),
    password: requireString(draftUser.password, 'пароль'),
    name: requireString(draftUser.name, 'имя'),
    birthdate: mapBirthdate(draftUser.birthDate),
    gender: mapGender(draftUser.gender),
    city: requireString(draftUser.city, 'город'),
    wantToLearn: {
      categoryId: resolveWantToLearnCategoryId(draftUser),
      subcategoryId: resolveWantToLearnSubcategoryId(draftUser),
    },
    skill,
  }
}
