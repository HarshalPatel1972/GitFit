"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
  undoAction?: () => void
  duration?: number
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    // Return no-op fallback for SSR / static generation
    return {
      addToast: () => {},
      removeToast: () => {},
    }
  }
  return context
}

// We need to export a singleton so server-action callers can use it
let globalAddToast: ((toast: Omit<Toast, "id">) => void) | null = null
export function getToastFn() {
  return globalAddToast
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2)
      const duration = toast.duration ?? (toast.undoAction ? 4000 : 3000)
      setToasts((prev) => [...prev, { ...toast, id, duration }])

      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  // Expose globally
  useEffect(() => {
    globalAddToast = addToast
    return () => {
      globalAddToast = null
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 420,
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  const borderColor =
    toast.type === "success"
      ? "var(--accent-success)"
      : toast.type === "error"
        ? "var(--accent-danger)"
        : "var(--accent-primary)"

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        pointerEvents: "auto",
        animation: "slideInRight 250ms ease-out",
        boxShadow: "var(--shadow-md)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          flex: 1,
          fontSize: "var(--text-sm)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {toast.message}
      </span>

      {toast.undoAction && (
        <button
          onClick={() => {
            toast.undoAction?.()
            onDismiss()
          }}
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--accent-primary)",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            transition: "background var(--transition-fast)",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--accent-glow)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Undo
        </button>
      )}

      <button
        onClick={onDismiss}
        style={{
          color: "var(--text-muted)",
          padding: 2,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>

      {/* Countdown bar */}
      {toast.undoAction && toast.duration && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: borderColor,
            transformOrigin: "left",
            animation: `countdownBar ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  )
}
