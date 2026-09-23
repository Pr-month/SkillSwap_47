import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store/store'
import { updateUser } from '../../entities/user/model/userSlice'
import { getStep1Schema } from '../../shared/lib/validation'
import { ValidationError } from 'yup'

import { SelectSearch } from '../../shared/ui/SelectSearch/SelectSearch'
import { TextAreaInput } from '../../shared/ui/TextInput/TextInput/TextAreaInput'
import { DataInput } from '../../shared/ui/DataInput/DataInput'
import { TextInput } from '../../shared/ui/TextInput/TextInput/TextInput'
import { Select } from '../../shared/ui/Select/Select'
import edit from '../../shared/assets/icons/edit.svg'
import request from '../../shared/assets/svg/request.svg'
import messageText from '../../shared/assets/svg/messageText.svg'
import like from '../../shared/assets/svg/like.svg'
import idea from '../../shared/assets/svg/idea.svg'
import userIcon from '../../shared/assets/svg/user.svg'

import styles from './ProfilePage.module.css'
import { Button } from '../../shared/ui/Button'
import { EditAvatar } from '../../shared/ui/EditAvatar'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()

  const isLoading = useAppSelector((state) => state.user.isLoadingUpdate)
  const users = useAppSelector((state) => state.user.allUsers)
  const user = useAppSelector((state) => state.user.profileUser)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)

  const safe = (v: unknown) => (typeof v === 'string' ? v : '')

  const [formData, setFormData] = useState({
    email: safe(user?.email),
    name: safe(user?.name),
    birthday: safe(user?.birthDate),
    gender: safe(user?.gender),
    city: safe(user?.city),
    about: safe(user?.about),
    avatarUrl: safe(user?.avatarUrl),
  })

  // Для автокомплита города, searchInput и textInput не поддерживают список вариантов городов
  const cities = useMemo(
    () => Array.from(new Set(users.map((user) => user.city))).filter(Boolean),
    [users],
  )

  const otherEmails = useMemo(() => {
    if (!user) return []
    return users
      .map((u) => u.email?.toLowerCase() || '')
      .filter((email) => email !== user?.email?.toLowerCase())
  }, [users, user])

  const validateEmail = async (value: string) => {
    if (!value) {
      setEmailError('Email обязателен')
      return false
    }

    try {
      const schema = getStep1Schema(otherEmails)
      await schema.validateAt('email', { email: value })
      setEmailError(undefined)
      return true
    } catch (err) {
      if (err instanceof ValidationError) {
        setEmailError(err.message)
        return false
      }
    }
  }
  // Требуется по тз но TextInput принимает onChange?: (value: string) => void

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (field === 'email') {
      validateEmail(value)
    }
  }

  /*  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }*/

  const isPristine =
    formData.name === safe(user?.name) &&
    formData.email === safe(user?.email) &&
    formData.city === safe(user?.city) &&
    formData.about === safe(user?.about) &&
    formData.gender === safe(user?.gender) &&
    formData.birthday === safe(user?.birthDate) &&
    formData.avatarUrl === safe(user?.avatarUrl)

  const isFormComplete =
    formData.email.trim() !== '' &&
    formData.name.trim() !== '' &&
    formData.birthday.trim() !== '' &&
    formData.gender !== '' &&
    formData.city.trim() !== '' &&
    formData.avatarUrl.trim() !== ''

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const isEmailValid = await validateEmail(formData.email)
    if (!isEmailValid) return
    if (!isFormComplete) return
    dispatch(updateUser(formData))
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <img src={request} alt="иконка заявки" />
            Заявки
          </li>
          <li className={styles.navItem}>
            <img src={messageText} alt="иконка сообщения" />
            Мои обмены
          </li>

          <li
            className={`${styles.navItem} ${styles.clickable} ${
              pathname === '/favorites' ? styles.active : ''
            }`}
            onClick={() => navigate('/favorites')}
          >
            <img src={like} alt="иконка избранного" />
            Избранное
          </li>

          <li className={styles.navItem}>
            <img src={idea} alt="иконка горящая лампочка" />
            Мои навыки
          </li>

          <li
            className={`${styles.navItem} ${styles.clickable} ${
              pathname === '/profile' ? styles.active : ''
            }`}
            onClick={() => navigate('/profile')}
          >
            <img src={userIcon} alt="иконка пользователя" />
            Личные данные
          </li>
        </ul>
      </aside>

      {/* Main */}
      <section className={styles.content}>
        <form className={styles.form} onSubmit={handleSave} key={user?.email || 'empty'}>
          <TextInput
            label="Почта"
            name="email"
            type="email"
            autoComplete="email"
            isError={!!emailError}
            warningMessage={emailError}
            value={formData.email}
            onChange={updateField('email')}
            rightSlot={<img src={edit} alt="редактировать" />}
          />

          <p className={styles.passwordStub}>Изменить пароль</p>

          <TextInput
            className={styles.input}
            label="Имя"
            name="name"
            value={formData.name}
            onChange={updateField('name')}
            rightSlot={<img src={edit} alt="редактировать" />}
            maxLength={50}
          />

          <div className={styles.row}>
            <div className={styles.field}>
              <DataInput
                label="Дата рождения"
                placeholder="дд.мм.гггг"
                value={formData.birthday}
                // Адаптируем onChange под логику вашего компонента
                onChange={(e: React.ChangeEvent<HTMLInputElement> | string) => {
                  const val = typeof e === 'string' ? e : e.target.value
                  updateField('birthday')(val)
                }}
                // Если нужно выводить ошибку пустой даты, можно добавить стейт для birthdayError
                error={formData.birthday.trim() === '' ? 'Обязательное поле' : undefined}
                minDate={new Date('1925-01-01')}
                maxDate={new Date()}
              />
            </div>

            <div className={styles.field}>
              <Select
                className={styles.selectInput}
                label="Пол"
                placeholder="Выберите пол"
                options={['Женский', 'Мужской']}
                value={formData.gender}
                onChange={(value) => updateField('gender')(value as string)}
              />
            </div>
          </div>

          <SelectSearch
            className={styles.cityInputOverride}
            label="Город"
            placeholder="Выберите город"
            options={cities}
            value={formData.city}
            onChange={(val) => {
              const valueStr = Array.isArray(val) ? val[0] : val
              updateField('city')(valueStr)
            }}
          />

          <TextAreaInput
            label="О себе"
            name="about"
            value={formData.about}
            onChange={updateField('about')}
            maxLength={500}
            placeholder="Расскажите о себе"
            rightSlot={<img src={edit} alt="редактировать" />}
          />
          <Button
            type="submit"
            variant="primary"
            className={styles.saveButton}
            disabled={isPristine || isLoading || !isFormComplete}
          >
            {isLoading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </form>
        <aside className={styles.rightColumn}>
          <EditAvatar
            value={formData.avatarUrl}
            avatarUrl={user?.avatarUrl}
            onChange={(base64) => updateField('avatarUrl')(base64 || '')}
          />
        </aside>
      </section>
    </div>
  )
}

export default ProfilePage
