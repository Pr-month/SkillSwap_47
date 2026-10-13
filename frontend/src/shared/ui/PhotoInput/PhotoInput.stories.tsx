import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PhotoInput } from './PhotoInput'

const meta: Meta<typeof PhotoInput> = {
  title: 'Components/PhotoInput',
  component: PhotoInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Поле выбора изображений навыка. Отдаёт File[] наружу; value — массив URL для превью.',
      },
    },
  },
  argTypes: {
    value: {
      control: false,
      description: 'Массив URL изображений.',
    },
    onFilesSelect: {
      action: 'filesSelected',
      description: 'Вызывается при выборе новых файлов.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при удалении / синхронизации списка URL.',
    },
    onDelete: {
      action: 'deleted',
      description: 'Вызывается при удалении конкретного изображения.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Блокирует выбор во время загрузки.',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки загрузки.',
    },
    multiple: {
      control: 'boolean',
      description: 'Разрешить выбор нескольких файлов.',
    },
    accept: {
      control: 'text',
      description: 'Типы принимаемых файлов.',
    },
  },
}

export default meta
type Story = StoryObj<typeof PhotoInput>

const PhotoInputStory = (args: React.ComponentProps<typeof PhotoInput>) => {
  const [value, setValue] = useState<string[]>(args.value)

  return (
    <PhotoInput
      {...args}
      value={value}
      onFilesSelect={(files) => {
        args.onFilesSelect?.(files)
        setValue((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))])
      }}
      onChange={(urls) => {
        setValue(urls)
        args.onChange?.(urls)
      }}
      onDelete={(url) => {
        args.onDelete?.(url)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    value: [],
    multiple: true,
    accept: 'image/*',
    isLoading: false,
    error: null,
  },
  render: (args) => <PhotoInputStory {...args} />,
}

export const WithError: Story = {
  args: {
    value: [],
    multiple: true,
    accept: 'image/*',
    isLoading: false,
    error: 'Не загружено файлов: 1',
  },
}
