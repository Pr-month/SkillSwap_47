import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { Logo } from './Logo'

const routerDecorator = (Story: React.ComponentType) => (
  <MemoryRouter initialEntries={['/']}>
    <Story />
  </MemoryRouter>
)

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
  decorators: [routerDecorator],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Logo>

export const Default: Story = {
  args: {},
}
