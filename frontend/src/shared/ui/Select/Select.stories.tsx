import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Выпадающий список с поддержкой одиночного и множественного выбора. Поддерживает лейбл, placeholder и закрытие по клику вне компонента.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Дополнительный CSS-класс.',
    },
    label: {
      control: 'text',
      description: 'Подпись над селектом.',
    },
    placeholder: {
      control: 'text',
      description: 'Текст по умолчанию, если ничего не выбрано.',
    },
    options: {
      control: 'object',
      description: 'Список доступных опций.',
    },
    value: {
      control: false,
      description: 'Текущее значение. Для multiple — массив строк.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при выборе значения.',
    },
    multiple: {
      control: 'boolean',
      description: 'Включает множественный выбор.',
    },
  },
}

export default meta
type Story = StoryObj<typeof Select>

const SelectStory = (args: React.ComponentProps<typeof Select>) => {
  const [value, setValue] = useState(args.value)

  return (
    <Select
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue(newValue)
        args.onChange?.(newValue)
      }}
    />
  )
}

export const Single: Story = {
  args: {
    label: 'Выберите город',
    placeholder: 'Выберите значение',
    options: ['Москва', 'Санкт-Петербург', 'Казань'],
    value: '',
    multiple: false,
  },
  render: (args) => <SelectStory {...args} />,
}

export const Multiple: Story = {
  args: {
    label: 'Выберите навыки',
    placeholder: 'Выберите значение',
    options: ['React', 'TypeScript', 'Node.js', 'Docker'],
    value: [],
    multiple: true,
  },
  render: (args) => <SelectStory {...args} />,
}
