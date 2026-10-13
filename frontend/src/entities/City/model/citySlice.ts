import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { getCitiesApi } from '../../../api/citiesApi'
import type { TCity } from '../../../shared/utils/types'

export type CityState = {
  allCity: TCity[]
  isLoadingCities: boolean
  errorCities: string | null
}

const initialState: CityState = {
  allCity: [],
  isLoadingCities: false,
  errorCities: null,
}

export const getAllCities = createAsyncThunk<TCity[]>('city/getAllCities', async () => {
  const data = await getCitiesApi()
  return data
})

const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllCities.pending, (state) => {
        state.isLoadingCities = true
        state.errorCities = null
      })
      .addCase(getAllCities.fulfilled, (state, action) => {
        state.allCity = action.payload
        state.isLoadingCities = false
      })
      .addCase(getAllCities.rejected, (state, action) => {
        state.errorCities = action.error.message || 'Не удалось загрузить города'
        state.isLoadingCities = false
      })
  },
})

export default citySlice.reducer
