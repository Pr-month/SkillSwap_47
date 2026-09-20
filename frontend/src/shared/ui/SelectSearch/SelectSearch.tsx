import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './SelectSearch.module.css'
import { CloseIcon } from '../../assets/icons'
import { ArrowDown } from '../../assets/icons/ArrowDown'

export interface SelectSearchProps {
  className?: string
  label?: string
  placeholder?: string
  options?: string[]
  value?: string
  onChange?: (value: string) => void
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
  options = [],
  onChange,
  placeholder,
  label,
  value = '',
  className,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const listId = useId()
  const normalizedQuery = inputValue.trim()

  // 1. Синхронизация с внешним value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return

      setIsOpen(false)
      // Если текст в инпуте не совпадает ни с одним городом — откатываем назад
      if (inputValue !== '' && !options.includes(inputValue)) {
        setInputValue(value)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [inputValue, value, options])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        // При отмене сбрасываем невалидный ввод
        if (inputValue !== '' && !options.includes(inputValue)) {
          setInputValue(value)
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, inputValue, value, options])

  const filteredOptions = useMemo(() => {
    if (!isOpen) return []
    if (!normalizedQuery) return options
    return options.filter((option) =>
      option.toLowerCase().startsWith(normalizedQuery.toLowerCase()),
    )
  }, [options, normalizedQuery, isOpen])

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setInputValue('')
      setIsOpen(false)
      onChange?.('')
      inputRef.current?.focus()
    },
    [onChange],
  )

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue)
    setIsOpen(true)
    if (nextValue === '') {
      onChange?.('')
    }
  }

  const handleSelect = useCallback(
    (option: string) => {
      setInputValue(option)
      setIsOpen(false)
      onChange?.(option)
    },
    [onChange],
  )

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      inputRef.current?.focus()
    }
  }

  return (
    <div
      ref={containerRef}
      className={clsx(styles.mainContainer, className)}
      style={{ zIndex: isOpen ? 2 : 1 }} // Взято из Select.tsx
    >
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={clsx(styles.field, isOpen && styles.fieldOpen)}>
        <div className={styles.inputContainer} onClick={() => inputRef.current?.focus()}>
          <input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            value={inputValue}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={() => setIsOpen(true)}
          />

          <div className={styles.rightSlots} onClick={toggleOpen} style={{ cursor: 'pointer' }}>
            {inputValue && (
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleClear}
                aria-label="Очистить поле"
              >
                <CloseIcon />
              </button>
            )}
            <div className={clsx(styles.arrow, isOpen && styles.arrowOpen)}>
              <ArrowDown />
            </div>
          </div>
        </div>

        {isOpen && (
          <ul id={listId} className={styles.dropdown} role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option} className={styles.optionSingle}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === value}
                    className={styles.optionButton}
                    onMouseDown={(event) => {
                      // ВАЖНО: Взято из Select.tsx. Не дает инпуту потерять фокус до выбора!
                      event.preventDefault()
                      handleSelect(option)
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))
            ) : (
              <li className={styles.notFound}>Ничего не найдено</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
