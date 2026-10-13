import { useEffect, type RefObject } from 'react'

interface UseDismissOptions {
  onDismiss: () => void
  enabled: boolean
  ref: RefObject<HTMLElement | null>
}

export const useDismiss = ({ onDismiss, enabled, ref }: UseDismissOptions) => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const el = ref?.current
      if (!el) return

      if (!el.contains(e.target as Node)) {
        onDismiss()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [ref, onDismiss, enabled])
}
