import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useEffect } from 'react'
import { RadioInput } from './RadioInput'

const meta: Meta<typeof RadioInput> = {
  title: 'Components/RadioInput',
  component: RadioInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Радиокнопка с текстовой меткой. Используется в группах выбора одного значения.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст рядом с radio.',
    },
    value: {
      control: 'text',
      description: 'Значение, которое передаётся в onChange.',
    },
    name: {
      control: 'text',
      description: 'Имя группы radio-кнопок.',
    },
    checked: {
      control: 'boolean',
      description: 'Состояние выбора.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при выборе radio.',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS-класс.',
    },
  },
}

export default meta
type Story = StoryObj<typeof RadioInput>

const RadioStory = (args: React.ComponentProps<typeof RadioInput>) => {
  const [checked, setChecked] = useState(args.checked)

  useEffect(() => {
    setChecked(args.checked)
  }, [args.checked])

  return (
    <RadioInput
      {...args}
      checked={checked}
      onChange={(value) => {
        setChecked(true)
        args.onChange?.(value)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    label: 'Вариант 1',
    value: 'option-1',
    name: 'example-radio',
    checked: false,
  },
  render: (args) => <RadioStory {...args} />,
}

export const Selected: Story = {
  args: {
    label: 'Вариант 1',
    value: 'option-1',
    name: 'example-radio',
    checked: true,
  },
  render: (args) => <RadioStory {...args} />,
}
