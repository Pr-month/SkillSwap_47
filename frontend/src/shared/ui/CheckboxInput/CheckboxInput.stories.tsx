import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, useEffect } from 'react'
import { Checkbox } from './CheckboxInput'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Чекбокс с поддержкой состояния checked, индикацией indeterminate и стрелкой для раскрываемых пунктов.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст рядом с чекбоксом.',
    },
    checked: {
      control: 'boolean',
      description: 'Состояние чекбокса.',
    },
    showArrow: {
      control: 'boolean',
      description: 'Показывать стрелку вверх/вниз.',
    },
    isIndeterminate: {
      control: 'boolean',
      description: 'Состояние частичного выбора.',
    },
    value: {
      control: 'text',
      description: 'Значение, которое передаётся в onChange.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при клике по чекбоксу.',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS-класс.',
    },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

const CheckboxStory = (args: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(args.checked)

  useEffect(() => {
    setChecked(args.checked)
  }, [args.checked])

  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(value) => {
        setChecked(!checked)
        args.onChange?.(value)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    label: 'Выбрать категорию',
    checked: false,
    showArrow: false,
    isIndeterminate: false,
    value: 'category',
  },
  render: (args) => <CheckboxStory {...args} />,
}

export const Checked: Story = {
  args: {
    label: 'Выбрать категорию',
    checked: true,
    showArrow: false,
    isIndeterminate: false,
    value: 'category',
  },
  render: (args) => <CheckboxStory {...args} />,
}

export const Indeterminate: Story = {
  args: {
    label: 'Выбрать категорию',
    checked: true,
    showArrow: true,
    isIndeterminate: true,
    value: 'category',
  },
  render: (args) => <CheckboxStory {...args} />,
}

export const Expandable: Story = {
  args: {
    label: 'Фильтр навыков',
    checked: false,
    showArrow: true,
    isIndeterminate: false,
    value: 'skills',
  },
  render: (args) => <CheckboxStory {...args} />,
}
