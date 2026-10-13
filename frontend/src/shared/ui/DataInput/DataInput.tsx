import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import AirDatepicker from 'air-datepicker'
import localeRu from 'air-datepicker/locale/ru'
import 'air-datepicker/air-datepicker.css'

import { TextInput } from '../TextInput/TextInput/TextInput'
import buttonStyles from '../Button/Button.module.css'
import styles from './DataInput.module.css'
import calendarIcon from '../../assets/icons/calendarIcon.svg'

interface DataInputProps {
  label?: string
  error?: string
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onBlur?: () => void // ДОБАВЛЕНО: Явно типизируем onBlur от react-hook-form
  minDate?: Date | string | number
  maxDate?: Date | string | number
  className?: string
}

export const DataInput = forwardRef<HTMLInputElement, DataInputProps>(
  (
    {
      label,
      error,
      value,
      onChange,
      onBlur, // ДОБАВЛЕНО: Вытаскиваем onBlur, чтобы он не попал в TextInput напрямую
      placeholder = 'Выберите дату',
      minDate,
      maxDate,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    // Сохраняем функции в ref, чтобы календарь их видел, но не перерисовывался
    const onChangeRef = useRef(onChange)
    const onBlurRef = useRef(onBlur)

    useEffect(() => {
      onChangeRef.current = onChange
      onBlurRef.current = onBlur
    }, [onChange, onBlur])

    const minDateMs = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : undefined
    const maxDateMs = maxDate ? new Date(maxDate).setHours(0, 0, 0, 0) : undefined

    useEffect(() => {
      if (!inputRef.current) return

      const dp = new AirDatepicker(inputRef.current, {
        locale: localeRu,
        autoClose: false,
        isMobile: false,
        minDate: minDateMs ? new Date(minDateMs) : undefined,
        maxDate: maxDateMs ? new Date(maxDateMs) : undefined,
        onSelect: ({ formattedDate }) => {
          const dateStr = Array.isArray(formattedDate) ? formattedDate[0] : formattedDate
          if (onChangeRef.current && dateStr) {
            onChangeRef.current(dateStr)
          }
        },
        // Вызываем onBlur (валидацию) ТОЛЬКО когда календарь полностью закрывается
        onHide: () => {
          if (onBlurRef.current) {
            onBlurRef.current()
          }
        },
        buttons: [
          {
            content: 'Отменить',
            className: `${buttonStyles.button} ${buttonStyles.secondary}`,
            onClick: (inst) => inst.hide(),
          },
          {
            content: 'Выбрать',
            className: `${buttonStyles.button} ${buttonStyles.primary}`,
            onClick: (inst) => inst.hide(),
          },
        ],
      })

      return () => {
        dp.destroy()
      }
    }, [minDateMs, maxDateMs])

    const icon = <img src={calendarIcon} alt="Календарь" width="20" height="20" />

    return (
      <div className={styles.wrapper}>
        <TextInput
          ref={inputRef}
          label={label}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          isError={!!error}
          warningMessage={error}
          rightSlot={icon}
          readOnly
          {...props}
        />
      </div>
    )
  },
)

DataInput.displayName = 'DataInput'
