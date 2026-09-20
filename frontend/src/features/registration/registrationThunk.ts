import { createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, updateUser } from '../../entities/user/model/userSlice'
import { createSkill } from '../../entities/Skill/model/skillSlice'
import type { RootState } from '../../app/store/store'
import type { TUser, TSkill, TRegisterData } from '../../shared/utils/types'

//вызфваем так dispatch(completeRegistration()) - даже ничего внутрь передавать не надо, thunk сделает все за вас,
//  главное - записывать в стор draftUser и draftSkill
export const completeRegistration = createAsyncThunk<
  { newUser: TUser; skill: TSkill },
  void,
  { state: RootState }
>('auth/completeRegistration', async (_, { getState, dispatch }) => {
  const { draftUser } = getState().user
  const { draftSkill } = getState().skill

  if (!draftUser || Object.keys(draftUser).length === 0) throw new Error('Нет данных пользователя')
  if (!draftSkill || Object.keys(draftSkill).length === 0) throw new Error('Нет данных навыка')

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
