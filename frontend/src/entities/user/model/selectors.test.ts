import { expect, test, describe } from '@jest/globals'

import {
  selectFilteredUsers,
  selectPopularUsers,
  selectNewUsers,
  selectRecommendedUsers,
} from './selectors'
import type { RootState } from '../../../app/store/store'
import { initialState as userStateInitial } from './userSlice'
import { initialState as skillStateInitial } from '../../Skill/model/skillSlice'
import { initialState as filterStateInitial } from './filterSlice'

describe('Проверяем работу селекторов', () => {
  const initialState: RootState = {
    user: {
      ...userStateInitial,
      allUsers: [
        {
          id: 5,
          name: 'Анна Смирнова',
          city: 'Санкт-Петербург',
          birthDate: '1998-04-12',
          gender: 'female',
          email: 'anna.smirnova@example.com',
          password: 'SkillSwap47!',
          about:
            'Работаю в стартапе и часто ловлю себя на том, что не хватает уверенности в решениях и системности. Хочется лучше понимать процессы и спокойнее взаимодействовать с командой, особенно в стрессовые периоды.',
          skillOfferedId: 5,
          subcategoriesWanted: [2, 1, 6, 28],
          favoritesSkills: [9],
          createdAt: '2026-01-10T12:00:00Z',
          updatedAt: '2026-02-10T12:00:00Z',
          avatarUrl: '/images/users/5.png',
        },
        {
          id: 8,
          name: 'Иван Козлов',
          city: 'Москва',
          birthDate: '1996-09-21',
          gender: 'male',
          email: 'ivan.kozlov@example.com',
          password: 'SkillSwap47!',
          about:
            'Пишу фронтенд, люблю свою работу, но чувствую, что упираюсь в языковой барьер. Хочу свободнее общаться и не бояться выступать перед людьми, делиться опытом и идеями.',
          skillOfferedId: 8,
          subcategoriesWanted: [17, 6, 24],
          favoritesSkills: [9],
          createdAt: '2026-02-01T14:10:00Z',
          updatedAt: '2026-03-01T14:10:00Z',
          avatarUrl: '/images/users/8.png',
        },
        {
          id: 9,
          name: 'Шикамару Нара',
          city: 'Казань',
          birthDate: '1998-03-22',
          gender: 'male',
          email: 'shikamaru.nara@example.com',
          password: 'SkillSwap47!',
          about:
            'Предпочитаю минимальные усилия с максимальным результатом. Если можно не делать — лучше не делать. Но если делать, то идеально.',
          skillOfferedId: 9,
          subcategoriesWanted: [6, 25],
          favoritesSkills: [],
          createdAt: '2026-01-10T12:00:00Z',
          updatedAt: '2026-02-03T12:34:00Z',
          avatarUrl: '/images/users/9.png',
        },
      ],
    },
    skill: {
      ...skillStateInitial,
      allSkills: [
        {
          id: 5,
          categoryId: 1,
          subcategoryId: 7,
          userId: 5,
          title: 'Структура в хаосе',
          description:
            'Когда вокруг бардак — я начинаю видеть систему. Разложим процессы так, чтобы стало понятно, что делать, когда и зачем. Удивительно, как быстро всё начинает работать.',
          imagesUrl: ['/images/skills/sk5-1.png', '/images/skills/sk5-2.png'],
          updatedAt: '2026-02-10T12:00:00Z',
        },
        {
          id: 8,
          categoryId: 1,
          subcategoryId: 4,
          userId: 8,
          title: 'Спокойный личный бренд',
          description:
            'Я не кричу о себе — я просто делаю, и люди сами начинают замечать. Покажу, как выстраивать образ без показухи, через реальные действия, опыт и уверенность в том, что ты делаешь.',
          imagesUrl: [
            '/images/skills/sk8-1.png',
            '/images/skills/sk8-2.png',
            '/images/skills/sk8-3.png',
          ],
          updatedAt: '2025-04-05T12:34:00Z',
        },
        {
          id: 9,
          categoryId: 1,
          subcategoryId: 6,
          userId: 9,
          title: 'Минимум действий',
          description:
            'Зачем делать 10 шагов, если можно 3? Я не люблю делать лишнее. Если задачу можно решить проще — значит так и нужно. Я покажу, как видеть короткий путь там, где другие усложняют, и тратить энергию только на то, что реально даёт результат. Меньше движений, меньше шума — больше смысла.',
          imagesUrl: ['/images/skills/sk9-1.png', '/images/skills/sk9-2.png'],
          updatedAt: '2026-02-03T12:34:00Z',
        },
      ],
    },
    filter: filterStateInitial,
  }

  describe('Тест selectFilteredUsers', () => {
    test('selectFilteredUsers с изначальными фильтрами возвращает то же самое', () => {
      const result = selectFilteredUsers(initialState)
      expect(result).toEqual(initialState.user.allUsers)
    })
    test('selectFilteredUsers возращает отфильтрованных пользователей', () => {
      const newState: RootState = {
        ...initialState,
        filter: {
          skillsType: 'canTeach',
          selectedCategoryIds: [1],
          selectedSubcategoryIds: [6],
          gender: 'male',
          city: ['Казань'],
          searchText: 'Минимум',
        },
      }
      const result = selectFilteredUsers(newState)
      expect(result).toEqual([initialState.user.allUsers[2]])
    })
    test('selectFilteredUsers не возвращает ничего(нет таких навыков у пользователей)', () => {
      const newState: RootState = {
        ...initialState,
        filter: {
          ...filterStateInitial,
          skillsType: 'wantToLearn',
          selectedSubcategoryIds: [42],
        },
      }
      const result = selectFilteredUsers(newState)
      expect(result).toEqual([])
    })
    test('selectFilteredUsers не возвращает ничего(нет таких навыков у пользователей)', () => {
      const newState: RootState = {
        ...initialState,
        filter: {
          ...filterStateInitial,
          skillsType: 'all',
          selectedSubcategoryIds: [42],
        },
      }
      const result = selectFilteredUsers(newState)
      expect(result).toEqual([])
    })
    test('selectFilteredUsers не возвращает ничего(неверный поиск)', () => {
      const newState: RootState = {
        ...initialState,
        filter: {
          ...filterStateInitial,
          searchText: 'окак',
        },
      }
      const result = selectFilteredUsers(newState)
      expect(result).toEqual([])
    })
    test('selectFilteredUsers не возвращает ничего(нет пользователей с таким городом)', () => {
      const newState: RootState = {
        ...initialState,
        filter: {
          ...filterStateInitial,
          city: ['Магадан'],
        },
      }
      const result = selectFilteredUsers(newState)
      expect(result).toEqual([])
    })
  })

  describe('Тест selectPopularUsers', () => {
    test('selectPopularUsers фильтрует по популярности', () => {
      const result = selectPopularUsers(initialState)
      expect(result).toEqual([
        initialState.user.allUsers[2],
        initialState.user.allUsers[0],
        initialState.user.allUsers[1],
      ])
    })
  })

  describe('Тест selectNewUsers', () => {
    test('selectNewUsers фильтрует по дате', () => {
      const result = selectNewUsers(initialState)
      expect(result).toEqual([
        initialState.user.allUsers[1],
        initialState.user.allUsers[0],
        initialState.user.allUsers[2],
      ])
    })
  })

  describe('Тест selectRecommendedUsers', () => {
    test('selectRecommendedUsers возвращает тех же пользователей(порядок не важен)', () => {
      const result = selectRecommendedUsers(initialState)
      expect(result).toHaveLength(initialState.user.allUsers.length)
      expect(result).toEqual(expect.arrayContaining(initialState.user.allUsers))
    })
  })
})
