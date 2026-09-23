import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataInput } from './DataInput'

const meta: Meta<typeof DataInput> = {
  title: 'Components/DataInput',
  component: DataInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Поле выбора даты с календарём. Использует AirDatepicker, поддерживает minDate/maxDate, onChange и onBlur.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст лейбла над полем.',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки под полем.',
    },
    value: {
      control: 'text',
      description: 'Текущая выбранная дата.',
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер в инпуте.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при выборе даты.',
    },
    onBlur: {
      action: 'blurred',
      description: 'Вызывается при закрытии календаря.',
    },
    minDate: {
      control: 'date',
      description: 'Минимально допустимая дата.',
    },
    maxDate: {
      control: 'date',
      description: 'Максимально допустимая дата.',
    },
  },
}

export default meta
type Story = StoryObj<typeof DataInput>

export const Default: Story = {
  args: {
    label: 'Дата рождения',
    placeholder: 'Выберите дату',
    value: '',
  },
}

export const WithError: Story = {
  args: {
    label: 'Дата рождения',
    placeholder: 'Выберите дату',
    error: 'Дата обязательна',
    value: '',
  },
}

export const WithLimits: Story = {
  args: {
    label: 'Дата рождения',
    placeholder: 'Выберите дату',
    minDate: '1990-01-01',
    maxDate: '2026-12-31',
    value: '',
  },
}
