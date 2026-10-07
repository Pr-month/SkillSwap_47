import React, { useRef } from 'react'
import clsx from 'clsx'
import styles from './PhotoInput.module.css'
import addIcon from '../../assets/icons/gallery-add.png'

export type PhotoInputProps = {
  value: string[]
  onFilesSelect: (files: File[]) => void
  onChange: (urls: string[]) => void
  onDelete?: (url: string) => void
  isLoading?: boolean
  error?: string | null
  multiple?: boolean
  accept?: string
}

export const PhotoInput: React.FC<PhotoInputProps> = ({
  value,
  onFilesSelect,
  onChange,
  onDelete,
  isLoading = false,
  error = null,
  multiple = true,
  accept,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelect(files)
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDelete = (url: string) => {
    onChange(value.filter((item) => item !== url))
    onDelete?.(url)
  }

  return (
    <div className={styles.wrapper}>
      <label className={clsx(styles.uploadBox, isLoading && styles.loading)}>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleSelect}
          className={styles.input}
          disabled={isLoading}
        />
        <div className={styles.hint}>
          {isLoading ? 'Загрузка изображений...' : 'Перетащите или выберите изображения навыка'}
        </div>
        <span className={styles.uploadContent}>
          <img src={addIcon} alt="" className={styles.icon} />
          Выбрать изображения
        </span>
      </label>

      {value.length > 0 && (
        <ul className={styles.fileList}>
          {value.map((url, index) => (
            <li key={url} className={styles.fileItem}>
              <img
                src={url}
                alt={`Фото ${index + 1}`}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginRight: '8px',
                }}
              />
              <span className={styles.fileName}>Изображение {index + 1}</span>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(url)}
                disabled={isLoading}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <span
          style={{
            color: '#bf3920',
            fontSize: '12px',
            display: 'block',
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  )
}
