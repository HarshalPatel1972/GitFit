"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { LogOut, Keyboard } from "lucide-react"

interface AppSettings {
  defaultSort: string
  defaultView: string
  staleThreshold: number
}

const defaultSettings: AppSettings = {
  defaultSort: "updated",
  defaultView: "grid",
  staleThreshold: 30,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("gitfit-settings")
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) })
      } catch {
        // ignore
      }
    }
  }, [])

  const updateSetting = (key: keyof AppSettings, value: string | number) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem("gitfit-settings", JSON.stringify(next))
      return next
    })
  }

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
          <select
            value={settings.defaultSort}
            onChange={(e) => updateSetting("defaultSort", e.target.value)}
            style={selectStyle}
          >
            <option value="updated">Last Updated</option>
            <option value="name">Name</option>
            <option value="stars">Stars</option>
            <option value="size">Size</option>
            <option value="created">Created</option>
          </select>
        </SettingRow>

        <SettingRow label="Default view">
          <div style={{ display: "flex", gap: 6 }}>
            {["grid", "list"].map((v) => (
              <button
                key={v}
                onClick={() => updateSetting("defaultView", v)}
                style={{
                  padding: "6px 14px",
                  fontSize: "var(--text-sm)",
                  fontWeight: settings.defaultView === v ? 600 : 400,
                  color: settings.defaultView === v ? "var(--accent-primary)" : "var(--text-secondary)",
                  background: settings.defaultView === v ? "var(--accent-glow)" : "var(--bg-elevated)",
                  border: "1px solid",
                  borderColor: settings.defaultView === v ? "var(--accent-primary)" : "var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  textTransform: "capitalize",
                  transition: "all var(--transition-fast)",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Feed */}
      <Section title="Feed">
        <SettingRow label="Stale threshold">
          <select
            value={settings.staleThreshold}
            onChange={(e) => updateSetting("staleThreshold", Number(e.target.value))}
            style={selectStyle}
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
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
                  { key: "A", desc: "Select all" },
                  { key: "Shift + A", desc: "Deselect all" },
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
          onClick={() => signOut({ callbackUrl: "/" })}
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

const selectStyle: React.CSSProperties = {
  appearance: "none" as const,
  padding: "6px 28px 6px 12px",
  fontSize: "var(--text-sm)",
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  color: "var(--text-secondary)",
  background: "var(--bg-elevated)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  cursor: "pointer",
}
