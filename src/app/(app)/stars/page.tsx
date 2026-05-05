"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { Star, Circle, ExternalLink, Search, ChevronDown } from "lucide-react"
import { fetchAllStars } from "@/lib/github/stars"
import { bulkUnstar } from "@/lib/actions/stars"
import { useSelection } from "@/hooks/useSelection"
import { useToast } from "@/components/ui/Toast"
import type { GitFitStar } from "@/types"

export default function StarsPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()

  const { data: stars, isLoading, refetch } = useQuery({
    queryKey: ["stars"],
    queryFn: fetchAllStars,
    enabled: !!session?.accessToken,
  })

  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState("")
  const [sort, setSort] = useState<"recent" | "stars" | "name">("recent")
  const [preset, setPreset] = useState<"all" | "forgotten">("all")
  const [groupByLang, setGroupByLang] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const languages = useMemo(() => {
    if (!stars) return []
    const langs = new Set(stars.map((s) => s.language).filter(Boolean) as string[])
    return Array.from(langs).sort()
  }, [stars])

  const filteredStars = useMemo(() => {
    if (!stars) return []
    return stars
      .filter((s) => {
        if (search) {
          const q = search.toLowerCase()
          if (
            !s.full_name.toLowerCase().includes(q) &&
            !(s.description?.toLowerCase().includes(q))
          )
            return false
        }
        if (language && s.language !== language) return false
        if (preset === "forgotten" && s.starred_at) {
          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          if (new Date(s.starred_at) > oneYearAgo) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name)
        if (sort === "stars") return b.stargazers_count - a.stargazers_count
        return 0 // keep original order for "recent"
      })
  }, [stars, search, language, sort, preset])

  const allIds = useMemo(() => filteredStars.map((s) => s.full_name), [filteredStars])
  const { selectedIds, selectedCount, hasSelection, toggle, selectAll, deselectAll, isSelected } = useSelection()
  const selectedNames = useMemo(() => Array.from(selectedIds), [selectedIds])

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

  const handleBulkUnstar = useCallback(async () => {
    if (selectedNames.length === 0) return
    setBulkLoading(true)
    try {
      const result = await bulkUnstar(selectedNames)
      if (result.succeeded.length > 0) {
        addToast({ type: "success", message: `Unstarred ${result.succeeded.length} repos` })
        refetch()
      }
      if (result.failed.length > 0) {
        addToast({ type: "error", message: `Failed to unstar: ${result.failed.map((f) => f.name).join(", ")}`, duration: 5000 })
      }
      deselectAll()
    } catch {
      addToast({ type: "error", message: "Unstar failed" })
    } finally {
      setBulkLoading(false)
    }
  }, [selectedNames, addToast, deselectAll, refetch])

  // Grouped view
  const grouped = useMemo(() => {
    if (!groupByLang) return null
    const groups: Record<string, GitFitStar[]> = {}
    filteredStars.forEach((s) => {
      const lang = s.language || "Other"
      if (!groups[lang]) groups[lang] = []
      groups[lang].push(s)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredStars, groupByLang])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 8, animation: "fadeInDown 300ms ease-out both" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: 4 }}>
          Starred Repositories
        </h1>
        {stars && (
          <p style={{ fontSize: "var(--text-sm)", fontWeight: 300, fontStyle: "italic", color: "var(--text-muted)" }}>
            {stars.length} total stars · {languages.length} languages
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)", marginBottom: 20,
        overflowX: "auto", position: "sticky", top: 0, background: "var(--bg-canvas)", zIndex: 10,
        animation: "fadeInDown 300ms ease-out 80ms both",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6, background: "var(--bg-elevated)",
          borderRadius: "var(--radius-md)", padding: "6px 12px",
          border: "1px solid var(--border-subtle)", flex: "0 1 260px", minWidth: 160,
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text" placeholder="Search stars..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-primary)", minWidth: 0 }}
          />
        </div>

        {/* Language filter */}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <select
            value={language} onChange={(e) => setLanguage(e.target.value)}
            style={{
              appearance: "none", padding: "6px 28px 6px 12px", fontSize: "var(--text-xs)",
              fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-secondary)",
              background: "var(--bg-elevated)", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)", cursor: "pointer",
            }}
          >
            <option value="">All Languages</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
        </div>

        {/* Sort */}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <select
            value={sort} onChange={(e) => setSort(e.target.value as "recent" | "stars" | "name")}
            style={{
              appearance: "none", padding: "6px 28px 6px 12px", fontSize: "var(--text-xs)",
              fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--text-secondary)",
              background: "var(--bg-elevated)", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)", cursor: "pointer",
            }}
          >
            <option value="recent">Recently Starred</option>
            <option value="stars">Most Stars</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
        </div>

        {/* Forgotten preset */}
        <button
          onClick={() => setPreset(preset === "forgotten" ? "all" : "forgotten")}
          style={{
            padding: "6px 12px", fontSize: "var(--text-xs)", fontWeight: 500,
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
            border: "1px solid", cursor: "pointer",
            borderColor: preset === "forgotten" ? "var(--accent-primary)" : "var(--border-subtle)",
            color: preset === "forgotten" ? "var(--accent-primary)" : "var(--text-muted)",
            background: preset === "forgotten" ? "var(--accent-glow)" : "var(--bg-elevated)",
          }}
        >
          ⏳ Forgotten
        </button>

        {/* Group toggle */}
        <button
          onClick={() => setGroupByLang(!groupByLang)}
          style={{
            padding: "6px 12px", fontSize: "var(--text-xs)", fontWeight: 500,
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
            border: "1px solid", cursor: "pointer",
            borderColor: groupByLang ? "var(--accent-primary)" : "var(--border-subtle)",
            color: groupByLang ? "var(--accent-primary)" : "var(--text-muted)",
            background: groupByLang ? "var(--accent-glow)" : "var(--bg-elevated)",
          }}
        >
          Group
        </button>

        {hasSelection && (
          <button onClick={deselectAll} style={{
            padding: "6px 12px", fontSize: "var(--text-xs)", fontWeight: 600,
            color: "var(--accent-primary)", background: "var(--accent-glow)",
            borderRadius: "var(--radius-full)", whiteSpace: "nowrap",
          }}>
            Clear
          </button>
        )}
      </div>

      {/* Forgotten banner */}
      {preset === "forgotten" && filteredStars.length > 0 && (
        <div style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)", padding: "14px 20px", marginBottom: 20,
          fontSize: "var(--text-sm)", color: "var(--text-secondary)",
          animation: "fadeInUp 250ms ease-out both",
        }}>
          ⏳ You starred these 1+ year ago. Still relevant?
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)", padding: "16px 20px",
              animation: `fadeInUp 250ms ease-out ${i * 40}ms both`,
            }}>
              <div className="animate-shimmer" style={{ height: 18, width: "60%", borderRadius: "var(--radius-sm)", marginBottom: 10 }} />
              <div className="animate-shimmer" style={{ height: 14, width: "90%", borderRadius: "var(--radius-sm)", marginBottom: 14 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <div className="animate-shimmer" style={{ height: 12, width: 50, borderRadius: "var(--radius-sm)" }} />
                <div className="animate-shimmer" style={{ height: 12, width: 30, borderRadius: "var(--radius-sm)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {stars && filteredStars.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: "60px 20px", animation: "fadeIn 300ms ease-out both" }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>⭐</div>
          <p style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            {search || language ? "No stars match your filters." : "No starred repositories yet."}
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {search || language ? "Try broadening your search." : "Head to GitHub and star some repos."}
          </p>
        </div>
      )}

      {/* Star Grid */}
      {!groupByLang && filteredStars.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredStars.map((star, i) => (
            <StarCard
              key={star.id}
              star={star}
              isSelected={isSelected(star.full_name)}
              showCheckbox={hasSelection}
              onToggle={(e) => toggle(star.full_name, allIds, e.shiftKey)}
              delay={Math.min(i, 8) * 40}
            />
          ))}
        </div>
      )}

      {/* Grouped view */}
      {groupByLang && grouped && grouped.map(([lang, items]) => (
        <div key={lang} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 600,
            color: "var(--text-secondary)", marginBottom: 12,
            paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)",
          }}>
            {lang} <span style={{ fontWeight: 300, fontSize: "var(--text-sm)" }}>({items.length})</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {items.map((star) => (
              <StarCard
                key={star.id}
                star={star}
                isSelected={isSelected(star.full_name)}
                showCheckbox={hasSelection}
                onToggle={(e) => toggle(star.full_name, allIds, e.shiftKey)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Bulk unstar bar */}
      {hasSelection && (
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
            onClick={handleBulkUnstar}
            disabled={bulkLoading}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", fontSize: "var(--text-sm)", fontWeight: 600,
              color: "var(--accent-primary)", borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)", opacity: bulkLoading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-glow)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Star size={15} /> Unstar Selected
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

function StarCard({
  star, isSelected, showCheckbox, onToggle, delay = 0,
}: {
  star: GitFitStar; isSelected: boolean; showCheckbox: boolean;
  onToggle: (e: React.MouseEvent) => void; delay?: number;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isSelected ? "var(--border-strong)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)", padding: "16px 20px", cursor: "pointer",
        transition: "all var(--transition-base)",
        boxShadow: isSelected ? "var(--shadow-glow)" : "none",
        animation: delay ? `fadeInUp 250ms ease-out ${delay}ms both` : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--border-default)"
          e.currentTarget.style.transform = "translateY(-1px)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--border-subtle)"
          e.currentTarget.style.transform = "translateY(0)"
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {showCheckbox && (
          <div style={{
            width: 18, height: 18, borderRadius: "var(--radius-sm)", flexShrink: 0, marginTop: 2,
            border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
            background: isSelected ? "var(--accent-primary)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
              {star.owner.login}
            </span>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <a
              href={star.html_url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 600,
                color: "var(--text-primary)", transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            >
              {star.name}
              <ExternalLink size={10} style={{ marginLeft: 4, opacity: 0.5 }} />
            </a>
          </div>

          {star.description && (
            <p style={{
              fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.5,
              marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {star.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {star.language && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Circle size={8} fill="var(--text-muted)" stroke="none" />
                {star.language}
              </span>
            )}
            {star.stargazers_count > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={12} /> {star.stargazers_count.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
