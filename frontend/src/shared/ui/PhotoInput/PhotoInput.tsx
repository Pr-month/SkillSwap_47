import React, { useRef } from 'react'
import styles from './PhotoInput.module.css'
import addIcon from '../../assets/icons/gallery-add.png'

export type PhotoInputProps = {
  value: string[] // Теперь это массив строк (base64)
  onChange: (files: string[]) => void
  onDelete?: (file: string) => void
  multiple?: boolean
  accept?: string
}

export const PhotoInput: React.FC<PhotoInputProps> = ({
  value,
  onChange,
  onDelete,
  multiple = true,
  accept,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Вспомогательная функция для конвертации в base64 через Promise
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    }

    // Дожидаемся конвертации всех выбранных файлов
    const base64Files = await Promise.all(files.map(fileToBase64))

    // Убираем дубликаты
    const existing = new Set(value)
    const uniqueFiles = base64Files.filter((b64) => !existing.has(b64))
    const newFiles = [...value, ...uniqueFiles]

    onChange(newFiles)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDelete = (base64Str: string) => {
    const newFiles = value.filter((f) => f !== base64Str)
    onChange(newFiles)
    onDelete?.(base64Str)
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.uploadBox}>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleSelect}
          className={styles.input}
        />
        <div className={styles.hint}>Перетащите или выберите изображения навыка</div>
        <span className={styles.uploadContent}>
          <img src={addIcon} alt="Выбрать изображения" className={styles.icon} />
          Выбрать изображения
        </span>
      </label>

      {value.length > 0 && (
        <ul className={styles.fileList}>
          {value.map((b64, index) => (
            <li key={index} className={styles.fileItem}>
              {/* Показываем миниатюру, так как у строк base64 нет имени файла */}
              <img
                src={b64}
                alt="Фото"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginRight: '8px',
                }}
              />
              <span className={styles.fileName}>Изображение {index + 1}</span>
              <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(b64)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
