"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { RefreshCw, Skull } from "lucide-react"
import { fetchAllRepos } from "@/lib/github/repos"
import { filterRepos } from "@/lib/filters"
import { useSelection } from "@/hooks/useSelection"
import { useToast } from "@/components/ui/Toast"
import { RepoCard, RepoCardSkeleton } from "@/components/repo/RepoCard"
import { FilterBar } from "@/components/repo/FilterBar"
import { BulkActionBar } from "@/components/repo/BulkActionBar"
import { BulkDeleteConfirm } from "@/components/repo/BulkDeleteConfirm"
import {
  bulkArchive,
  bulkUnarchive,
  bulkPrivatize,
  bulkPublicize,
  bulkDelete,
} from "@/lib/actions/bulk"
import type { Filters, GitFitRepo } from "@/types"

export default function DashboardPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const {
    data: repos,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchAllRepos,
    enabled: !!session?.accessToken,
  })

  const [filters, setFilters] = useState<Filters>({
    search: "",
    visibility: "all",
    status: "all",
    language: "",
    sort: "updated",
    preset: "all",
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const filteredRepos = useMemo(
    () => filterRepos(repos || [], filters),
    [repos, filters]
  )

  const allIds = useMemo(
    () => filteredRepos.map((r) => r.full_name),
    [filteredRepos]
  )

  const {
    selectedIds,
    selectedCount,
    hasSelection,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
  } = useSelection()

  const selectedNames = useMemo(
    () => Array.from(selectedIds),
    [selectedIds]
  )

  // Languages for filter dropdown
  const languages = useMemo(() => {
    if (!repos) return []
    const langs = new Set(repos.map((r) => r.language).filter(Boolean) as string[])
    return Array.from(langs).sort()
  }, [repos])

  // Stats
  const stats = useMemo(() => {
    if (!repos) return { total: 0, pub: 0, priv: 0, archived: 0 }
    return {
      total: repos.length,
      pub: repos.filter((r) => !r.private).length,
      priv: repos.filter((r) => r.private).length,
      archived: repos.filter((r) => r.archived).length,
    }
  }, [repos])

  // Dead repos count
  const deadCount = useMemo(() => {
    if (!repos) return 0
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return repos.filter(
      (r) => new Date(r.pushed_at) < sixMonthsAgo && !r.archived
    ).length
  }, [repos])

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === "/") {
        e.preventDefault()
        document.getElementById("search-repos")?.focus()
      }
      if (e.key === "Escape") {
        deselectAll()
        setShowDeleteModal(false)
      }
      if (e.key === "a" && !e.shiftKey) {
        e.preventDefault()
        selectAll(allIds)
      }
      if (e.key === "A" && e.shiftKey) {
        e.preventDefault()
        deselectAll()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [allIds, selectAll, deselectAll])

  // Bulk action handlers
  const handleBulkAction = useCallback(
    async (
      action: (names: string[]) => Promise<{ succeeded: string[]; failed: { name: string; error: string }[] }>,
      actionName: string,
      undoAction?: (names: string[]) => Promise<unknown>,
      cacheUpdater?: (repos: GitFitRepo[], succeeded: string[]) => GitFitRepo[]
    ) => {
      if (selectedNames.length === 0) return
      setBulkLoading(true)

      try {
        const result = await action(selectedNames)

        // Update cache optimistically
        if (cacheUpdater && result.succeeded.length > 0) {
          queryClient.setQueryData(["repos"], (old: GitFitRepo[] | undefined) =>
            old ? cacheUpdater(old, result.succeeded) : old
          )
        }

        if (result.succeeded.length > 0) {
          addToast({
            type: "success",
            message: `${actionName}: ${result.succeeded.length} repo${result.succeeded.length === 1 ? "" : "s"}`,
            undoAction: undoAction
              ? () => {
                  undoAction(result.succeeded).then(() => refetch())
                }
              : undefined,
          })
        }

        if (result.failed.length > 0) {
          addToast({
            type: "error",
            message: `Failed: ${result.failed.map((f) => f.name).join(", ")}`,
            duration: 5000,
          })
        }

        deselectAll()
      } catch (err) {
        addToast({
          type: "error",
          message: `${actionName} failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        })
      } finally {
        setBulkLoading(false)
      }
    },
    [selectedNames, queryClient, addToast, deselectAll, refetch]
  )

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          marginBottom: 8,
          animation: "fadeInDown 300ms ease-out both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
            }}
          >
            Your Repositories
          </h1>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            style={{
              color: "var(--text-muted)",
              padding: 6,
              borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <RefreshCw
              size={16}
              style={{
                animation: isRefetching ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>

        {/* Stats pills */}
        {repos && (
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              fontSize: "var(--text-sm)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "var(--text-muted)",
            }}
          >
            <span>{stats.pub} public</span>
            <span>{stats.priv} private</span>
            <span>{stats.archived} archived</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {stats.total} total
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      {repos && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          languages={languages}
          totalCount={repos.length}
          filteredCount={filteredRepos.length}
          hasSelection={hasSelection}
          allSelectedCount={selectedCount}
          onSelectAll={() => selectAll(allIds)}
          onDeselectAll={deselectAll}
        />
      )}

      {/* Dead repos banner */}
      {filters.preset === "dead" && deadCount > 0 && (
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            animation: "fadeInUp 250ms ease-out both",
          }}
        >
          <Skull size={18} color="var(--text-muted)" />
          <span
            style={{
              flex: 1,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
            }}
          >
            <strong>{deadCount}</strong> repos haven&apos;t had activity in 6+
            months. Bulk archive them to clean up your profile.
          </span>
          <button
            onClick={() => selectAll(allIds)}
            style={{
              padding: "6px 12px",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--accent-primary)",
              background: "var(--accent-glow)",
              borderRadius: "var(--radius-full)",
              transition: "all var(--transition-fast)",
            }}
          >
            Select All Dead
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoCardSkeleton key={i} delay={i * 40} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {repos && filteredRepos.length === 0 && !isLoading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            animation: "fadeIn 300ms ease-out both",
          }}
        >
          <div
            style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}
          >
            🔍
          </div>
          <p
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: 8,
            }}
          >
            No repos match your filters.
          </p>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-muted)",
              marginBottom: 16,
            }}
          >
            Try broadening your search or clearing filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                search: "",
                visibility: "all",
                status: "all",
                language: "",
                sort: "updated",
                preset: "all",
              })
            }
            style={{
              padding: "8px 16px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--accent-primary)",
              background: "var(--accent-glow)",
              borderRadius: "var(--radius-full)",
              transition: "all var(--transition-fast)",
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Repo Grid */}
      {filteredRepos.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filteredRepos.map((repo, i) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={isSelected(repo.full_name)}
              showCheckbox={hasSelection}
              onToggle={(e) => toggle(repo.full_name, allIds, e.shiftKey)}
              animationDelay={Math.min(i, 8) * 40}
            />
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        isLoading={bulkLoading}
        onArchive={() =>
          handleBulkAction(
            bulkArchive,
            "Archived",
            bulkUnarchive,
            (repos, succeeded) =>
              repos.map((r) =>
                succeeded.includes(r.full_name)
                  ? { ...r, archived: true }
                  : r
              )
          )
        }
        onUnarchive={() =>
          handleBulkAction(
            bulkUnarchive,
            "Unarchived",
            bulkArchive,
            (repos, succeeded) =>
              repos.map((r) =>
                succeeded.includes(r.full_name)
                  ? { ...r, archived: false }
                  : r
              )
          )
        }
        onPrivatize={() =>
          handleBulkAction(
            bulkPrivatize,
            "Privatized",
            bulkPublicize,
            (repos, succeeded) =>
              repos.map((r) =>
                succeeded.includes(r.full_name)
                  ? { ...r, private: true }
                  : r
              )
          )
        }
        onPublicize={() =>
          handleBulkAction(
            bulkPublicize,
            "Publicized",
            bulkPrivatize,
            (repos, succeeded) =>
              repos.map((r) =>
                succeeded.includes(r.full_name)
                  ? { ...r, private: false }
                  : r
              )
          )
        }
        onTag={() => {
          addToast({
            type: "info",
            message: "Topic editor coming soon!",
          })
        }}
        onRename={() => {
          addToast({
            type: "info",
            message: "Rename editor coming soon!",
          })
        }}
        onDelete={() => setShowDeleteModal(true)}
        onDismiss={deselectAll}
      />

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <BulkDeleteConfirm
          count={selectedCount}
          repoNames={selectedNames}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            setShowDeleteModal(false)
            await handleBulkAction(
              bulkDelete,
              "Deleted",
              undefined,
              (repos, succeeded) =>
                repos.filter((r) => !succeeded.includes(r.full_name))
            )
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
