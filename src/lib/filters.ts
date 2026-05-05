import type { GitFitRepo, Filters } from "@/types"

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
      if (filters.preset === "dead") {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        if (new Date(r.pushed_at) > sixMonthsAgo || r.archived) return false
      }
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
