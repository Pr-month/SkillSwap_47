import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { SearchInput } from './SearchInput'

const meta: Meta<typeof SearchInput> = {
  title: 'Components/TextInput/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Подпись поля',
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер',
    },
    isError: {
      control: 'boolean',
      description: 'Состояние ошибки',
    },
    onChange: {
      action: 'changed',
    },
  },
}

export default meta
type Story = StoryObj<typeof SearchInput>

const InteractiveSearchInput = (args: ComponentProps<typeof SearchInput>) => {
  const [value, setValue] = useState(args.value ?? '')

  return (
    <SearchInput
      {...args}
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue)
        args.onChange?.(nextValue)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    placeholder: 'Искать навык',
    value: '',
  },
  render: (args) => <InteractiveSearchInput {...args} />,
}

export const Filled: Story = {
  args: {
    placeholder: 'Искать навык',
    value: 'Тайм-менеджмент',
  },
  render: (args) => <InteractiveSearchInput {...args} />,
}

export const WithLabel: Story = {
  args: {
    label: 'Поиск',
    placeholder: 'Искать навык',
    value: '',
  },
  render: (args) => <InteractiveSearchInput {...args} />,
}
