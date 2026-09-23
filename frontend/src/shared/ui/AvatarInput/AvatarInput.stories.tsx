import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AvatarInput } from './AvatarInput'

const meta: Meta<typeof AvatarInput> = {
  title: 'Components/AvatarInput',
  component: AvatarInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Поле для загрузки аватара. При выборе файла переводит его в base64 и показывает превью изображения.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Текущее изображение в виде строки base64 или URL.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при выборе нового изображения.',
    },
  },
}

export default meta
type Story = StoryObj<typeof AvatarInput>

const AvatarInputStory = (args: React.ComponentProps<typeof AvatarInput>) => {
  const [value, setValue] = useState<string | undefined>(args.value)

  return (
    <AvatarInput
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
    value: undefined,
  },
  render: (args) => <AvatarInputStory {...args} />,
}
