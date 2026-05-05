"use client"

import { useState, useMemo } from "react"
import { Pencil } from "lucide-react"

type RenameMode = "prefix" | "suffix" | "find-replace"

interface BulkRenameModalProps {
  selectedNames: string[]
  onConfirm: (renames: { owner: string; repo: string; newName: string }[]) => void
  onClose: () => void
}

export function BulkRenameModal({
  selectedNames,
  onConfirm,
  onClose,
}: BulkRenameModalProps) {
  const [mode, setMode] = useState<RenameMode>("prefix")
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")
  const [find, setFind] = useState("")
  const [replace, setReplace] = useState("")

  const previews = useMemo(() => {
    return selectedNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      let newName = repo
      if (mode === "prefix" && prefix) newName = `${prefix}${repo}`
      else if (mode === "suffix" && suffix) newName = `${repo}${suffix}`
      else if (mode === "find-replace" && find)
        newName = repo.replaceAll(find, replace)
      return { owner, repo, newName, changed: newName !== repo }
    })
  }, [selectedNames, mode, prefix, suffix, find, replace])

  const hasChanges = previews.some((p) => p.changed)

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
      <div
        onClick={onClose}
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
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "24px 28px",
          maxWidth: 520,
          width: "100%",
          animation: "scaleIn 200ms ease-out",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
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
          <Pencil size={20} color="var(--accent-primary)" />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
            }}
          >
            Bulk Rename
          </h2>
        </div>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["prefix", "suffix", "find-replace"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "6px 12px",
                fontSize: "var(--text-xs)",
                fontWeight: mode === m ? 600 : 400,
                color:
                  mode === m
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
                background:
                  mode === m ? "var(--accent-glow)" : "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid",
                borderColor:
                  mode === m
                    ? "var(--accent-primary)"
                    : "var(--border-subtle)",
                textTransform: "capitalize",
                transition: "all var(--transition-fast)",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: 16 }}>
          {mode === "prefix" && (
            <input
              type="text"
              placeholder="Prefix to add..."
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              autoFocus
              style={inputStyle}
            />
          )}
          {mode === "suffix" && (
            <input
              type="text"
              placeholder="Suffix to add..."
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              autoFocus
              style={inputStyle}
            />
          )}
          {mode === "find-replace" && (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Find..."
                value={find}
                onChange={(e) => setFind(e.target.value)}
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          )}
        </div>

        {/* Live preview */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            marginBottom: 16,
            padding: "10px 12px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            maxHeight: 200,
          }}
        >
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Preview
          </div>
          {previews.map((p) => (
            <div
              key={`${p.owner}/${p.repo}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                padding: "3px 0",
                color: p.changed
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                {p.owner}/
              </span>
              {p.changed ? (
                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "var(--accent-danger)",
                      marginRight: 4,
                    }}
                  >
                    {p.repo}
                  </span>
                  <span style={{ color: "var(--accent-success)" }}>
                    → {p.newName}
                  </span>
                </>
              ) : (
                <span>{p.repo}</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={() =>
              onConfirm(previews.filter((p) => p.changed))
            }
            disabled={!hasChanges}
            style={{
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: hasChanges
                ? "var(--text-inverse)"
                : "var(--text-muted)",
              background: hasChanges
                ? "var(--accent-primary)"
                : "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              opacity: hasChanges ? 1 : 0.5,
              cursor: hasChanges ? "pointer" : "not-allowed",
              transition: "all var(--transition-base)",
            }}
          >
            Rename {previews.filter((p) => p.changed).length} repos
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: "var(--text-sm)",
  fontFamily: "var(--font-mono)",
  color: "var(--text-primary)",
}

const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  color: "var(--text-secondary)",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
}
