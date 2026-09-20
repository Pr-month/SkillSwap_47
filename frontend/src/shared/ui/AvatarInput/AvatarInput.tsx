import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import styles from './AvatarInput.module.css'
import avatarIcon from '../../assets/svg/avatar-icon.svg'

interface AvatarInputProps {
  value: string | undefined
  onChange: (base64: string | undefined) => void
}

export const AvatarInput = ({ value, onChange }: AvatarInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      onChange(undefined)
      return
    }

    // Перевод файла в base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      onChange(base64) // Отдаем наружу готовую строку!
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  return (
    <button type="button" className={styles.avatarInput} onClick={() => inputRef.current?.click()}>
      <span className={styles.avatarWrapper}>
        {value ? (
          <img src={value} alt="Аватар" className={styles.image} />
        ) : (
          <img src={avatarIcon} alt="Аватар пользователя" className={styles.icon} />
        )}
        <span className={styles.plus}></span>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className={styles.input}
      />
    </button>
  )
}
