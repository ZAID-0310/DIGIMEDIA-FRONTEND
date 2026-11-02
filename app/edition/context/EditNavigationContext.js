import { createContext, useContext } from "react"

export const EditNavigationContext = createContext(null)

export function useEditNavigation() {
  const context = useContext(EditNavigationContext)

  if (!context) {
    throw new Error("useEditNavigation debe usarse dentro de EditionLayout")
  }

  return context
}
