"use client"

import { useState } from "react"
import { HelpCircle, X } from "lucide-react"

const shortcuts = [
  { key: "/", desc: "Focus search" },
  { key: "Escape", desc: "Clear selection / close modal" },
  { key: "A", desc: "Select all visible" },
  { key: "Shift + A", desc: "Deselect all" },
  { key: "Click", desc: "Toggle selection" },
  { key: "Shift + Click", desc: "Range select" },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          width: 32,
          height: 32,
          borderRadius: "var(--radius-full)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          zIndex: 50,
          transition: "all var(--transition-fast)",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)"
          e.currentTarget.style.color = "var(--text-secondary)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)"
          e.currentTarget.style.color = "var(--text-muted)"
        }}
      >
        <HelpCircle size={16} />
      </button>

      {open && (
        <div
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
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              animation: "fadeIn 200ms ease-out",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "24px 28px",
              maxWidth: 380,
              width: "100%",
              animation: "scaleIn 200ms ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                }}
              >
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ color: "var(--text-muted)", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
              role="grid"
              aria-label="Keyboard shortcuts reference"
            >
              <tbody>
                {shortcuts.map((s) => (
                  <tr key={s.key}>
                    <td style={{ padding: "6px 0", width: 120 }}>
                      <kbd
                        style={{
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-default)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-xs)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {s.key}
                      </kbd>
                    </td>
                    <td
                      style={{
                        padding: "6px 0",
                        fontSize: "var(--text-sm)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {s.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
