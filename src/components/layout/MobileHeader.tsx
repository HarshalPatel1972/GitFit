"use client"

import { Menu } from "lucide-react"

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <button
        onClick={onMenuClick}
        style={{ color: "var(--text-secondary)", padding: 4 }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          color: "var(--accent-primary)",
          fontSize: "var(--text-lg)",
        }}
      >
        GitFit
      </span>
    </header>
  )
}
