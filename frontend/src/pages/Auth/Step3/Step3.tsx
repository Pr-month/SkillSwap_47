import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

// Стейт
import { useAppDispatch, useAppSelector } from '../../../app/store/store'
import { updateDraftSkill } from '../../../entities/Skill/model/skillSlice'
import { completeRegistration } from '../../../features/registration/registrationThunk'
import { RegistrationPreviewModal } from '../../../widgets/Modals/RegistrationPreviewModal'

// UI Компоненты
import { Button as ButtonUI } from '../../../shared/ui/Button'
import { TextInput } from '../../../shared/ui/TextInput'
import { TextAreaInput } from '../../../shared/ui/TextInput'
import { Select } from '../../../shared/ui/Select'
import { PhotoInput } from '../../../shared/ui/PhotoInput'
import { RegistrationStepHeader } from '../RegistrationStepHeader'
import { getAuthStepTitleId } from '../authStepIds'
import { step3Schema } from '../../../shared/lib/validation'

// Стили и картинки
import authStyles from '../Auth.module.css'
import styles from './Step3.module.css'
import step3Illustration from '../../../shared/assets/svg/step3-illustration.svg'

type Step3FormData = yup.InferType<typeof step3Schema>

const AuthStepThirdPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Стейт для модалки
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false)

  // Данные из стора: вытаскиваем draftSkill, категории и статус загрузки
  const {
    draftSkill,
    allCategories: categories,
    allSubcategories: subcategories,
    isLoading,
  } = useAppSelector((state) => state.skill)

  // Настройка формы
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Step3FormData>({
    resolver: yupResolver(step3Schema),
    mode: 'onTouched', // Валидация при взаимодействии, как в Step 1
    defaultValues: {
      title: draftSkill.title || '',
      categoryId: draftSkill.categoryId ? String(draftSkill.categoryId) : '',
      subcategoryId: draftSkill.subcategoryId ? String(draftSkill.subcategoryId) : '',
      description: draftSkill.description || '',
      imagesUrl: (draftSkill.imagesUrl as string[]) || [],
    },
  })

  const categoryIdValue = watch('categoryId')
  const subcategoryIdValue = watch('subcategoryId')

  const filteredSubcategories = categoryIdValue
    ? subcategories.filter((sub) => String(sub.categoryId) === String(categoryIdValue))
    : subcategories
  const currentCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(categoryIdValue))
  }, [categories, categoryIdValue])
  const currentSubcategory = useMemo(() => {
    return filteredSubcategories.find((s) => String(s.id) === String(subcategoryIdValue))
  }, [filteredSubcategories, subcategoryIdValue])

  // Отправка формы
  const onSubmit = () => {
    setIsModalOpen(true)
  }

  const handleCompleteRegistration = async () => {
    try {
      setIsCompletingRegistration(true)
      await dispatch(completeRegistration()).unwrap()
      setIsModalOpen(false)
      navigate(`/`, { state: { openOfferCreatedModal: true } })
    } catch (error) {
      console.error('Ошибка при завершении регистрации:', error)
    } finally {
      setIsCompletingRegistration(false)
    }
  }

  return (
    <section className={authStyles.page} aria-labelledby={getAuthStepTitleId(3)}>
      <RegistrationStepHeader step={3} />

      <div className={authStyles.cards}>
        <div className={`${authStyles.card} ${styles.formCard}`}>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Название навыка */}

            <TextInput
              name="title"
              label="Название навыка"
              placeholder="Введите название вашего навыка"
              value={watch('title')}
              onChange={(value) => {
                setValue('title', value, { shouldValidate: true })
                dispatch(updateDraftSkill({ title: value }))
              }}
              isError={!!errors.title}
              warningMessage={errors.title?.message}
            />

            {/* Категория */}
            <Select
              label="Категория навыка"
              placeholder={isLoading ? 'Загрузка...' : 'Выберите категорию'}
              options={categories.map((c) => c.title || '')}
              value={currentCategory?.title || ''}
              onChange={(selectedTitle) => {
                const cat = categories.find((c) => c.title === selectedTitle)
                if (cat) {
                  const newCatId = String(cat.id)
                  setValue('categoryId', newCatId, { shouldValidate: true })
                  dispatch(updateDraftSkill({ categoryId: Number(newCatId) }))

                  // Очистка подкатегории, если она не подходит
                  if (currentSubcategory && String(currentSubcategory.categoryId) !== newCatId) {
                    setValue('subcategoryId', '', { shouldValidate: true })
                    dispatch(updateDraftSkill({ subcategoryId: 0 }))
                  }
                }
              }}
            />

            {/* Подкатегория */}
            <Select
              label="Подкатегория навыка"
              placeholder={isLoading ? 'Загрузка...' : 'Выберите подкатегорию'}
              options={filteredSubcategories.map((s) => s.title || '')}
              value={currentSubcategory?.title || ''}
              onChange={(selectedTitle) => {
                const sub = filteredSubcategories.find((s) => s.title === selectedTitle)
                if (sub) {
                  const newSubId = String(sub.id)
                  setValue('subcategoryId', newSubId, { shouldValidate: true })
                  dispatch(updateDraftSkill({ subcategoryId: Number(newSubId) }))

                  // Авто-выбор категории
                  const parentCatId = String(sub.categoryId)
                  if (categoryIdValue !== parentCatId) {
                    setValue('categoryId', parentCatId, { shouldValidate: true })
                    dispatch(updateDraftSkill({ categoryId: Number(parentCatId) }))
                  }
                }
              }}
            />

            {/* Описание */}
            <TextAreaInput
              label="Описание"
              placeholder="Коротко опишите, чему можете научить"
              value={watch('description')}
              onChange={(value) => {
                setValue('description', value, { shouldValidate: true })
                dispatch(updateDraftSkill({ description: value }))
              }}
              isError={!!errors.description}
              warningMessage={errors.description?.message}
            />

            {/* Загрузка изображений */}
            <div>
              <PhotoInput
                value={watch('imagesUrl') as string[]}
                onChange={(filesBase64) => {
                  setValue('imagesUrl', filesBase64, { shouldValidate: true })
                  dispatch(updateDraftSkill({ imagesUrl: filesBase64 }))
                }}
                multiple={true}
                accept="image/png, image/jpeg, image/webp"
              />
              {errors.imagesUrl && (
                <span
                  style={{
                    color: '#bf3920',
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  {errors.imagesUrl.message}
                </span>
              )}
            </div>

            {/* Кнопки Назад / Продолжить */}
            <div className={styles.row}>
              <ButtonUI
                type="button"
                variant="secondary"
                className={styles.actionButton}
                onClick={() => navigate('/register/step-2')}
              >
                Назад
              </ButtonUI>

              <ButtonUI
                type="submit"
                className={styles.actionButton}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Продолжить'}
              </ButtonUI>
            </div>
            <p>Размер ваших фото не должен превышать 3 МБ</p>
          </form>
        </div>

        <aside
          className={`${authStyles.card} ${authStyles.supportCard}`}
          aria-label="Информация о шаге"
        >
          <div className={authStyles.supportContent}>
            <img
              src={step3Illustration}
              alt="Иллюстрация"
              className={styles.hintIcon}
              aria-hidden
            />
            <h2 className={authStyles.supportTitle}>Укажите, чем вы готовы поделиться</h2>
            <p className={authStyles.supportText}>
              Так другие люди смогут увидеть ваши предложения и предложить вам обмен!
            </p>
          </div>
        </aside>
      </div>

      <RegistrationPreviewModal
        isOpen={isModalOpen}
        isSubmitting={isCompletingRegistration}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleCompleteRegistration}
        title={watch('title') || 'Без названия'}
        category={[currentCategory?.title, currentSubcategory?.title].filter(Boolean).join(' / ')}
        description={watch('description') || 'Описание не заполнено'}
        images={(watch('imagesUrl') as Array<string>) || []}
      />
    </section>
  )
}

export default AuthStepThirdPage
