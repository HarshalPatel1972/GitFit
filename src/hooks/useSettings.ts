"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import type { SortOption } from "@/types"

export interface AppSettings {
  defaultSort: SortOption
  staleThreshold: number
}

export const defaultSettings: AppSettings = {
  defaultSort: "updated",
  staleThreshold: 30,
}

const STORAGE_KEY = "gitfit-settings"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Settings persisted in localStorage, shared by every page that reads them. */
export function useSettings() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null)

  const settings = useMemo<AppSettings>(() => {
    if (!raw) return defaultSettings
    try {
      return { ...defaultSettings, ...JSON.parse(raw) }
    } catch {
      return defaultSettings
    }
  }, [raw])

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, [key]: value }))
      } catch {
        // Storage unavailable (private mode); the setting just won't persist
      }
      listeners.forEach((listener) => listener())
    },
    [settings]
  )

  return { settings, updateSetting }
}
