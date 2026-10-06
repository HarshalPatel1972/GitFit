import { describe, expect, it } from "vitest"
import { isSelectAllShortcut } from "@/lib/keyboard"

const key = (init: Partial<KeyboardEvent>) =>
  ({ ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, key: "", ...init }) as KeyboardEvent

describe("isSelectAllShortcut", () => {
  it("matches Ctrl+A and Cmd+A only", () => {
    expect(isSelectAllShortcut(key({ key: "a", ctrlKey: true }))).toBe(true)
    expect(isSelectAllShortcut(key({ key: "A", metaKey: true }))).toBe(true)
  })

  it("ignores a bare 'a' and other modifier combinations", () => {
    expect(isSelectAllShortcut(key({ key: "a" }))).toBe(false)
    expect(isSelectAllShortcut(key({ key: "a", ctrlKey: true, shiftKey: true }))).toBe(false)
    expect(isSelectAllShortcut(key({ key: "a", ctrlKey: true, altKey: true }))).toBe(false)
  })
})
