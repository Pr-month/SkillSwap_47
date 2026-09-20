import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Внешний вид кнопки',
    },
    disabled: {
      control: 'boolean',
      description: 'Состояние блокировки',
    },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Подробнее',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Подробнее',
  },
}

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Подробнее',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Недоступно',
    disabled: true,
  },
}
