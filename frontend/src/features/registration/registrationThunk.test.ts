import { expect, test, describe } from '@jest/globals'

import { completeRegistration } from './registrationThunk'
import type { TSkill, TUser } from '../../shared/utils/types'
import store from '../../app/store/store'

describe('Тест completeRegistration', () => {
  test('Проверяем заполнение profileUser и profileSkill', async () => {
    const draftUser: Partial<TUser> = {
      name: 'Иван Козлов',
      city: 'Москва',
      birthDate: '1996-09-21',
      gender: 'male',
      email: 'ivan.kozlov@example.com',
      password: 'SkillSwap47!',
      about:
        'Пишу фронтенд, люблю свою работу, но чувствую, что упираюсь в языковой барьер. Хочу свободнее общаться и не бояться выступать перед людьми, делиться опытом и идеями.',
      subcategoriesWanted: [17, 6, 24],
      avatarUrl: '/images/users/8.png',
    }
    const draftSkill: Partial<TSkill> = {
      categoryId: 1,
      subcategoryId: 4,
      title: 'Спокойный личный бренд',
      description:
        'Я не кричу о себе — я просто делаю, и люди сами начинают замечать. Покажу, как выстраивать образ без показухи, через реальные действия, опыт и уверенность в том, что ты делаешь.',
      imagesUrl: [
        '/images/skills/sk8-1.png',
        '/images/skills/sk8-2.png',
        '/images/skills/sk8-3.png',
      ],
    }
    store.dispatch({ type: 'user/updateDraftUser', payload: draftUser })
    store.dispatch({ type: 'skill/updateDraftSkill', payload: draftSkill })
    await store.dispatch(completeRegistration())
    const state = store.getState()

    expect(state.user.profileUser).toMatchObject(draftUser)
    expect(state.skill.profileSkill).toMatchObject(draftSkill)
    expect(state.user.profileUser?.id).toBeDefined()
    expect(state.user.profileUser?.skillOfferedId).not.toBe(0)
    expect(state.user.profileUser?.skillOfferedId).toBe(state.skill.profileSkill?.id)
    expect(state.skill.profileSkill?.id).toBeDefined()
    expect(state.skill.profileSkill?.userId).toBe(state.user.profileUser?.id)
  })
  test('Проверяем ошибку(нет draftUser)', async () => {
    store.dispatch({ type: 'user/resetDraftUser' })
    store.dispatch({ type: 'skill/resetDraftSkill' })
    const testStore = store
    const result = await testStore.dispatch(completeRegistration())

    expect(result.type).toBe('auth/completeRegistration/rejected')
  })
  test('Проверяем ошибку(нет draftSkill)', async () => {
    store.dispatch({ type: 'user/resetDraftUser' })
    store.dispatch({ type: 'skill/resetDraftSkill' })
    const testStore = store
    testStore.dispatch({
      type: 'user/updateDraftUser',
      payload: { name: 'Иван' },
    })
    const result = await testStore.dispatch(completeRegistration())

    expect(result.type).toBe('auth/completeRegistration/rejected')
  })
})
