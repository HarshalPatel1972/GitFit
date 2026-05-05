"use client"

import { useState, useCallback } from "react"

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)

  const toggle = useCallback(
    (id: string, allIds?: string[], shiftKey?: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)

        if (shiftKey && lastSelectedId && allIds) {
          // Range select
          const lastIndex = allIds.indexOf(lastSelectedId)
          const currentIndex = allIds.indexOf(id)
          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex)
            const end = Math.max(lastIndex, currentIndex)
            for (let i = start; i <= end; i++) {
              next.add(allIds[i])
            }
            return next
          }
        }

        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
      setLastSelectedId(id)
    },
    [lastSelectedId]
  )

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
    setLastSelectedId(null)
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
  }
}
