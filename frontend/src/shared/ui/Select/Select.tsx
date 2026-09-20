import { useCallback, useEffect, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { ArrowDown, ArrowUp } from '../../assets/icons'
import { Checkbox } from '../CheckboxInput'
import styles from './Select.module.css'

export interface SelectProps {
  className?: string
  label?: string
  placeholder?: string
  options?: string[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
}

function normalizeMultiple(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : []
}

export const Select = ({
  className,
  label,
  placeholder = 'Выберите значение',
  options = [],
  value,
  onChange,
  multiple = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const triggerId = useId()

  const singleValue = multiple ? '' : typeof value === 'string' ? value : ''
  const multipleValues = multiple ? normalizeMultiple(value) : []

  const displayText = multiple
    ? multipleValues.length > 0
      ? multipleValues.join(', ')
      : ''
    : singleValue

  const showPlaceholder = !displayText

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const toggleOpen = useCallback(() => {
    setOpen((o) => !o)
  }, [])

  const handleSelectSingle = useCallback(
    (option: string) => {
      onChange?.(option)
      setOpen(false)
    },
    [onChange],
  )

  const toggleMultipleOption = useCallback(
    (option: string) => {
      const current = normalizeMultiple(value)
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      onChange?.(next)
    },
    [onChange, value],
  )

  return (
    <div
      ref={containerRef}
      className={clsx(styles.mainContainer, className)}
      style={{ zIndex: open ? 2 : 1 }}
    >
      {label && (
        <label htmlFor={triggerId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={clsx(styles.field, open && styles.fieldOpen)}>
        <button
          id={triggerId}
          type="button"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={label ? undefined : placeholder}
          onClick={toggleOpen}
        >
          <span className={clsx(styles.displayValue, showPlaceholder && styles.placeholder)}>
            {showPlaceholder ? placeholder : displayText}
          </span>
          <span className={styles.arrow} aria-hidden>
            {open ? <ArrowUp /> : <ArrowDown />}
          </span>
        </button>

        {open && (
          <ul
            id={listId}
            className={styles.dropdown}
            role="listbox"
            aria-multiselectable={multiple ? true : undefined}
          >
            {multiple
              ? options.map((option) => (
                  <li key={option} className={styles.optionMultiple} role="presentation">
                    <Checkbox
                      className={styles.checkboxRow}
                      label={option}
                      checked={multipleValues.includes(option)}
                      showArrow={false}
                      value={option}
                      onChange={() => toggleMultipleOption(option)}
                    />
                  </li>
                ))
              : options.map((option) => (
                  <li key={option} className={styles.optionSingle}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option === singleValue}
                      className={styles.optionButton}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        handleSelectSingle(option)
                      }}
                    >
                      {option}
                    </button>
                  </li>
                ))}
          </ul>
        )}
      </div>
    </div>
  )
}
