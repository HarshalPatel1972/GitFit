"use client"

import { usePathname } from "next/navigation"
import { useState, useSyncExternalStore } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

const COLLAPSED_KEY = "gitfit_desktop_sidebar_open"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "false"
  } catch {
    return false
  }
}

function setCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, String(!collapsed))
  } catch {
    // Storage unavailable; the choice just won't persist
  }
  listeners.forEach((listener) => listener())
}

// Desktop vs. mobile layout is decided in CSS (globals.css, .app-*) so the first paint
// is already correct on phones instead of flashing the desktop layout.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false)

  // The mobile menu is open only on the page where it was opened, so navigating closes it
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null)
  const mobileMenuOpen = menuOpenOn === pathname

  return (
    <div className="app-shell" data-collapsed={collapsed}>
      <div className="app-desktop-only">
        <Sidebar currentPath={pathname} isCollapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="app-sidebar-toggle"
          style={{ left: collapsed ? 52 : 228 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="app-mobile-only">
          <div
            onClick={() => setMenuOpenOn(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 998,
              animation: "fadeIn 200ms ease-out",
            }}
          />
          <div
            role="dialog"
            aria-label="Navigation"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: 260,
              zIndex: 999,
              animation: "slideInFromLeft 250ms ease-out",
            }}
          >
            <Sidebar currentPath={pathname} onClose={() => setMenuOpenOn(null)} />
          </div>
        </div>
      )}

      <main className="app-main">
        <div className="app-mobile-only">
          <MobileHeader onMenuClick={() => setMenuOpenOn(pathname)} />
        </div>
        <div className="app-content">
          <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
