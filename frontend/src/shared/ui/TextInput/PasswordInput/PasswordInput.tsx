import { useState } from 'react'
import { TextInput } from '../TextInput/TextInput'
import styles from './PasswordInput.module.css'
import eyeIcon from '../../../assets/icons/eye.png'
import eyeSlashIcon from '../../../assets/icons/eye-slash.png'
import { IconButton } from '../../IconButton'
import type { InputHTMLAttributes } from 'react'

interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'className'
> {
  value: string
  onChange: (value: string) => void
  label?: string
  isError?: boolean
  placeholder?: string
  warningMessage?: string
}

export const PasswordInput = ({
  value,
  onChange,
  label = 'Пароль',
  isError,
  placeholder = 'Придумайте надежный пароль',
  warningMessage = 'Пароль должен содержать не менее 8 знаков',
  ...props
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <TextInput
      {...props}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      label={label}
      isError={isError}
      warningMessage={warningMessage}
      placeholder={placeholder}
      className={styles.passwordInput}
      rightSlot={
        <IconButton
          icon={<img src={visible ? eyeIcon : eyeSlashIcon} alt="глазик показать/скрыть пароль" />}
          onClick={() => setVisible((prev) => !prev)}
          type="button"
        />
      }
    />
  )
}
