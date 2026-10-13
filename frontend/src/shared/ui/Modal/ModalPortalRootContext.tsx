import { createContext, useContext } from 'react'

/** Куда монтировать портал модалки. В Storybook задаётся декоратором, чтобы несколько сторис не попадали в один document.body. */
export const ModalPortalRootContext = createContext<HTMLElement | undefined>(undefined)

export function useModalPortalRoot(): HTMLElement | undefined {
  return useContext(ModalPortalRootContext)
}
