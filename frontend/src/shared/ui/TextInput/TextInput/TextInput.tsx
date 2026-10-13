import {
  type ChangeEvent,
  type ReactNode,
  forwardRef,
  type InputHTMLAttributes,
  useId,
} from 'react'
import clsx from 'clsx'
import styles from './TextInput.module.css'
import crossIcon from '../../../assets/icons/cross.png'
import { IconButton } from '../../IconButton'

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  label?: string
  name?: string
  isError?: boolean
  warningMessage?: string
  rightSlot?: ReactNode
  leftSlot?: ReactNode
  className?: string
  withClearButton?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      label,
      name,
      isError,
      warningMessage,
      rightSlot,
      leftSlot,
      type = 'text',
      className,
      withClearButton = false,
      autoComplete,
      id,
      ...props
    },
    ref,
  ) => {
    // ✅ стабильный id (React 18)
    const generatedId = useId()
    const inputId = id || name || generatedId

    return (
      <div className={styles.mainContainer}>
        {/* ✅ правильная связка label */}
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.inputContainer}>
          {leftSlot && <div className={styles.leftSlot}>{leftSlot}</div>}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            autoComplete={autoComplete || name}
            spellCheck={false}
            className={clsx(
              styles.input,
              isError && styles.errorInput,
              className,
              leftSlot && styles.shrinkInput,
            )}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
            {...props}
          />

          {/* ✅ правый слот */}
          {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}

          {/* ✅ кнопка очистки */}
          {withClearButton && value && (
            <div className={styles.rightSlot}>
              <IconButton
                type="button"
                icon={<img src={crossIcon} alt="очистить поле" />}
                onClick={() => onChange?.('')}
              />
            </div>
          )}
        </div>

        {/* ✅ warning / error */}
        {warningMessage && (
          <span className={clsx(styles.warningMessage, isError && styles.warningMessageFocus)}>
            {warningMessage}
          </span>
        )}
      </div>
    )
  },
)

TextInput.displayName = 'TextInput'
