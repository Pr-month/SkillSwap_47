import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import clsx from 'clsx'
import styles from './AvatarInput.module.css'
import avatarIcon from '../../assets/svg/avatar-icon.svg'

export type AvatarInputProps = {
  value: string | undefined
  onFileSelect: (file: File | undefined) => void
  isLoading?: boolean
  error?: string | null
}

export const AvatarInput = ({
  value,
  onFileSelect,
  isLoading = false,
  error = null,
}: AvatarInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      onFileSelect(undefined)
      return
    }

    onFileSelect(file)
    e.target.value = ''
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={clsx(styles.avatarInput, isLoading && styles.loading)}
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label={isLoading ? 'Загрузка аватара' : 'Выбрать аватар'}
      >
        <span className={styles.avatarWrapper}>
          {value ? (
            <img src={value} alt="Аватар" className={styles.image} />
          ) : (
            <img src={avatarIcon} alt="" className={styles.icon} />
          )}
          {isLoading ? <span className={styles.spinner} aria-hidden /> : <span className={styles.plus} />}
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className={styles.input}
          disabled={isLoading}
        />
      </button>
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  )
}
