"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { RefreshCw, Skull } from "lucide-react"
import { fetchReposPage } from "@/lib/github/repos"
import { fetchAllPages, runBulk, handleSessionExpiry, errorMessage } from "@/lib/client-actions"
import type { ActionResult } from "@/lib/result"
import { ErrorState } from "@/components/ui/ErrorState"
import { BulkProgress } from "@/components/ui/BulkProgress"
import { filterRepos } from "@/lib/filters"
import { useSelection } from "@/hooks/useSelection"
import { useToast } from "@/components/ui/Toast"
import { RepoCard, RepoCardSkeleton } from "@/components/repo/RepoCard"
import { FilterBar } from "@/components/repo/FilterBar"
import { BulkActionBar } from "@/components/repo/BulkActionBar"
import { BulkDeleteConfirm } from "@/components/repo/BulkDeleteConfirm"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { BulkTopicEditor } from "@/components/repo/BulkTopicEditor"
import { BulkRenameModal } from "@/components/repo/BulkRenameModal"
import { useSettings } from "@/hooks/useSettings"
import { isEditableTarget, isModalOpen, isSelectAllShortcut } from "@/lib/keyboard"
import {
  bulkArchive,
  bulkUnarchive,
  bulkPrivatize,
  bulkPublicize,
  bulkDelete,
  bulkAddTopics,
  bulkRemoveTopics,
  bulkRename,
} from "@/lib/actions/bulk"
import type { BulkActionResult, Filters, GitFitRepo, SortOption } from "@/types"

// `sort: null` means "use the default sort from Settings"
type FilterState = Omit<Filters, "sort"> & { sort: SortOption | null }

const initialFilters: FilterState = {
  search: "",
  visibility: "all",
  status: "all",
  language: "",
  sort: null,
  preset: "all",
}

