"use client"

/** Floating progress indicator while a bulk action runs in batches. */
export function BulkProgress({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        minWidth: 240,
        padding: "12px 18px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        fontSize: "var(--text-sm)",
        color: "var(--text-secondary)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        Working… {done} of {total}
      </div>
      <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "var(--accent-primary)",
            transition: "width 300ms ease-out",
          }}
        />
      </div>
    </div>
  )
}
