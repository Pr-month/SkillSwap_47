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
          'Поле для выбора файла аватара. Превью показывает URL; загрузка на сервер выполняется снаружи.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'URL превью аватара (/uploads/...).',
    },
    onFileSelect: {
      action: 'fileSelected',
      description: 'Вызывается при выборе файла.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Индикатор загрузки.',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки загрузки.',
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
      onFileSelect={(file) => {
        args.onFileSelect?.(file)
        if (!file) {
          setValue(undefined)
          return
        }
        setValue(URL.createObjectURL(file))
      }}
    />
  )
}

export const Default: Story = {
  args: {
    value: undefined,
    isLoading: false,
    error: null,
  },
  render: (args) => <AvatarInputStory {...args} />,
}

export const Loading: Story = {
  args: {
    value: undefined,
    isLoading: true,
    error: null,
  },
}

export const WithError: Story = {
  args: {
    value: undefined,
    isLoading: false,
    error: 'Не удалось загрузить аватар',
  },
}
