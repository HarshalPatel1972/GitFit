"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  title: string
  children: React.ReactNode
  /** Items affected, shown as a scrollable list. */
  items?: string[]
  confirmLabel: string
  /** When set, the user must tick this checkbox before confirming. */
  acknowledgement?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  children,
  items,
  confirmLabel,
  acknowledgement,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const canConfirm = !acknowledgement || acknowledged

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          animation: "fadeIn 200ms ease-out",
        }}
      />

      <div
        style={{
          position: "relative",
          background: "var(--bg-elevated)",
          border: "1px solid var(--accent-danger)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          maxWidth: 480,
          width: "100%",
          animation: "scaleIn 200ms ease-out",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={22} color="var(--accent-danger)" />
          <h2
            id="confirm-dialog-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </h2>
        </div>

        <div
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>

        {items && items.length > 0 && (
          <div
            style={{
              maxHeight: 120,
              overflowY: "auto",
              marginBottom: 16,
              padding: "8px 12px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {items.map((item) => (
              <div
                key={item}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  padding: "2px 0",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {acknowledgement && (
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: "var(--text-sm)",
              color: "var(--text-primary)",
              marginBottom: 20,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={{ marginTop: 3, accentColor: "var(--accent-danger)" }}
            />
            {acknowledgement}
          </label>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            autoFocus
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: canConfirm ? "var(--text-primary)" : "var(--text-muted)",
              background: canConfirm ? "var(--accent-danger)" : "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid",
              borderColor: canConfirm ? "var(--accent-danger)" : "var(--border-subtle)",
              opacity: canConfirm ? 1 : 0.5,
              cursor: canConfirm ? "pointer" : "not-allowed",
              transition: "all var(--transition-base)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
