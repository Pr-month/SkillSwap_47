import type { RootState } from '../../../app/store/store'
import { createSelector } from '@reduxjs/toolkit'

export const selectRawCities = (state: RootState) => state.city.allCity

export const selectCityNames = createSelector(
  [selectRawCities],
  (cities) => cities.map((city) => city.name)
)