import { isClutter, isUntouchedFork } from "@/lib/score"
import type { GitFitRepo, Filters, FilterPreset } from "@/types"

/** Repos a "fix list" preset is about. Archived repos are already put away. */
export function matchesPreset(r: GitFitRepo, preset: FilterPreset): boolean {
  switch (preset) {
    case "clutter":
      return isClutter(r)
    case "untouched-forks":
      return isUntouchedFork(r)
    case "no-description":
      return !r.archived && !r.description?.trim()
    case "no-topics":
      return !r.archived && (!r.topics || r.topics.length === 0)
    default:
      return true
  }
}

export function filterRepos(repos: GitFitRepo[], filters: Filters): GitFitRepo[] {
  return repos
    .filter((r) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !r.name.toLowerCase().includes(q) &&
          !(r.description?.toLowerCase().includes(q))
        )
          return false
      }
      if (filters.visibility === "public" && r.private) return false
      if (filters.visibility === "private" && !r.private) return false
      if (filters.status === "archived" && !r.archived) return false
      if (filters.status === "active" && r.archived) return false
      if (filters.language && r.language !== filters.language) return false
      if (!matchesPreset(r, filters.preset)) return false
      return true
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "name":
          return a.name.localeCompare(b.name)
        case "stars":
          return b.stargazers_count - a.stargazers_count
        case "size":
          return b.size - a.size
        case "created":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )
      }
    })
}
