"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileHeader } from "@/components/layout/MobileHeader"
import { useState, useEffect } from "react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
      {!isMobile && <Sidebar currentPath={pathname} />}

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
          marginLeft: isMobile ? 0 : 240,
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
          {children}
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
