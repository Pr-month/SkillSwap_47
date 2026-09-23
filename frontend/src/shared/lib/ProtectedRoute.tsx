import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/store/store'
import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'

type Props = {
  children: ReactNode
}

const ProtectedRoute: FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const isProfile = useAppSelector((state) => state.user.profileUser)
  useEffect(() => {
    if (!isProfile) {
      navigate('/login')
    }
  }, [isProfile, navigate])

  if (!isProfile) return null

  return children
}

export default ProtectedRoute
