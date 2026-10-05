/** True when the key event comes from somewhere the user is typing or choosing. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true
  return !!target.closest('[role="listbox"], [role="combobox"], [role="menu"]')
}

/** True while a modal dialog is open, so page shortcuts stay out of its way. */
export function isModalOpen(): boolean {
  return !!document.querySelector('[aria-modal="true"]')
}

/** Ctrl+A / ⌘+A. A bare "a" was too easy to hit next to destructive bulk actions. */
export function isSelectAllShortcut(e: KeyboardEvent): boolean {
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "a"
}
