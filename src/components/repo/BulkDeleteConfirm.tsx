"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

interface BulkDeleteConfirmProps {
  count: number
  repoNames: string[]
  onConfirm: () => void
  onCancel: () => void
}

export function BulkDeleteConfirm({
  count,
  repoNames,
  onConfirm,
  onCancel,
}: BulkDeleteConfirmProps) {
  const [typed, setTyped] = useState("")
  const confirmed = typed === String(count)

  return (
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
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          animation: "fadeIn 200ms ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          background: "var(--bg-elevated)",
          border: "1px solid var(--accent-danger)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          maxWidth: 460,
          width: "100%",
          animation: "scaleIn 200ms ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={22} color="var(--accent-danger)" />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Deleting {count} repositor{count === 1 ? "y" : "ies"}
          </h2>
        </div>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          This action is <strong style={{ color: "var(--accent-danger)" }}>permanent</strong> and cannot be undone.
          These repos will be gone forever.
        </p>

        {/* Repo list preview */}
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
          {repoNames.map((name) => (
            <div
              key={name}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                padding: "2px 0",
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-secondary)",
            marginBottom: 10,
          }}
        >
          Type <strong style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{count}</strong> to confirm:
        </p>

        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
            marginBottom: 20,
            outline: "none",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent-danger)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-default)")
          }
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-strong)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-default)")
            }
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: confirmed
                ? "var(--text-primary)"
                : "var(--text-muted)",
              background: confirmed
                ? "var(--accent-danger)"
                : "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid",
              borderColor: confirmed
                ? "var(--accent-danger)"
                : "var(--border-subtle)",
              opacity: confirmed ? 1 : 0.5,
              cursor: confirmed ? "pointer" : "not-allowed",
              transition: "all var(--transition-base)",
            }}
          >
            Delete {count} repo{count === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  )
}
