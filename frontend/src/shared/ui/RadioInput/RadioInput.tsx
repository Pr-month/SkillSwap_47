import clsx from 'clsx'
import styles from './RadioInput.module.css'

export interface PropsRadioInput {
  label: string
  value?: string
  name: string
  checked: boolean
  onChange: (value: string) => void
  className?: string
}

export const RadioInput = ({
  label,
  value,
  name,
  checked,
  onChange,
  className,
}: PropsRadioInput) => {
  const radioValue = value ?? label

  const handleChange = () => {
    onChange(radioValue)
  }

  return (
    <label className={clsx(styles.root, className)}>
      <input
        type="radio"
        name={name}
        value={radioValue}
        checked={checked}
        onChange={handleChange}
        className={styles.input}
      />
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
