import type { Meta, StoryObj } from '@storybook/react-vite'
import { InformationBlock } from './InformationBlock'

const meta: Meta<typeof InformationBlock> = {
  title: 'Components/InformationBlock',
  component: InformationBlock,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['offer-created', 'exchange-offered'],
      description: 'Тип информационного блока',
    },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof InformationBlock>

export const OfferCreated: Story = {
  args: {
    variant: 'offer-created',
  },
}

export const ExchangeOffered: Story = {
  args: {
    variant: 'exchange-offered',
  },
}
