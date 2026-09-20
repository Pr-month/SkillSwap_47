import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useAppDispatch } from '../../app/store/store'
import { loginUser } from '../../entities/user/model/userSlice'

import { ButtonUI } from '../../shared/ui/Button'
import { LoginHeader } from './LoginHeader'
import { PasswordInput, TextInput } from '../../shared/ui/TextInput'
import { validationSchema } from '../../shared/lib/validation'

import lightBulb from '../../shared/assets/svg/light-bulb.svg'
import googleIcon from '../../shared/assets//svg/GoogleIcon.svg'
import appleIcon from '../../shared/assets/svg/AppleIcon.svg'

import authStyles from '../Auth/Auth.module.css'
import styles from './Login.module.css'

type LoginFormData = yup.InferType<typeof validationSchema>

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {
    handleSubmit,
    setValue,
    getValues,
    register,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Валидация при взаимодействии
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser({ email: data.email, password: data.password })).unwrap()
      navigate('/profile')
    } catch (err) {
      console.error('Ошибка входа:', err)
    }
  }

  return (
    <section className={authStyles.page} aria-labelledby="login-title">
      <LoginHeader />

      <div className={authStyles.cards}>
        <div className={`${authStyles.card} ${styles.formCard}`}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.socialButtons}>
              <ButtonUI type="button" variant="secondary" className={styles.socialButton}>
                <img src={googleIcon} alt="" aria-hidden />
                <span>Продолжить с Google</span>
              </ButtonUI>
              <ButtonUI type="button" variant="secondary" className={styles.socialButton}>
                <img src={appleIcon} alt="" aria-hidden />
                <span>Продолжить с Apple</span>
              </ButtonUI>
            </div>

            <p className={styles.divider}>или</p>

            <div className={styles.fields}>
              <TextInput
                {...register('email')}
                name="email"
                type="email"
                label="Email"
                placeholder="Введите email"
                value={getValues('email') || ''}
                onChange={(value) => setValue('email', value, { shouldValidate: true })}
                isError={!!errors.email}
                warningMessage={errors.email?.message}
              />
              <PasswordInput
                {...register('password')}
                name="password"
                label="Пароль"
                placeholder="Введите ваш пароль"
                value={getValues('password') || ''}
                onChange={(value) => setValue('password', value, { shouldValidate: true })}
                isError={!!errors.password}
                warningMessage={
                  errors.password?.message || 'Пароль должен содержать не менее 8 знаков'
                }
              />
            </div>

            <ButtonUI type="submit" variant="primary" className={styles.submit} disabled={!isValid}>
              Войти
            </ButtonUI>
            <ButtonUI
              type="button"
              className={styles.registerButton}
              onClick={() => navigate('/register/step-1')}
            >
              Зарегистрироваться
            </ButtonUI>
          </form>
        </div>

        <aside
          className={`${authStyles.card} ${authStyles.supportCard}`}
          aria-label="Приветственный блок"
        >
          <div className={authStyles.supportContent}>
            <img src={lightBulb} alt="" className={styles.hintIcon} aria-hidden />
            <h2 className={authStyles.supportTitle}>С возвращением в SkillSwap!</h2>
            <p className={authStyles.supportText}>
              Обменивайтесь знаниями и навыками с другими людьми
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default LoginPage
