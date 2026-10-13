import { createAsyncThunk } from '@reduxjs/toolkit'
import { setProfileSkill } from '../../entities/Skill/model/skillSlice'
import { setProfileUser } from '../../entities/user/model/userSlice'
import type { RootState } from '../../app/store/store'
import type { TSkill, TUser } from '../../shared/utils/types'
import { registerApi } from '../../api/authApi'
import { mapSkill } from '../../api/skillsApi'
import { mapUser } from '../../api/usersApi'
import { setAuthTokens } from '../../api/authTokenStorage'
import { RequestError } from '../../api/base'
import { toRegisterDto } from './registerDto'

const readServerError = (error: unknown): string => {
  if (error instanceof RequestError || (error instanceof Error && error.message)) {
    return error.message
  }

  return 'Не удалось зарегистрировать пользователя'
}

export { buildRegisterDto } from './buildRegisterDto'
export type {
  TRegisterDto,
  TRegisterDraftUser,
  TRegisterSkillDto,
  TRegisterWantToLearn,
} from './buildRegisterDto'

//вызфваем так dispatch(completeRegistration()) - даже ничего внутрь передавать не надо, thunk сделает все за вас,
//  главное - записывать в стор draftUser и draftSkill
export const completeRegistration = createAsyncThunk<
  { newUser: TUser; skill: TSkill },
  void,
  { state: RootState; rejectValue: string }
>('auth/completeRegistration', async (_, { getState, dispatch, rejectWithValue }) => {
  const { draftUser } = getState().user
  const { draftSkill, allSubcategories } = getState().skill

  if (!draftUser || Object.keys(draftUser).length === 0) throw new Error('Нет данных пользователя')
  if (!draftSkill || Object.keys(draftSkill).length === 0) throw new Error('Нет данных навыка')

  try {
    const response = await registerApi(toRegisterDto(getState()))
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })

    const rawSkill = response.user.skills?.[0]
    if (!rawSkill?.id) {
      return rejectWithValue('Не удалось зарегистрировать пользователя')
    }

    const newUser = mapUser(response.user)
    const mappedSkill = mapSkill(rawSkill)
    const parentCategory = allSubcategories.find(
      (sub) => String(sub.id) === mappedSkill.subcategoryId,
    )
    const skill: TSkill = {
      ...mappedSkill,
      userId: response.user.id,
      categoryId: parentCategory?.categoryId
        ? String(parentCategory.categoryId)
        : String(draftSkill.categoryId ?? mappedSkill.categoryId),
    }

    dispatch(setProfileUser(newUser))
    dispatch(setProfileSkill(skill))

    return { newUser, skill }
  } catch (error) {
    return rejectWithValue(readServerError(error))
  }
})
