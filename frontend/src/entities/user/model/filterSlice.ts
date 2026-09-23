import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type filterState = {
  skillsType: 'all' | 'wantToLearn' | 'canTeach'
  selectedCategoryIds: number[]
  selectedSubcategoryIds: number[]
  gender: 'all' | 'male' | 'female'
  city: string[]
  searchText: string
}

export const initialState: filterState = {
  skillsType: 'all',
  selectedCategoryIds: [],
  selectedSubcategoryIds: [],
  gender: 'all',
  city: [],
  searchText: '',
}

export const isFiltersActive = (state: filterState): boolean =>
  state.skillsType !== initialState.skillsType ||
  state.gender !== initialState.gender ||
  state.searchText.trim() !== '' ||
  state.city.length > 0 ||
  state.selectedCategoryIds.length > 0 ||
  state.selectedSubcategoryIds.length > 0

//в стор передаем каждый раз новый, обновленный массив выбранных данных
// (кроме skillsTypeб gender, тут достаточно просто передавать новые данные, они будут заменяться - это радио кнопки)
const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSkillsType(state, action: PayloadAction<'all' | 'wantToLearn' | 'canTeach'>) {
      state.skillsType = action.payload
    },
    setSelectedCategories(state, action: PayloadAction<number[]>) {
      state.selectedCategoryIds = action.payload
    },
    setSelectedSubcategories(state, action: PayloadAction<number[]>) {
      state.selectedSubcategoryIds = action.payload
    },
    setGender(state, action: PayloadAction<'all' | 'male' | 'female'>) {
      state.gender = action.payload
    },
    setCity(state, action: PayloadAction<string[]>) {
      state.city = action.payload
    },
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload
    },
    resetFilters: () => initialState,
  },
})

export const {
  setSkillsType,
  setSelectedCategories,
  setSelectedSubcategories,
  setGender,
  setCity,
  setSearchText,
  resetFilters,
} = filterSlice.actions
export default filterSlice.reducer
