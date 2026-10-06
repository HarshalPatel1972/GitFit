"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gitfit_desktop_sidebar_open")
      return saved !== "false"
    }
    return true
  })

  useEffect(() => {
    localStorage.setItem("gitfit_desktop_sidebar_open", String(desktopSidebarOpen))
  }, [desktopSidebarOpen])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar currentPath={pathname} isCollapsed={!desktopSidebarOpen} />
      )}

      {/* Desktop sidebar toggle button */}
      {!isMobile && (
        <button
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          aria-label={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            position: "fixed",
            top: 24,
            left: desktopSidebarOpen ? 228 : 52,
            width: 24,
            height: 24,
            borderRadius: "var(--radius-full)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer",
            zIndex: 101,
            transition: "left var(--transition-slow), background var(--transition-fast), color var(--transition-fast)",
            boxShadow: "var(--shadow-sm)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)"
            e.currentTarget.style.background = "var(--bg-hover)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)"
            e.currentTarget.style.background = "var(--bg-elevated)"
          }}
        >
          {desktopSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              zIndex: 998,
              animation: "fadeIn 200ms ease-out",
            }}
          />
          <div
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
            <Sidebar
              currentPath={pathname}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: "var(--bg-canvas)",
          marginLeft: isMobile ? 0 : (desktopSidebarOpen ? 240 : 64),
          transition: "margin-left var(--transition-slow)",
        }}
      >
        {isMobile && (
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        )}
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: isMobile ? "16px" : "32px 24px",
          }}
        >
          <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
        </div>
      </main>

      <style>{`
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
