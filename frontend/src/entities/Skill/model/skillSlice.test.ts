import { expect, test, describe } from '@jest/globals'

import skillSlice, {
  getAllSkills,
  getAllCategories,
  getAllSubcategories,
  createSkill,
  updateSkill,
  updateDraftSkill,
  resetDraftSkill,
  addToSwap,
  type skillState,
} from './skillSlice'
import type { TCategory, TSkill, TSubcategory } from '../../../shared/utils/types'

describe('Проверяем работу skillSlice', () => {
  const initialState: skillState = {
    allSkills: [],
    allCategories: [],
    allSubcategories: [],
    draftSkill: {},
    profileSkill: null,
    isForSwap: [],
    isLoading: false,
    isLoadingCreateSkill: false,
    isLoadingUpdateSkill: false,
    error: null,
    errorCreateSkill: null,
    errorUpdateSkill: null,
  }

  const testSkill: TSkill = {
    id: Date.now(),
    categoryId: 2,
    subcategoryId: 15,
    userId: 0,
    title: 'Творчество без рамок',
    description:
      'Иногда лучшие идеи приходят, когда перестаёшь думать о правилах. Покажу, как отпустить контроль и делать живые вещи.',
    imagesUrl: ['/images/skills/sk34-1.png', '/images/skills/sk34-2.png'],
    updatedAt: new Date().toISOString(),
  }

  const updatedTestSkill: TSkill = {
    ...testSkill,
    title: 'Творчество без рамок и иллюзий',
  }

  const testListSkills: TSkill[] = [
    {
      id: 17,
      categoryId: 2,
      subcategoryId: 1,
      userId: 17,
      title: 'Визуал руками',
      description:
        'Иногда лучше сделать что-то руками, чем через экран. Покажу, как создавать простые, но атмосферные вещи для пространства и съёмок.',
      imagesUrl: [
        '/images/skills/sk17-1.png',
        '/images/skills/sk17-2.png',
        '/images/skills/sk17-3.png',
      ],
      updatedAt: '2026-01-12T13:00:00Z',
    },
    {
      id: 14,
      categoryId: 1,
      subcategoryId: 2,
      userId: 14,
      title: 'Сложные разговоры',
      description:
        'Когда разговор неприятный — большинство избегает. Я нет. Покажу, как вести диалог спокойно, не теряя позиции и не скатываясь в конфликт.',
      imagesUrl: [
        '/images/skills/sk14-1.png',
        '/images/skills/sk14-2.png',
        '/images/skills/sk14-3.png',
        '/images/skills/sk14-4.png',
      ],
      updatedAt: '2026-02-05T10:10:00Z',
    },
    {
      id: 19,
      categoryId: 3,
      subcategoryId: 3,
      userId: 19,
      title: 'Японский в тишине',
      description:
        'Мне не близка гонка и перегруз, поэтому язык я учу иначе — спокойно, через повторение, атмосферу и ощущение ритма. Покажу, как разбирать японский без стресса и делать его частью тихих, восстановительных моментов.',
      imagesUrl: ['/images/skills/sk19-1.png', '/images/skills/sk19-2.png'],
      updatedAt: '2026-02-20T15:30:00Z',
    },
  ]

  const testListCategories: TCategory[] = [
    {
      id: 1,
      title: 'Бизнес и карьера',
    },
    {
      id: 2,
      title: 'Творчество и искусство',
    },
    {
      id: 3,
      title: 'Иностранные языки',
    },
  ]

  const testListSubcategories: TSubcategory[] = [
    {
      id: 2,
      title: 'Управление командой',
      categoryId: 1,
    },
    {
      id: 1,
      title: 'Рисование и иллюстрация',
      categoryId: 2,
    },
    {
      id: 3,
      title: 'Немецкий',
      categoryId: 3,
    },
  ]

  const stateAllSliceDataPending = {
    ...initialState,
    isLoading: true,
    error: null,
  }
  const stateGetAllSkillsFulfilled = {
    ...initialState,
    allSkills: testListSkills,
    isLoading: false,
  }
  const stateGetAllCategoriesFulfilled = {
    ...initialState,
    allCategories: testListCategories,
    isLoading: false,
  }
  const stateGetAllSubcategoriesFulfilled = {
    ...initialState,
    isLoading: false,
    allSubcategories: testListSubcategories,
  }
  const stateCreateSkillPending = {
    ...initialState,
    isLoadingCreateSkill: true,
    errorCreateSkill: null,
  }
  const stateCreateSkillFulfilled = {
    ...initialState,
    isLoadingCreateSkill: false,
    profileSkill: testSkill,
  }
  const stateUpdateSkillPending = {
    ...initialState,
    isLoadingUpdateSkill: true,
    errorUpdateSkill: null,
  }
  const stateUpdateSkillFulfilled = {
    ...initialState,
    profileSkill: updatedTestSkill,
    isLoadingUpdateSkill: false,
  }

  describe('getAllSkills', () => {
    test('проверяем работу pending', () => {
      const newStatePending = skillSlice(initialState, getAllSkills.pending('Loading...'))
      expect(newStatePending).toEqual(stateAllSliceDataPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = skillSlice(initialState, getAllSkills.fulfilled(testListSkills, ''))
      expect(newStateFulfilled).toEqual(stateGetAllSkillsFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = skillSlice(initialState, getAllSkills.rejected(new Error(), ''))
      expect(newStateRejected.error).toBe('Не удалось загрузить навыки')
      expect(newStateRejected.isLoading).toBe(false)
    })
  })
  describe('getAllCategories', () => {
    test('проверяем работу pending', () => {
      const newStatePending = skillSlice(initialState, getAllCategories.pending('Loading...'))
      expect(newStatePending).toEqual(stateAllSliceDataPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = skillSlice(
        initialState,
        getAllCategories.fulfilled(testListCategories, ''),
      )
      expect(newStateFulfilled).toEqual(stateGetAllCategoriesFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = skillSlice(initialState, getAllCategories.rejected(new Error(), ''))
      expect(newStateRejected.error).toBe('Не удалось загрузить категории')
      expect(newStateRejected.isLoading).toBe(false)
    })
  })
  describe('getAllSubcategories', () => {
    test('проверяем работу pending', () => {
      const newStatePending = skillSlice(initialState, getAllSubcategories.pending('Loading...'))
      expect(newStatePending).toEqual(stateAllSliceDataPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = skillSlice(
        initialState,
        getAllSubcategories.fulfilled(testListSubcategories, ''),
      )
      expect(newStateFulfilled).toEqual(stateGetAllSubcategoriesFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = skillSlice(
        initialState,
        getAllSubcategories.rejected(new Error(), ''),
      )
      expect(newStateRejected.error).toBe('Не удалось загрузить подкатегории')
      expect(newStateRejected.isLoading).toBe(false)
    })
  })
  describe('createSkill', () => {
    test('проверяем работу pending', () => {
      const newStatePending = skillSlice(initialState, createSkill.pending('Loading...', testSkill))
      expect(newStatePending).toEqual(stateCreateSkillPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = skillSlice(
        initialState,
        createSkill.fulfilled(testSkill, '', testSkill),
      )
      expect(newStateFulfilled).toEqual(stateCreateSkillFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = skillSlice(
        initialState,
        createSkill.rejected(new Error(), '', testSkill),
      )
      expect(newStateRejected.errorCreateSkill).toBe('Не удалось создать навык')
      expect(newStateRejected.isLoadingCreateSkill).toBe(false)
    })
  })
  describe('updateSkill', () => {
    test('проверяем работу pending', () => {
      const newStatePending = skillSlice(
        initialState,
        updateSkill.pending('Loading...', { title: 'Творчество без рамок и иллюзий' }),
      )
      expect(newStatePending).toEqual(stateUpdateSkillPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = skillSlice(
        initialState,
        updateSkill.fulfilled(updatedTestSkill, '', { title: 'Творчество без рамок и иллюзий' }),
      )
      expect(newStateFulfilled).toEqual(stateUpdateSkillFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = skillSlice(
        initialState,
        updateSkill.rejected(new Error(), '', { title: 'Творчество без рамок и иллюзий' }),
      )
      expect(newStateRejected.errorUpdateSkill).toBe('Не удалось обновить информацию о навыке')
      expect(newStateRejected.isLoadingUpdateSkill).toBe(false)
    })
  })

  describe('Проверяем работу reducers(updateDraftSkill, resetDraftSkill)', () => {
    const initialStateForDrafts = {
      ...initialState,
      draftSkill: {
        title: 'Минимум действий',
        description: 'Зачем.',
      },
    }
    test('updateDraftSkill добавляет новые данные', () => {
      const newState = skillSlice(
        initialStateForDrafts,
        updateDraftSkill({ description: 'Зачем. Затем.' }),
      )
      expect(newState).toEqual({
        ...initialStateForDrafts,
        draftSkill: {
          title: 'Минимум действий',
          description: 'Зачем. Затем.',
        },
      })
    })

    test('resetDraftUser очищает все данные', () => {
      const newState = skillSlice(initialStateForDrafts, resetDraftSkill())
      expect(newState).toEqual({ ...initialStateForDrafts, draftSkill: {} })
    })

    test('addToSwap добавляет id навыков в массив для обмена', () => {
      const newState = skillSlice(initialStateForDrafts, addToSwap(testListSkills[0].id))
      expect(newState.isForSwap).toEqual([17])
    })
  })
})
