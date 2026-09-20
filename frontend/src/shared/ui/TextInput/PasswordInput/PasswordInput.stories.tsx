import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { PasswordInput } from './PasswordInput'

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/TextInput/PasswordInput',
  component: PasswordInput,
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
    warningMessage: {
      control: 'text',
      description: 'Текст под полем',
    },
    onChange: {
      action: 'changed',
    },
  },
}

export default meta
type Story = StoryObj<typeof PasswordInput>

const InteractivePasswordInput = (args: ComponentProps<typeof PasswordInput>) => {
  const [value, setValue] = useState(args.value ?? '')

  return (
    <PasswordInput
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
    value: '',
  },
  render: (args) => <InteractivePasswordInput {...args} />,
}

export const Filled: Story = {
  args: {
    value: 'Chereshnya123',
  },
  render: (args) => <InteractivePasswordInput {...args} />,
}

export const Error: Story = {
  args: {
    value: '12345',
    isError: true,
    warningMessage: 'Пароль должен содержать не менее 8 знаков',
  },
  render: (args) => <InteractivePasswordInput {...args} />,
}
