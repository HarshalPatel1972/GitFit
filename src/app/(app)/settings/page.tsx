"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Keyboard } from "lucide-react"
import { Select } from "@/components/ui/Select"
import { useSettings } from "@/hooks/useSettings"
import type { SortOption } from "@/types"

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()
  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: "fadeInDown 300ms ease-out both" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700 }}>
          Settings
        </h1>
      </div>

      {/* Dashboard */}
      <Section title="Dashboard">
        <SettingRow label="Default sort">
          <Select
            value={settings.defaultSort}
            onChange={(val: SortOption) => updateSetting("defaultSort", val)}
            options={[
              { value: "updated", label: "Last Updated" },
              { value: "name", label: "Name" },
              { value: "stars", label: "Stars" },
              { value: "size", label: "Size" },
              { value: "created", label: "Created" },
            ]}
            variant="rect"
          />
        </SettingRow>
      </Section>

      {/* Feed */}
      <Section title="Feed">
        <SettingRow label="Issues are stale after no activity for">
          <Select
            value={settings.staleThreshold}
            onChange={(val) => updateSetting("staleThreshold", val)}
            options={[
              { value: 30, label: "30 days" },
              { value: 60, label: "60 days" },
              { value: 90, label: "90 days" },
            ]}
            variant="rect"
          />
        </SettingRow>
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Keyboard Shortcuts">
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", fontSize: "var(--text-sm)", fontWeight: 500,
            color: "var(--text-secondary)", background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)", cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
        >
          <Keyboard size={16} />
          {showShortcuts ? "Hide" : "View all"}
        </button>

        {showShortcuts && (
          <div style={{
            marginTop: 12, padding: 16, background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
            animation: "fadeIn 200ms ease-out",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { key: "/", desc: "Focus search" },
                  { key: "Escape", desc: "Clear selection / close modal" },
                  { key: "Ctrl/⌘ + A", desc: "Select all" },
                ].map((s) => (
                  <tr key={s.key}>
                    <td style={{
                      padding: "6px 0", width: 120,
                    }}>
                      <kbd style={{
                        padding: "2px 8px", borderRadius: "var(--radius-sm)",
                        background: "var(--bg-surface)", border: "1px solid var(--border-default)",
                        fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                        color: "var(--text-primary)",
                      }}>
                        {s.key}
                      </kbd>
                    </td>
                    <td style={{ padding: "6px 0", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      {s.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Danger Zone */}
      <div style={{
        marginTop: 40, padding: 20,
        border: "1px solid var(--accent-danger-dim)",
        borderRadius: "var(--radius-lg)",
        animation: "fadeInUp 250ms ease-out 200ms both",
      }}>
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700,
          color: "var(--accent-danger)", marginBottom: 12,
        }}>
          Danger Zone
        </h3>
        <p style={{
          fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 16,
        }}>
          Disconnect your GitHub account and sign out.
        </p>
        <button
          onClick={() => signOut({ redirectTo: "/" })}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", fontSize: "var(--text-sm)", fontWeight: 600,
            color: "var(--accent-danger)", background: "var(--accent-danger-glow)",
            border: "1px solid var(--accent-danger-dim)",
            borderRadius: "var(--radius-md)", transition: "all var(--transition-fast)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-danger)"
            e.currentTarget.style.color = "var(--text-primary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-danger-glow)"
            e.currentTarget.style.color = "var(--accent-danger)"
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32, animation: "fadeInUp 250ms ease-out both" }}>
      <h2 style={{
        fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600,
        color: "var(--text-primary)", marginBottom: 16,
        paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)",
      }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </div>
  )
}

