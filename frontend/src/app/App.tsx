import React, { useEffect } from 'react'
import { AppRouter } from './appRouter'
import './index.css'
import '../shared/assets/fonts/fonts.css'
import { getAllSkills, getAllCategories } from '../entities/Skill/model/skillSlice'
import { getAllUsers } from '../entities/user/model/userSlice'
import { useAppDispatch } from './store/store'
import { getAllCities } from '../entities/City/model/CitySlice'

const App: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const init = async () => {
      await dispatch(getAllSkills())
      await dispatch(getAllCategories())
      await dispatch(getAllUsers())
      await dispatch(getAllCities())
    }
    init()
  }, [dispatch])

  return <AppRouter />
}

export default App
