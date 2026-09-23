import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SelectSearch } from './SelectSearch'

const meta: Meta<typeof SelectSearch> = {
  title: 'Components/SelectSearch',
  component: SelectSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Поле выбора с поиском. Фильтрует список опций по вводу пользователя и позволяет выбрать одно значение.',
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
      description: 'Подпись над полем.',
    },
    placeholder: {
      control: 'text',
      description: 'Текст-подсказка в инпуте.',
    },
    options: {
      control: 'object',
      description: 'Список доступных опций.',
    },
    value: {
      control: false,
      description: 'Текущее выбранное значение.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при выборе значения или очистке.',
    },
  },
}

export default meta
type Story = StoryObj<typeof SelectSearch>

const SelectSearchStory = (args: React.ComponentProps<typeof SelectSearch>) => {
  const [value, setValue] = useState(args.value ?? '')

  return (
    <SelectSearch
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue(newValue)
        args.onChange?.(newValue)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    label: 'Город',
    placeholder: 'Начните вводить город',
    options: ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'],
    value: '',
  },
  render: (args) => <SelectSearchStory {...args} />,
}

export const WithInitialValue: Story = {
  args: {
    label: 'Город',
    placeholder: 'Начните вводить город',
    options: ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'],
    value: 'Москва',
  },
  render: (args) => <SelectSearchStory {...args} />,
}
