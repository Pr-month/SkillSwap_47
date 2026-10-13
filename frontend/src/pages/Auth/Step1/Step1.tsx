import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateDraftUser } from '../../../entities/user/model/userSlice'
import { getStep1Schema } from '../../../shared/lib/validation'
import lightBulb from '../../../shared/assets/svg/light-bulb.svg'
import googleIcon from '../../../shared/assets/svg/GoogleIcon.svg'
import appleIcon from '../../../shared/assets/svg/AppleIcon.svg'
import { ButtonUI } from '../../../shared/ui/Button'
import { PasswordInput, TextInput } from '../../../shared/ui/TextInput'
import { useAppDispatch, useAppSelector } from '../../../app/store/store'
import authStyles from '../Auth.module.css'
import { getAuthStepTitleId } from '../authStepIds'
import { RegistrationStepHeader } from '../RegistrationStepHeader'
import styles from './Step1.module.css'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import type { TUser } from '../../../shared/utils/types'

type Step1FormData = yup.InferType<ReturnType<typeof getStep1Schema>>
const AuthStepFirstPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { allUsers, draftUser } = useAppSelector((state) => state.user)

  const validationSchema = useMemo(() => {
    const emails = (allUsers as TUser[]).map((u) => u.email?.toLowerCase() || '')
    return getStep1Schema(emails)
  }, [allUsers])

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<Step1FormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched', // Валидация при взаимодействии
    defaultValues: {
      email: draftUser.email || '',
      password: draftUser.password || '',
    },
  })

  const onSubmit = (data: Step1FormData) => {
    dispatch(updateDraftUser(data))
    navigate('/register/step-2')
  }

  return (
    <section className={authStyles.page} aria-labelledby={getAuthStepTitleId(1)}>
      <RegistrationStepHeader step={1} />

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
                name="email"
                type="email"
                label="Email"
                placeholder="Введите email"
                value={getValues('email')}
                onChange={(value) => {
                  setValue('email', value, { shouldValidate: true })
                  dispatch(updateDraftUser({ email: value }))
                }}
                isError={!!errors.email}
                warningMessage={errors.email?.message}
              />
              <PasswordInput
                name="password"
                label="Пароль"
                placeholder="Придумайте надёжный пароль"
                value={getValues('password')}
                onChange={(value) => {
                  setValue('password', value, { shouldValidate: true })
                  dispatch(updateDraftUser({ password: value }))
                }}
                isError={!!errors.password}
                warningMessage={
                  errors.password?.message || 'Пароль должен содержать не менее 8 знаков'
                }
              />
            </div>
            <ButtonUI type="submit" className={styles.submit} disabled={!isValid}>
              Далее
            </ButtonUI>
            <div className={styles.loginContainer}>
              <span className={styles.loginText}>Уже есть аккаунт?</span>
              <ButtonUI
                type="button"
                className={styles.loginButton}
                onClick={() => navigate('/login')}
              >
                Войти
              </ButtonUI>
            </div>
          </form>
        </div>

        <aside
          className={`${authStyles.card} ${authStyles.supportCard}`}
          aria-label="Приветственный блок"
        >
          <div className={authStyles.supportContent}>
            <img src={lightBulb} alt="" className={styles.hintIcon} aria-hidden />
            <h2 className={authStyles.supportTitle}>Добро пожаловать в SkillSwap!</h2>
            <p className={authStyles.supportText}>
              Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default AuthStepFirstPage
