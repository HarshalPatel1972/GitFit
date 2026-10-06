"use client"

import { useEffect } from "react"
import { isEditableTarget, isModalOpen, isSelectAllShortcut } from "@/lib/keyboard"

/** Page shortcuts: "/" focuses search, Escape clears selection, Ctrl/⌘+A selects all. */
export function useSelectionShortcuts({
  allIds,
  selectAll,
  deselectAll,
  searchInputId,
}: {
  allIds: string[]
  selectAll: (ids: string[]) => void
  deselectAll: () => void
  searchInputId: string
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target) || isModalOpen()) return

      if (e.key === "/") {
        e.preventDefault()
        document.getElementById(searchInputId)?.focus()
      }
      if (e.key === "Escape") deselectAll()
      if (isSelectAllShortcut(e)) {
        e.preventDefault()
        selectAll(allIds)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [allIds, selectAll, deselectAll, searchInputId])
}
