import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/store/store'
import type { FC, ReactNode } from 'react'
import { useEffect } from 'react'

type Props = {
  children: ReactNode
}

const ProtectedRoute: FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const profileUser = useAppSelector((state) => state.user.profileUser)
  const isSessionChecked = useAppSelector((state) => state.user.isSessionChecked)

  useEffect(() => {
    if (isSessionChecked && !profileUser) {
      navigate('/login')
    }
  }, [isSessionChecked, profileUser, navigate])

  if (!isSessionChecked || !profileUser) return null

  return children
}

export default ProtectedRoute
