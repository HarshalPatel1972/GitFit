"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"
import { errorMessage } from "@/lib/client-actions"

/** Shown when loading data from GitHub fails, with a way to try again. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 24px",
        textAlign: "center",
        animation: "fadeIn 300ms ease-out both",
      }}
    >
      <AlertTriangle size={28} color="var(--accent-danger)" style={{ marginBottom: 16 }} />
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        Couldn&apos;t load from GitHub
      </h2>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          marginBottom: 20,
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        {errorMessage(error)}
      </p>
      <button
        onClick={onRetry}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--accent-primary)",
          background: "var(--accent-glow)",
          borderRadius: "var(--radius-full)",
        }}
      >
        <RotateCcw size={14} /> Try again
      </button>
    </div>
  )
}
