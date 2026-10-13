import React from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Footer } from '../widgets/Footer'
import { Header } from '../widgets/Header'

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation()

  //ниже функция для рассчета текущего пути и замены хэдэра
  const getHeaderVariant = () => {
    if (pathname.startsWith('/register')) return 'auth'
    if (pathname.startsWith('/login')) return 'auth'

    // if (pathname.startsWith("/favorites")) return "favorites";
    // if (pathname.startsWith("/skill")) return "skill";
    return 'default'
  }
  const variant = getHeaderVariant()

  return (
    <div>
      <Header variant={variant} />
      <main>
        <Outlet />
      </main>
      {variant !== 'auth' && <Footer />}
    </div>
  )
}