export default function DashboardPage() {
  const { status } = useSession()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const [loadedCount, setLoadedCount] = useState(0)
  const {
    data: repos,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["repos"],
    queryFn: async () =>
      (await fetchAllPages(fetchReposPage, { onProgress: setLoadedCount })).items,
    enabled: status === "authenticated",
  })

  const { settings } = useSettings()
  const [filterState, setFilters] = useState<FilterState>(initialFilters)
  const filters = useMemo<Filters>(
    () => ({ ...filterState, sort: filterState.sort ?? settings.defaultSort }),
    [filterState, settings.defaultSort]
  )

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [visibilityConfirm, setVisibilityConfirm] = useState<"private" | "public" | null>(null)
  const [showTopicEditor, setShowTopicEditor] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null)

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
      if (isEditableTarget(e.target) || isModalOpen()) return

      if (e.key === "/") {
        e.preventDefault()
        document.getElementById("search-repos")?.focus()
      }
      if (e.key === "Escape") deselectAll()
      if (isSelectAllShortcut(e)) {
        e.preventDefault()
        selectAll(allIds)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [allIds, selectAll, deselectAll])

  // Bulk action handlers
  const handleBulkAction = useCallback(
    async (
      action: (names: string[]) => Promise<ActionResult<BulkActionResult>>,
      actionName: string,
      undoAction?: (names: string[]) => Promise<ActionResult<BulkActionResult>>,
      cacheUpdater?: (repos: GitFitRepo[], succeeded: string[]) => GitFitRepo[],
      names: string[] = selectedNames
    ) => {
      if (names.length === 0) return
      setBulkLoading(true)

      try {
        const result = await runBulk(names, action, {
          onProgress: (done, total) => setBulkProgress({ done, total }),
        })

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
                  runBulk(result.succeeded, undoAction)
                    .catch(handleSessionExpiry)
                    .finally(() => refetch())
                }
              : undefined,
          })
        }

        if (result.failed.length > 0) {
          addToast({
            type: "error",
            message: describeFailures(result),
            duration: 8000,
          })
        }

        deselectAll()
      } catch (err) {
        if (handleSessionExpiry(err)) return
        addToast({ type: "error", message: `${actionName} failed: ${errorMessage(err)}` })
      } finally {
        setBulkLoading(false)
        setBulkProgress(null)
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

      {isError && !repos && <ErrorState error={error} onRetry={() => refetch()} />}

      {/* Loading skeletons */}
      {isLoading && loadedCount > 0 && (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 12 }}>
          Loading your repositories… {loadedCount.toLocaleString()} so far
        </p>
      )}
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
            onClick={() => setFilters(initialFilters)}
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
        onPrivatize={() => setVisibilityConfirm("private")}
        onPublicize={() => setVisibilityConfirm("public")}
        onTag={() => setShowTopicEditor(true)}
        onRename={() => setShowRenameModal(true)}
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

      {showTopicEditor && (
        <BulkTopicEditor
          selectedCount={selectedCount}
          onClose={() => setShowTopicEditor(false)}
          onAdd={async (topics) => {
            setShowTopicEditor(false)
            await handleBulkAction(
              (names) => bulkAddTopics(names, topics),
              "Topics added",
              undefined,
              (repos, succeeded) =>
                repos.map((r) =>
                  succeeded.includes(r.full_name)
                    ? { ...r, topics: [...new Set([...(r.topics || []), ...topics])] }
                    : r
                )
            )
          }}
          onRemove={async (topics) => {
            setShowTopicEditor(false)
            await handleBulkAction(
              (names) => bulkRemoveTopics(names, topics),
              "Topics removed",
              undefined,
              (repos, succeeded) =>
                repos.map((r) =>
                  succeeded.includes(r.full_name)
                    ? { ...r, topics: (r.topics || []).filter((t) => !topics.includes(t)) }
                    : r
                )
            )
          }}
        />
      )}

      {showRenameModal && (
        <BulkRenameModal
          selectedNames={selectedNames}
          onClose={() => setShowRenameModal(false)}
          onConfirm={async (renames) => {
            setShowRenameModal(false)
            const newNames = new Map(renames.map((r) => [`${r.owner}/${r.repo}`, r.newName]))
            await handleBulkAction(
              (batch) =>
                bulkRename(batch.map((fullName) => ({ fullName, newName: newNames.get(fullName)! }))),
              "Renamed",
              undefined,
              (repos, succeeded) =>
                repos.map((r) => {
                  const newName = newNames.get(r.full_name)
                  return newName && succeeded.includes(r.full_name)
                    ? { ...r, name: newName, full_name: `${r.owner.login}/${newName}` }
                    : r
                }),
              renames.map((r) => `${r.owner}/${r.repo}`)
            )
          }}
        />
      )}

      {bulkProgress && bulkProgress.total > 10 && (
        <BulkProgress done={bulkProgress.done} total={bulkProgress.total} />
      )}

      {/* Visibility confirm modal. No undo is offered: GitHub permanently erases
          stars and watchers when a public repo is made private. */}
      {visibilityConfirm && (() => {
        const toPrivate = visibilityConfirm === "private"
        const affected = (repos || []).filter(
          (r) => selectedIds.has(r.full_name) && r.private !== toPrivate
        )
        const starCount = affected.reduce((sum, r) => sum + r.stargazers_count, 0)
        const names = affected.map((r) => r.full_name)
        const close = () => setVisibilityConfirm(null)
        return (
          <ConfirmDialog
            title={`Make ${names.length} repo${names.length === 1 ? "" : "s"} ${visibilityConfirm}?`}
            items={names}
            confirmLabel={toPrivate ? "Make private" : "Make public"}
            acknowledgement={
              names.length === 0
                ? undefined
                : toPrivate
                  ? "I understand stars and watchers are permanently erased and cannot be restored."
                  : "I have checked these repos for secrets, credentials, and private data."
            }
            onCancel={close}
            onConfirm={async () => {
              close()
              if (names.length === 0) return
              await handleBulkAction(
                toPrivate ? bulkPrivatize : bulkPublicize,
                toPrivate ? "Privatized" : "Publicized",
                undefined,
                (repos, succeeded) =>
                  repos.map((r) =>
                    succeeded.includes(r.full_name) ? { ...r, private: toPrivate } : r
                  ),
                names
              )
            }}
          >
            {names.length === 0 ? (
              <p>All selected repos are already {visibilityConfirm}.</p>
            ) : toPrivate ? (
              <p>
                GitHub <strong style={{ color: "var(--accent-danger)" }}>permanently erases</strong>{" "}
                all stars and watchers when a public repo becomes private
                {starCount > 0 && <> — <strong>{starCount.toLocaleString()} stars</strong> will be lost</>}.
                Public forks are detached. Making the repo public again does not bring them back.
              </p>
            ) : (
              <p>
                Everyone on the internet will be able to see the code, full commit history,
                and issues of these repos.
              </p>
            )}
          </ConfirmDialog>
        )
      })()}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function describeFailures(result: BulkActionResult): string {
  const shown = result.failed.slice(0, 3).map((f) => `${f.name} (${f.error})`)
  const more = result.failed.length - shown.length
  return [
    result.rateLimited ? "GitHub rate limit reached, try the rest in a few minutes." : null,
    `Failed: ${shown.join(", ")}${more > 0 ? ` and ${more} more` : ""}`,
  ]
    .filter(Boolean)
    .join(" ")
}
