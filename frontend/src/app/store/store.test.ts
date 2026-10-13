import { expect, test, describe } from '@jest/globals'

import { rootReducer } from './store'
import userSlice from '../../entities/user/model/userSlice'
import skillSlice from '../../entities/Skill/model/skillSlice'
import filterSlice from '../../entities/user/model/filterSlice'

describe('проверяем начальное состояние rootReducer', () => {
  test('', () => {
    const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' })
    expect(state).toEqual({
      user: userSlice(undefined, { type: 'UNKNOWN_ACTION' }),
      skill: skillSlice(undefined, { type: 'UNKNOWN_ACTION' }),
      filter: filterSlice(undefined, { type: 'UNKNOWN_ACTION' }),
    })
  })
})
