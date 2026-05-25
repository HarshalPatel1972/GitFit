"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Star,
  Activity,
  Pin,
  Settings,
  LogOut,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stars", label: "Stars", icon: Star },
  { href: "/feed", label: "Feed", icon: Activity },
  { href: "/pins", label: "Pins", icon: Pin },
]

interface SidebarProps {
  currentPath: string
  onClose?: () => void
  isCollapsed?: boolean
}

export function Sidebar({ currentPath, onClose, isCollapsed = false }: SidebarProps) {
  const { data: session } = useSession()

  return (
    <aside
      style={{
        width: isCollapsed ? 64 : 240,
        height: "100vh",
        position: onClose ? "relative" : "fixed",
        top: 0,
        left: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        overflow: "hidden",
        transition: "width var(--transition-slow)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: isCollapsed ? "24px 0 20px" : "24px 20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          height: 77,
        }}
      >
        <Link
          href="/dashboard"
          className="gitfit-logo"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isCollapsed ? "var(--text-lg)" : "var(--text-xl)",
            fontWeight: 900,
            color: "var(--accent-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {isCollapsed ? "GF" : "GitFit"}
        </Link>
        {onClose && !isCollapsed && (
          <button
            onClick={onClose}
            style={{ color: "var(--text-muted)", padding: 4 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border-subtle)",
          margin: isCollapsed ? "0 8px" : "0 16px",
        }}
      />

      {/* Nav */}
      <nav style={{ flex: 1, padding: isCollapsed ? "12px 4px" : "12px 8px" }}>
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: isCollapsed ? 0 : 12,
                padding: isCollapsed ? "10px 0" : "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 400,
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--bg-hover)" : "transparent",
                borderLeft: isCollapsed
                  ? "none"
                  : isActive
                  ? "3px solid var(--accent-primary)"
                  : "3px solid transparent",
                borderRight: isCollapsed && isActive ? "3px solid var(--accent-primary)" : "none",
                transition: "all var(--transition-fast)",
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "var(--bg-hover)"
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "transparent"
              }}
            >
              <item.icon size={18} />
              {!isCollapsed && item.label}
            </Link>
          )
        })}

        <div
          style={{
            height: 1,
            background: "var(--border-subtle)",
            margin: isCollapsed ? "12px 4px" : "12px 8px",
          }}
        />

        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? 0 : 12,
            padding: isCollapsed ? "10px 0" : "10px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            color: currentPath.startsWith("/settings")
              ? "var(--text-primary)"
              : "var(--text-secondary)",
            background: currentPath.startsWith("/settings")
              ? "var(--bg-hover)"
              : "transparent",
            borderLeft: isCollapsed
              ? "none"
              : currentPath.startsWith("/settings")
              ? "3px solid var(--accent-primary)"
              : "3px solid transparent",
            borderRight: isCollapsed && currentPath.startsWith("/settings") ? "3px solid var(--accent-primary)" : "none",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            if (!currentPath.startsWith("/settings"))
              e.currentTarget.style.background = "var(--bg-hover)"
          }}
          onMouseLeave={(e) => {
            if (!currentPath.startsWith("/settings"))
              e.currentTarget.style.background = "transparent"
          }}
        >
          <Settings size={18} />
          {!isCollapsed && "Settings"}
        </Link>
      </nav>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: "var(--border-subtle)",
          margin: isCollapsed ? "0 8px" : "0 16px",
        }}
      />

      {/* User section */}
      <div
        style={{
          padding: isCollapsed ? "16px 4px 20px" : "16px 16px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "stretch",
          gap: 10,
        }}
      >
        {session?.user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? 0 : 10,
            }}
          >
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-full)",
                  border: "2px solid var(--border-default)",
                }}
              />
            )}
            {!isCollapsed && (
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.name || session.user.email}
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={isCollapsed ? "Sign out" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: isCollapsed ? 0 : 8,
            padding: isCollapsed ? "8px 0" : "8px 12px",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            borderRadius: "var(--radius-md)",
            transition: "all var(--transition-fast)",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent-danger)"
            e.currentTarget.style.background = "var(--accent-danger-glow)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)"
            e.currentTarget.style.background = "transparent"
          }}
        >
          <LogOut size={16} />
          {!isCollapsed && "Sign out"}
        </button>
      </div>
    </aside>
  )
}
