import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { TextAreaInput } from './TextAreaInput'

const meta: Meta<typeof TextAreaInput> = {
  title: 'Components/TextInput/TextAreaInput',
  component: TextAreaInput,
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
type Story = StoryObj<typeof TextAreaInput>

const InteractiveTextAreaInput = (args: ComponentProps<typeof TextAreaInput>) => {
  const [value, setValue] = useState(args.value ?? '')

  return (
    <TextAreaInput
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
    placeholder: 'Введите описание',
    value: '',
  },
  render: (args) => <InteractiveTextAreaInput {...args} />,
}

export const WithLabel: Story = {
  args: {
    label: 'Описание',
    placeholder: 'Коротко опишите навык',
    value: '',
  },
  render: (args) => <InteractiveTextAreaInput {...args} />,
}

export const Filled: Story = {
  args: {
    label: 'Описание',
    value: 'Помогу разобраться с основами иллюстрации и подбором композиции.',
  },
  render: (args) => <InteractiveTextAreaInput {...args} />,
}

export const Error: Story = {
  args: {
    label: 'Описание',
    value: 'Слишком короткое описание',
    isError: true,
    warningMessage: 'Добавьте больше деталей о навыке',
  },
  render: (args) => <InteractiveTextAreaInput {...args} />,
}
