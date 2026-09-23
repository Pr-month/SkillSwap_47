import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { getSkillsApi, createSkillApi, updateSkillApi } from '../../../api/skillsApi'
import { getCategoriesApi } from '../../../api/categoriesApi'
import { getSubcategoriesApi } from '../../../api/subcategoriesApi'
import type { TSkill, TCategory, TSubcategory } from '../../../shared/utils/types'

export type skillState = {
  allSkills: TSkill[]
  //используется очень много где. Например для компонента с фильтрами на главной
  //для компонента-списка, все навыки
  //для регистрации шаг 2
  allCategories: TCategory[]
  //аналогично как для категорий
  allSubcategories: TSubcategory[]
  draftSkill: Partial<TSkill>
  profileSkill: TSkill | null
  isForSwap: number[] //массив id навыков
  isLoading: boolean
  isLoadingCreateSkill: boolean
  isLoadingUpdateSkill: boolean
  error: string | null
  errorCreateSkill: string | null
  errorUpdateSkill: string | null
}

export const initialState: skillState = {
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

//обязательно запускается при инициализации приложения!!!
export const getAllSkills = createAsyncThunk<TSkill[]>('skill/getAllSkills', async () => {
  const data = await getSkillsApi()
  return data
})

//обязательно запускается при инициализации приложения!!!
export const getAllCategories = createAsyncThunk<TCategory[]>(
  'skill/getAllCategories',
  async () => {
    const data = await getCategoriesApi()
    return data
  },
)

//обязательно запускается при инициализации приложения!!!
export const getAllSubcategories = createAsyncThunk<TSubcategory[]>(
  'skill/getAllSubcategories',
  async () => {
    const data = await getSubcategoriesApi()
    return data
  },
)

//НЕ ВЫЗЫВАЕМ, ТЕПЕРЬ ЕСТЬ completeRegistration
export const createSkill = createAsyncThunk<TSkill, TSkill>(
  'skill/createSkill',
  async (skillData) => {
    const newSkill = await createSkillApi(skillData)
    return newSkill
  },
)

//вызывать при изменении полей на странице своего навыка(не при создании - в профиле)
//пример, изменение названия навыка : dispatch(updateSkill({ title: `${что пользователь ввел}` }))
export const updateSkill = createAsyncThunk<TSkill, Partial<TSkill>>(
  'skill/updateSkill',
  async (skillData) => {
    const data = await updateSkillApi(skillData)
    return data
  },
)

const skillSlice = createSlice({
  name: 'skill',
  initialState,
  reducers: {
    // вызывается каждый раз при изменении пользователем полей при создании скилл
    updateDraftSkill(state, action: PayloadAction<Partial<TSkill>>) {
      state.draftSkill = { ...state.draftSkill, ...action.payload }
    },
    //вызывается, когда регистрация закончена успешно и скилл создан и привязан успешно
    resetDraftSkill(state) {
      state.draftSkill = {}
    },
    addToSwap(state, action: PayloadAction<number>) {
      state.isForSwap.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllSkills.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllSkills.fulfilled, (state, action: PayloadAction<TSkill[]>) => {
        state.allSkills = action.payload
        state.isLoading = false
      })
      .addCase(getAllSkills.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось загрузить навыки'
      })
      .addCase(getAllCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllCategories.fulfilled, (state, action: PayloadAction<TCategory[]>) => {
        state.allCategories = action.payload
        state.isLoading = false
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось загрузить категории'
      })
      .addCase(getAllSubcategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAllSubcategories.fulfilled, (state, action: PayloadAction<TSubcategory[]>) => {
        state.allSubcategories = action.payload
        state.isLoading = false
      })
      .addCase(getAllSubcategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось загрузить подкатегории'
      })
      .addCase(createSkill.pending, (state) => {
        state.isLoadingCreateSkill = true
        state.errorCreateSkill = null
      })
      .addCase(createSkill.fulfilled, (state, action: PayloadAction<TSkill>) => {
        state.profileSkill = action.payload
        state.isLoadingCreateSkill = false
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.isLoadingCreateSkill = false
        state.errorCreateSkill = action.error.message || 'Не удалось создать навык'
      })
      .addCase(updateSkill.pending, (state) => {
        state.isLoadingUpdateSkill = true
        state.errorUpdateSkill = null
      })
      .addCase(updateSkill.fulfilled, (state, action: PayloadAction<TSkill>) => {
        state.profileSkill = action.payload
        state.isLoadingUpdateSkill = false
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.errorUpdateSkill = action.error.message || 'Не удалось обновить информацию о навыке'
        state.isLoadingUpdateSkill = false
      })
  },
})

export const { updateDraftSkill, resetDraftSkill, addToSwap } = skillSlice.actions
export default skillSlice.reducer
