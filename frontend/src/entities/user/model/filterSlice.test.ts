import { expect, test, describe } from '@jest/globals'

import filterSlice, {
  setSkillsType,
  setSelectedCategories,
  setSelectedSubcategories,
  setGender,
  setCity,
  setSearchText,
  resetFilters,
  type filterState,
} from './filterSlice'

describe('Проверяем работу filterSlice', () => {
  const initialState: filterState = {
    skillsType: 'all',
    selectedCategoryIds: [],
    selectedSubcategoryIds: [],
    gender: 'all',
    city: [],
    searchText: '',
  }

  describe('Проверяем работу reducers', () => {
    describe('setSkillsType', () => {
      test('setSkillsType устанавливает wantToLearn', () => {
        const newState = filterSlice(initialState, setSkillsType('wantToLearn'))
        expect(newState.skillsType).toBe('wantToLearn')
      })
      test('setSkillsType устанавливает canTeach', () => {
        const newState = filterSlice(initialState, setSkillsType('canTeach'))
        expect(newState.skillsType).toBe('canTeach')
      })
      test('setSkillsType устанавливает all', () => {
        const prevState: filterState = { ...initialState, skillsType: 'wantToLearn' }
        const newState = filterSlice(prevState, setSkillsType('all'))
        expect(newState.skillsType).toBe('all')
      })
    })
    describe('setSelectedCategories', () => {
      test('setSelectedCategories устанавливает категории', () => {
        const prevState: filterState = { ...initialState, selectedCategoryIds: [1, 3, 5] }
        const newState = filterSlice(prevState, setSelectedCategories([4, 6]))
        expect(newState.selectedCategoryIds).toEqual([4, 6])
      })
    })
    describe('setSelectedSubcategories', () => {
      test('setSelectedSubcategories устанавливает подкатегории', () => {
        const prevState: filterState = { ...initialState, selectedSubcategoryIds: [1, 17, 32] }
        const newState = filterSlice(prevState, setSelectedSubcategories([42, 12, 5]))
        expect(newState.selectedSubcategoryIds).toEqual([42, 12, 5])
      })
    })
    describe('setGender', () => {
      test('setGender устанавливает female', () => {
        const newState = filterSlice(initialState, setGender('female'))
        expect(newState.gender).toBe('female')
      })
      test('setGender устанавливает male', () => {
        const newState = filterSlice(initialState, setGender('male'))
        expect(newState.gender).toBe('male')
      })
      test('setGender устанавливает all', () => {
        const prevState: filterState = { ...initialState, gender: 'male' }
        const newState = filterSlice(prevState, setGender('all'))
        expect(newState.gender).toBe('all')
      })
    })
    describe('setCity', () => {
      test('setCity устанавливает города', () => {
        const prevState: filterState = { ...initialState, city: ['Тула, Магадан'] }
        const newState = filterSlice(prevState, setCity(['Москва']))
        expect(newState.city).toEqual(['Москва'])
      })
    })
    describe('setSearchText', () => {
      test('setSearchText устанавливает введенный в поиск текст', () => {
        const newState = filterSlice(initialState, setSearchText('Какой-то навык'))
        expect(newState.searchText).toBe('Какой-то навык')
      })
    })
    describe('resetFilters', () => {
      test('resetFilters очищает заданные фильтры', () => {
        const prevState: filterState = {
          ...initialState,
          city: ['Тула, Магадан'],
          gender: 'male',
          skillsType: 'wantToLearn',
        }
        const newState = filterSlice(prevState, resetFilters())
        expect(newState).toEqual(initialState)
      })
    })
  })
})
