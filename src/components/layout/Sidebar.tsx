"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession, signOut } from "next-auth/react"
import { Activity, FolderGit2, Layers, LogOut, Settings, Star, X } from "lucide-react"
import { GitFitMark } from "@/components/landing/GitHubMark"
import { scoreColor } from "@/components/ui/ScoreRing"
import { analyzeRepos } from "@/lib/score"
import type { GitFitRepo } from "@/types"

const navItems = [
  { href: "/dashboard", label: "Repos", hint: "sort & tidy", icon: FolderGit2 },
  { href: "/stars", label: "Stars", hint: "clear old saves", icon: Star },
  { href: "/feed", label: "Issues & PRs", hint: "close what's stale", icon: Activity },
  { href: "/pins", label: "Pins", hint: "your shortlist", icon: Layers },
]

interface SidebarProps {
  currentPath: string
  onClose?: () => void
  isCollapsed?: boolean
}

export function Sidebar({ currentPath, onClose, isCollapsed = false }: SidebarProps) {
  const { data: session } = useSession()
  // Reads the repos the dashboard already loaded; never triggers a fetch of its own
  const { data: repos } = useQuery<GitFitRepo[]>({ queryKey: ["repos"], enabled: false })
  const score = useMemo(() => (repos ? analyzeRepos(repos).score : null), [repos])

  return (
    <aside className={`sidebar ${isCollapsed ? "is-collapsed" : ""} ${onClose ? "is-drawer" : ""}`}>
      <div className="sidebar__brand">
        <Link href="/dashboard" aria-label="GitFit home" onClick={onClose}>
          <GitFitMark size={22} />
          {!isCollapsed && <span>GitFit</span>}
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close menu" className="sidebar__close">
            <X size={18} />
          </button>
        )}
      </div>

      {score !== null && (
        <Link
          href="/dashboard"
          className="sidebar__score"
          onClick={onClose}
          title={`Fit score ${score} of 100`}
          aria-label={`Fit score ${score} of 100`}
        >
          <span className="sidebar__score-value" style={{ color: scoreColor(score) }}>
            {score}
          </span>
          {!isCollapsed && (
            <span className="sidebar__score-label">
              fit score
              <span className="sidebar__score-bar">
                <span style={{ width: `${score}%`, background: scoreColor(score) }} />
              </span>
            </span>
          )}
        </Link>
      )}

      <nav className="sidebar__nav" aria-label="Main">
        {navItems.map((item) => {
          const active = currentPath.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              aria-label={isCollapsed ? item.label : undefined}
              aria-current={active ? "page" : undefined}
              onClick={onClose}
              className={active ? "is-active" : ""}
            >
              <item.icon size={18} aria-hidden="true" />
              {!isCollapsed && (
                <span>
                  {item.label}
                  <small>{item.hint}</small>
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar__foot">
        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          aria-label={isCollapsed ? "Settings" : undefined}
          aria-current={currentPath.startsWith("/settings") ? "page" : undefined}
          onClick={onClose}
          className={currentPath.startsWith("/settings") ? "is-active" : ""}
        >
          <Settings size={18} aria-hidden="true" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {session?.user && (
          <div className="sidebar__user">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element -- 28px GitHub avatar, already sized by GitHub
              <img src={session.user.image} alt="" width={28} height={28} />
            )}
            {!isCollapsed && <span>{session.user.name}</span>}
            <button
              type="button"
              onClick={() => signOut({ redirectTo: "/" })}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
