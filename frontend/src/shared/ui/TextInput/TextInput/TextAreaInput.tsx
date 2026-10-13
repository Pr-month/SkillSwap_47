import { useRef, useEffect, useId } from 'react'
import styles from './TextInput.module.css'
import clsx from 'clsx'

interface TextAreaInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  isError?: boolean
  warningMessage?: string
  placeholder?: string
  className?: string
  rightSlot?: React.ReactNode
  name?: string
  maxLength?: number
}

export const TextAreaInput = ({
  value,
  onChange,
  label,
  isError,
  warningMessage,
  placeholder,
  className,
  rightSlot,
  name,
  maxLength,
}: TextAreaInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const element = textareaRef.current
    if (element) {
      element.style.height = 'auto'
      element.style.height = element.scrollHeight + 'px'
    }
  }, [value])
  const generatedId = useId()
  const textareaId = name || generatedId
  return (
    <label htmlFor={textareaId} className={styles.mainContainer}>
      {label && <span className={styles.label}>{label}</span>}

      <div className={styles.inputContainer}>
        <textarea
          id={textareaId}
          name={name || textareaId}
          autoComplete={name}
          spellCheck={false}
          className={clsx(styles.input, isError && styles.errorInput, styles.textarea, className)}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          ref={textareaRef}
          maxLength={maxLength}
        />

        {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
      </div>

      {warningMessage && (
        <span className={clsx(styles.warningMessage, isError && styles.warningMessageFocus)}>
          {warningMessage}
        </span>
      )}
    </label>
  )
}
