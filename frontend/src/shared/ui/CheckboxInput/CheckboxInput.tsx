import clsx from 'clsx'
import styles from './CheckboxInput.module.css'
import { ArrowUp, ArrowDown } from '../../assets/icons'
import checkboxEmpty from '../../assets/svg/checkbox-empty.svg'
import checkboxActiveCheck from '../../assets/svg/checkbox-checked.svg'
import checkboxActiveMinus from '../../assets/svg/checkbox-minus.svg'

interface PropsCheckboxInput {
  label: string
  checked: boolean
  showArrow: boolean
  isIndeterminate?: boolean
  value?: string
  onChange: (value?: string) => void
  className?: string
}

const CheckboxInput = ({
  label,
  checked,
  showArrow,
  isIndeterminate = false,
  value,
  onChange,
  className,
}: PropsCheckboxInput) => {
  const handleChange = () => {
    onChange(value)
  }

  const iconSrc = !checked
    ? checkboxEmpty
    : isIndeterminate
      ? checkboxActiveMinus
      : checkboxActiveCheck

  return (
    <label
      className={clsx(
        styles.root,
        {
          [styles.expandable]: showArrow,
          [styles.simple]: !showArrow,
        },
        className,
      )}
    >
      <input type="checkbox" className={styles.input} checked={checked} onChange={handleChange} />

      <span className={styles.checkmark}>
        <img src={iconSrc} alt="" aria-hidden="true" className={styles.checkIcon} />
      </span>

      <span className={styles.label}>{label}</span>

      {showArrow && <span className={styles.arrow}>{checked ? <ArrowUp /> : <ArrowDown />}</span>}
    </label>
  )
}

export { CheckboxInput as Checkbox }
