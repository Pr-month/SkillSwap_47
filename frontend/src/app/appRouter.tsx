import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { MainLayout } from '../layouts/MainLayout'

const HomePage = lazy(() => import('../pages/Home'))
const FavoritesPage = lazy(() => import('../pages/Favorites'))
const ProfilePage = lazy(() => import('../pages/Profile'))
const SkillPage = lazy(() => import('../pages/Skill'))
const AuthStepFirstPage = lazy(() => import('../pages/Auth/Step1/Step1'))
const AuthStepSecondPage = lazy(() => import('../pages/Auth/Step2/Step2'))
const AuthStepThirdPage = lazy(() => import('../pages/Auth/Step3/Step3'))
const LoginPage = lazy(() => import('../pages/Login/Login'))
const NotFoundPage = lazy(() => import('../pages/Error/NotFoundPage'))
const ServerErrorPage = lazy(() => import('../pages/Error/ServerErrorPage'))
const ProtectedRoute = lazy(() => import('../shared/lib/ProtectedRoute'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'skill/:id',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SkillPage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        children: [
          {
            path: 'step-1',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AuthStepFirstPage />
              </Suspense>
            ),
          },
          {
            path: 'step-2',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AuthStepSecondPage />
              </Suspense>
            ),
          },
          {
            path: 'step-3',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AuthStepThirdPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: '500',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ServerErrorPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}
