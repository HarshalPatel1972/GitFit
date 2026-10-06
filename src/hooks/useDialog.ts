"use client"

import { useEffect, useRef } from "react"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal dialog behaviour: Escape closes, Tab stays inside the dialog, and focus returns
 * to whatever was focused before the dialog opened. Attach the returned ref to the dialog.
 */
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const node = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusable = () => Array.from(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])

    // Respect an element that already took focus via autoFocus
    if (node && !node.contains(document.activeElement)) {
      const first = focusable()[0]
      if (first) first.focus()
      else {
        node.tabIndex = -1
        node.focus()
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== "Tab") return
      const items = focusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [])

  return ref
}
