import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import styles from './Modal.module.css'
import { useModalPortalRoot } from './ModalPortalRootContext'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  isDropdown?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  isDropdown,
  children,
  className,
}) => {
  const portalRoot = useModalPortalRoot()
  const portalContainer = portalRoot ?? document.body
  // Закрытие по Esc
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  // Блокировка скролла
  useEffect(() => {
    if (isOpen && !isDropdown) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isDropdown])

  // Закрытие по клику на overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className={clsx(styles.overlay, className)}
      onClick={handleOverlayClick}
      style={isDropdown ? { background: 'transparent' } : {}}
    >
      <div className={clsx(styles.modal, isDropdown && styles.dropdownStyles)}>{children}</div>
    </div>,
    portalContainer,
  )
}
