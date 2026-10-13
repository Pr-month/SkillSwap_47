import { TextInput } from '../TextInput/TextInput'
import searchIcon from '../../../assets/icons/magnifier.png'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  isError?: boolean
  errorMessage?: string
  placeholder?: string
  name?: string
  autocomplete?: string
  showIcon?: boolean
  showClearButton?: boolean
}

export const SearchInput = ({
  value,
  onChange,
  name,
  showIcon = true,
  showClearButton = true,
  ...props
}: SearchInputProps) => {
  return (
    <TextInput
      name={name}
      {...props}
      value={value}
      autoComplete="off"
      onChange={onChange}
      type="text"
      leftSlot={showIcon ? <img src={searchIcon} alt="иконка поиска в виде лупы" /> : undefined}
      withClearButton={showClearButton}
      className={styles.searchInput}
    />
  )
}
