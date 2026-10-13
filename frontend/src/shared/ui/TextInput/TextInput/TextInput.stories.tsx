import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput/TextInput',
  component: TextInput,
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
    withClearButton: {
      control: 'boolean',
      description: 'Кнопка очистки',
    },
    onChange: {
      action: 'changed',
    },
  },
}

export default meta
type Story = StoryObj<typeof TextInput>

const InteractiveTextInput = (args: ComponentProps<typeof TextInput>) => {
  const [value, setValue] = useState(args.value ?? '')

  return (
    <TextInput
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
    placeholder: 'Введите текст',
    value: '',
  },
  render: (args) => <InteractiveTextInput {...args} />,
}

export const WithLabel: Story = {
  args: {
    label: 'Имя',
    placeholder: 'Введите ваше имя',
    value: '',
  },
  render: (args) => <InteractiveTextInput {...args} />,
}

export const Filled: Story = {
  args: {
    label: 'Имя',
    value: 'Мария',
    withClearButton: true,
  },
  render: (args) => <InteractiveTextInput {...args} />,
}

export const Error: Story = {
  args: {
    label: 'Email',
    placeholder: 'Введите email',
    value: 'petrov@mail.ru',
    isError: true,
    warningMessage: 'Email уже используется',
  },
  render: (args) => <InteractiveTextInput {...args} />,
}
