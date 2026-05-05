"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  ExternalLink,
  Search,
  ChevronDown,
  Clock,
  MessageSquare,
  Tag,
} from "lucide-react"
import { fetchUserIssues, fetchUserPRs } from "@/lib/github/feed"
import { bulkCloseIssues } from "@/lib/actions/feed"
import { useSelection } from "@/hooks/useSelection"
import { useToast } from "@/components/ui/Toast"
import type { FeedItem } from "@/types"

type FeedTab = "prs" | "issues" | "stale"

export default function FeedPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: fetchUserIssues,
    enabled: !!session?.accessToken,
  })

  const { data: prs, isLoading: prsLoading } = useQuery({
    queryKey: ["prs"],
    queryFn: fetchUserPRs,
    enabled: !!session?.accessToken,
  })

  const [tab, setTab] = useState<FeedTab>("prs")
  const [search, setSearch] = useState("")
  const [repoFilter, setRepoFilter] = useState("")
  const [sort, setSort] = useState<"updated" | "created">("updated")
  const [staleThreshold, setStaleThreshold] = useState(30)
  const [bulkLoading, setBulkLoading] = useState(false)

  // All unique repos across issues + PRs
  const repos = useMemo(() => {
    const all = [...(issues || []), ...(prs || [])]
    const unique = new Set(all.map((i) => i.repo.full_name))
    return Array.from(unique).sort()
  }, [issues, prs])

  // Stale issues
  const staleIssues = useMemo(() => {
    if (!issues) return []
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - staleThreshold)
    return issues.filter((i) => new Date(i.created_at) < threshold)
  }, [issues, staleThreshold])

  // Current tab items
  const currentItems = useMemo(() => {
    let items: FeedItem[] = []
    if (tab === "prs") items = prs || []
    else if (tab === "issues") items = issues || []
    else items = staleIssues

    // Apply filters
    return items
      .filter((item) => {
        if (search) {
          const q = search.toLowerCase()
          if (!item.title.toLowerCase().includes(q) && !item.repo.full_name.toLowerCase().includes(q))
            return false
        }
        if (repoFilter && item.repo.full_name !== repoFilter) return false
        return true
      })
      .sort((a, b) => {
        const key = sort === "updated" ? "updated_at" : "created_at"
        return new Date(b[key]).getTime() - new Date(a[key]).getTime()
      })
  }, [tab, prs, issues, staleIssues, search, repoFilter, sort])

  const allIds = useMemo(() => currentItems.map((i) => String(i.id)), [currentItems])
  const { selectedIds, selectedCount, hasSelection, toggle, selectAll, deselectAll, isSelected } = useSelection()

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === "Escape") deselectAll()
      if (e.key === "a" && !e.shiftKey) { e.preventDefault(); selectAll(allIds) }
      if (e.key === "A" && e.shiftKey) { e.preventDefault(); deselectAll() }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [allIds, selectAll, deselectAll])

  const handleBulkClose = useCallback(async () => {
    if (selectedCount === 0 || !issues) return
    setBulkLoading(true)
    const selectedIssues = issues
      .filter((i) => selectedIds.has(String(i.id)))
      .map((i) => ({ owner: i.repo.owner, repo: i.repo.name, number: i.number }))

    try {
      const result = await bulkCloseIssues(selectedIssues)
      if (result.succeeded.length > 0) {
        addToast({ type: "success", message: `Closed ${result.succeeded.length} issues` })
      }
      if (result.failed.length > 0) {
        addToast({ type: "error", message: `Failed: ${result.failed.map((f) => f.name).join(", ")}`, duration: 5000 })
      }
      deselectAll()
    } catch {
      addToast({ type: "error", message: "Failed to close issues" })
    } finally {
      setBulkLoading(false)
    }
  }, [selectedIds, selectedCount, issues, addToast, deselectAll])

  const isLoading = issuesLoading || prsLoading

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8, animation: "fadeInDown 300ms ease-out both" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: 8 }}>
          Activity Feed
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 16,
        animation: "fadeInDown 300ms ease-out 60ms both",
      }}>
        {([
          { key: "prs" as FeedTab, label: "Open PRs", count: prs?.length },
          { key: "issues" as FeedTab, label: "Open Issues", count: issues?.length },
          { key: "stale" as FeedTab, label: "Stale Issues", count: staleIssues.length },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); deselectAll() }}
            style={{
              padding: "8px 16px", fontSize: "var(--text-sm)", fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "var(--accent-primary)" : "var(--text-secondary)",
              borderBottom: tab === t.key ? "2px solid var(--accent-primary)" : "2px solid transparent",
              transition: "all var(--transition-fast)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              if (tab !== t.key) e.currentTarget.style.color = "var(--text-primary)"
            }}
            onMouseLeave={(e) => {
              if (tab !== t.key) e.currentTarget.style.color = "var(--text-secondary)"
            }}
          >
            {t.label} {t.count !== undefined && (
              <span style={{
                marginLeft: 6, padding: "1px 6px", borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)", background: tab === t.key ? "var(--accent-glow)" : "var(--bg-elevated)",
                color: tab === t.key ? "var(--accent-primary)" : "var(--text-muted)",
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
        borderBottom: "1px solid var(--border-subtle)", marginBottom: 16,
        overflowX: "auto",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)", padding: "6px 12px",
          border: "1px solid var(--border-subtle)", flex: "0 1 220px", minWidth: 140,
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-primary)", minWidth: 0 }}
          />
        </div>

        <div style={{ position: "relative", display: "inline-flex" }}>
          <select
            value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)}
            style={{
              appearance: "none", padding: "6px 28px 6px 12px", fontSize: "var(--text-xs)",
              fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-secondary)",
              background: "var(--bg-elevated)", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)", cursor: "pointer",
            }}
          >
            <option value="">All Repos</option>
            {repos.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
        </div>

        <div style={{ position: "relative", display: "inline-flex" }}>
          <select
            value={sort} onChange={(e) => setSort(e.target.value as "updated" | "created")}
            style={{
              appearance: "none", padding: "6px 28px 6px 12px", fontSize: "var(--text-xs)",
              fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-secondary)",
              background: "var(--bg-elevated)", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)", cursor: "pointer",
            }}
          >
            <option value="updated">Updated</option>
            <option value="created">Created</option>
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
        </div>

        {tab === "stale" && (
          <div style={{ position: "relative", display: "inline-flex" }}>
            <select
              value={staleThreshold} onChange={(e) => setStaleThreshold(Number(e.target.value))}
              style={{
                appearance: "none", padding: "6px 28px 6px 12px", fontSize: "var(--text-xs)",
                fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-secondary)",
                background: "var(--bg-elevated)", borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)", cursor: "pointer",
              }}
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-shimmer" style={{
              height: 72, borderRadius: "var(--radius-lg)",
              animation: `fadeInUp 250ms ease-out ${i * 40}ms both`,
            }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && currentItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn 300ms ease-out both" }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>
            {tab === "stale" ? "✓" : "📭"}
          </div>
          <p style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            {tab === "stale" ? "All clear." : tab === "prs" ? "No open pull requests." : "No open issues."}
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {tab === "stale" ? "No stale issues across your repositories." : "Nothing to show right now."}
          </p>
        </div>
      )}

      {/* Feed list */}
      {currentItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {currentItems.map((item, i) => (
            <FeedItemCard
              key={item.id}
              item={item}
              isSelected={isSelected(String(item.id))}
              showCheckbox={hasSelection || tab === "stale"}
              onToggle={(e) => toggle(String(item.id), allIds, e.shiftKey)}
              delay={Math.min(i, 10) * 30}
            />
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {hasSelection && (tab === "issues" || tab === "stale") && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-xl)", padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "var(--shadow-lg)", backdropFilter: "blur(12px)", zIndex: 100,
          animation: "bulkBarAppear 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
            {selectedCount} selected
          </span>
          <div style={{ width: 1, height: 20, background: "var(--border-default)" }} />
          <button
            onClick={handleBulkClose}
            disabled={bulkLoading}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", fontSize: "var(--text-sm)", fontWeight: 600,
              color: "var(--accent-danger)", borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)", opacity: bulkLoading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-danger-glow)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MessageSquare size={15} /> Close Issues
          </button>
          <button onClick={deselectAll} style={{ color: "var(--text-muted)", padding: 4 }}>
            <Tag size={14} />
          </button>
          <style>{`
            @keyframes bulkBarAppear {
              from { transform: translateX(-50%) translateY(120%); opacity: 0; }
              to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

function FeedItemCard({
  item, isSelected, showCheckbox, onToggle, delay = 0,
}: {
  item: FeedItem; isSelected: boolean; showCheckbox: boolean;
  onToggle: (e: React.MouseEvent) => void; delay?: number;
}) {
  const timeSince = getTimeSince(item.updated_at)

  return (
    <div
      onClick={onToggle}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isSelected ? "var(--border-strong)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)", padding: "12px 16px", cursor: "pointer",
        transition: "all var(--transition-base)",
        boxShadow: isSelected ? "var(--shadow-glow)" : "none",
        display: "flex", alignItems: "center", gap: 12,
        animation: `fadeInUp 200ms ease-out ${delay}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = "var(--border-default)"
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = "var(--border-subtle)"
      }}
    >
      {showCheckbox && (
        <div style={{
          width: 16, height: 16, borderRadius: "var(--radius-sm)", flexShrink: 0,
          border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
          background: isSelected ? "var(--accent-primary)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {item.repo.full_name}
          </span>
          <span style={{
            padding: "1px 6px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600,
            background: item.type === "pr" ? "rgba(107, 158, 114, 0.15)" : "rgba(107, 131, 160, 0.15)",
            color: item.type === "pr" ? "var(--accent-success)" : "var(--accent-neutral)",
          }}>
            {item.type === "pr" ? "PR" : "Issue"} #{item.number}
          </span>
        </div>

        <a
          href={item.html_url} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)",
            transition: "color var(--transition-fast)", display: "inline-flex", alignItems: "center", gap: 4,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        >
          {item.title}
          <ExternalLink size={10} style={{ opacity: 0.4 }} />
        </a>

        {item.labels.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {item.labels.slice(0, 4).map((label) => (
              <span key={label.name} style={{
                padding: "1px 6px", borderRadius: "var(--radius-full)", fontSize: 10,
                background: `#${label.color}22`, color: `#${label.color}`,
                border: `1px solid #${label.color}44`,
              }}>
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)",
        color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0,
      }}>
        <Clock size={11} />
        {timeSince}
      </div>
    </div>
  )
}

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
