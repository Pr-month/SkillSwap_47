import { createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, updateUser } from '../../entities/user/model/userSlice'
import { createSkill } from '../../entities/Skill/model/skillSlice'
import type { RootState } from '../../app/store/store'
import type { TUser, TSkill, TRegisterData } from '../../shared/utils/types'
import { registerApi, type TRegisterBody } from '../../api/authApi'
import { setAuthTokens } from '../../api/authTokenStorage'
import { RequestError } from '../../api/base'

type RegistrationDraftUser = Partial<TRegisterData> & {
  categoryId?: string
  subcategoryId?: string
}

const readServerError = (error: unknown): string => {
  if (error instanceof RequestError || (error instanceof Error && error.message)) {
    return error.message
  }

  return 'Не удалось зарегистрировать пользователя'
}

const toRegisterDto = (state: RootState): TRegisterBody => {
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
    birthdate: draftUser.birthDate ?? '',
    gender: draftUser.gender ?? '',
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

//вызфваем так dispatch(completeRegistration()) - даже ничего внутрь передавать не надо, thunk сделает все за вас,
//  главное - записывать в стор draftUser и draftSkill
export const completeRegistration = createAsyncThunk<
  { newUser: TUser; skill: TSkill },
  void,
  { state: RootState; rejectValue: string }
>('auth/completeRegistration', async (_, { getState, dispatch, rejectWithValue }) => {
  const { draftUser } = getState().user
  const { draftSkill } = getState().skill

  if (!draftUser || Object.keys(draftUser).length === 0) throw new Error('Нет данных пользователя')
  if (!draftSkill || Object.keys(draftSkill).length === 0) throw new Error('Нет данных навыка')

  try {
    const response = await registerApi(toRegisterDto(getState()))
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
  } catch (error) {
    return rejectWithValue(readServerError(error))
  }

  const user = await dispatch(registerUser(draftUser as TRegisterData)).unwrap()

  const skill = await dispatch(
    createSkill({
      ...draftSkill,
      userId: user.id,
    } as TSkill),
  ).unwrap()

  const newUser = await dispatch(
    updateUser({
      skillOfferedId: skill.id,
    }),
  ).unwrap()

  return { newUser, skill }
})
