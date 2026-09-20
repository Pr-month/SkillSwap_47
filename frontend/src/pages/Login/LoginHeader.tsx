import React from 'react'
import authStyles from '../Auth/Auth.module.css'

export const LoginHeader: React.FC = () => {
  return (
    <div className={authStyles.stepHeader}>
      <h1 className={authStyles.stepTitle}>Вход</h1>
    </div>
  )
}
