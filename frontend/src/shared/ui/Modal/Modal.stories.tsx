import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '../Button/Button'
import { Modal } from './Modal'
import { ModalPortalRootContext } from './ModalPortalRootContext'

/**
 * На странице Docs монтируются несколько сторис сразу. Без этого все модалки
 * попадают в document.body и накладываются друг на друга (position: fixed по вьюпорту).
 * transform создаёт containing block для fixed — оверлей ограничивается этой обёрткой.
 */
const withScopedModalPortal: Decorator = (Story) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [, setReady] = useState(0)
  useLayoutEffect(() => {
    setReady((n) => n + 1)
  }, [])

  const portalHost = containerRef.current

  return (
    <div
      ref={containerRef}
      style={{
        transform: 'translateZ(0)',
        minHeight: 'min(520px, 85vh)',
        position: 'relative',
      }}
    >
      {portalHost ? (
        <ModalPortalRootContext.Provider value={portalHost}>
          <Story />
        </ModalPortalRootContext.Provider>
      ) : null}
    </div>
  )
}

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  decorators: [withScopedModalPortal],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Видимость модального окна',
    },
    isDropdown: {
      control: 'boolean',
      description: 'Режим выпадающего слоя (прозрачный оверлей)',
    },
    onClose: { action: 'closed' },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

export const Open: Story = {
  args: {
    isOpen: true,
    isDropdown: false,
    children: (
      <div style={{ padding: '24px', maxWidth: 360 }}>
        <h2 style={{ marginTop: 0 }}>Заголовок</h2>
        <p style={{ marginBottom: 0 }}>
          Содержимое модального окна. Клик по фону или Esc закрывает окно.
        </p>
      </div>
    ),
  },
}

export const Dropdown: Story = {
  args: {
    isOpen: true,
    isDropdown: true,
    children: (
      <div style={{ padding: '16px', minWidth: 200 }}>
        <p style={{ margin: 0 }}>Контент в режиме dropdown</p>
      </div>
    ),
  },
}

export const WithOpenButton: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)

    const handleClose = () => {
      setOpen(false)
      args.onClose?.()
    }

    return (
      <div>
        <Button type="button" variant="primary" onClick={() => setOpen(true)}>
          Открыть модалку
        </Button>
        <Modal
          {...args}
          isOpen={open}
          onClose={handleClose}
          children={
            <div style={{ padding: '24px', maxWidth: 400 }}>
              <h2 style={{ marginTop: 0 }}>Интерактивный пример</h2>
              <p>Окно открывается кнопкой снаружи и закрывается по оверлею, Esc или кнопке ниже.</p>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Закрыть
              </Button>
            </div>
          }
        />
      </div>
    )
  },
  args: {
    isDropdown: false,
  },
}
