import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { EditAvatar } from './EditAvatar'

const meta: Meta<typeof EditAvatar> = {
  title: 'Components/EditAvatar',
  component: EditAvatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Кнопка для изменения аватара. Показывает текущее изображение или заглушку и позволяет выбрать новый файл.',
      },
    },
  },
  argTypes: {
    value: {
      control: false,
      description: 'Выбранный файл.',
    },
    onChange: {
      action: 'changed',
      description: 'Срабатывает при выборе нового файла.',
    },
    avatarUrl: {
      control: 'text',
      description: 'Ссылка на аватар по умолчанию.',
    },
    alt: {
      control: 'text',
      description: 'Alt-текст изображения.',
    },
    className: {
      control: 'text',
      description: 'Дополнительный класс.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Подпись для кнопки.',
    },
  },
}

export default meta
type Story = StoryObj<typeof EditAvatar>

export const Default: Story = {
  args: {
    avatarUrl: '/images/users/default-avatar.png',
    alt: 'Аватар пользователя',
    ariaLabel: 'Изменить фото профиля',
  },
  render: (args) => {
    const [file, setFile] = useState<string | null>(null)

    return <EditAvatar {...args} value={file} onChange={(newFile) => setFile(newFile)} />
  },
}

export const WithoutAvatar: Story = {
  args: {
    avatarUrl: null,
    alt: 'Аватар пользователя',
    ariaLabel: 'Изменить фото профиля',
  },
  render: (args) => {
    const [file, setFile] = useState<string | null>(null)

    return <EditAvatar {...args} value={file} onChange={(newFile) => setFile(newFile)} />
  },
}
