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
          'Поле для загрузки нескольких изображений. Конвертирует файлы в base64, показывает список выбранных картинок и позволяет удалять их.',
      },
    },
  },
  argTypes: {
    value: {
      control: false,
      description: 'Массив base64-строк с изображениями.',
    },
    onChange: {
      action: 'changed',
      description: 'Вызывается при добавлении или удалении изображений.',
    },
    onDelete: {
      action: 'deleted',
      description: 'Вызывается при удалении конкретного изображения.',
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
      onChange={(newFiles) => {
        setValue(newFiles)
        args.onChange?.(newFiles)
      }}
      onDelete={(file) => {
        args.onDelete?.(file)
      }}
    />
  )
}

export const Default: Story = {
  args: {
    value: [],
    multiple: true,
    accept: 'image/*',
  },
  render: (args) => <PhotoInputStory {...args} />,
}
