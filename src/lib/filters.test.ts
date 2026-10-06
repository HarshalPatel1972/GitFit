import { describe, expect, it } from "vitest"
import { filterRepos } from "@/lib/filters"
import type { Filters, GitFitRepo } from "@/types"

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

function repo(overrides: Partial<GitFitRepo>): GitFitRepo {
  return {
    id: Math.random(),
    name: "repo",
    full_name: "me/repo",
    description: null,
    html_url: "",
    private: false,
    archived: false,
    fork: false,
    language: null,
    stargazers_count: 0,
    forks_count: 0,
    size: 0,
    pushed_at: daysAgo(1),
    created_at: daysAgo(100),
    updated_at: daysAgo(1),
    topics: [],
    owner: { login: "me", avatar_url: "" },
    ...overrides,
  }
}

const base: Filters = {
  search: "",
  visibility: "all",
  status: "all",
  language: "",
  sort: "updated",
  preset: "all",
}

const repos = [
  repo({ name: "alpha", description: "A CLI tool", language: "Go", stargazers_count: 5 }),
  repo({ name: "beta", private: true, language: "TypeScript", stargazers_count: 50, updated_at: daysAgo(3) }),
  repo({ name: "gamma", archived: true, pushed_at: daysAgo(400), updated_at: daysAgo(400) }),
  repo({ name: "delta", pushed_at: daysAgo(300), updated_at: daysAgo(300) }),
]
const names = (list: GitFitRepo[]) => list.map((r) => r.name)

describe("filterRepos", () => {
  it("searches name and description, case-insensitively", () => {
    expect(names(filterRepos(repos, { ...base, search: "ALP" }))).toEqual(["alpha"])
    expect(names(filterRepos(repos, { ...base, search: "cli" }))).toEqual(["alpha"])
  })

  it("filters by visibility, status and language", () => {
    expect(names(filterRepos(repos, { ...base, visibility: "private" }))).toEqual(["beta"])
    expect(names(filterRepos(repos, { ...base, status: "archived" }))).toEqual(["gamma"])
    expect(names(filterRepos(repos, { ...base, language: "Go" }))).toEqual(["alpha"])
  })

  it("'clutter' finds unarchived repos with no push in 6+ months", () => {
    expect(names(filterRepos(repos, { ...base, preset: "clutter" }))).toEqual(["delta"])
  })

  it("'no-description' skips archived repos", () => {
    expect(names(filterRepos(repos, { ...base, preset: "no-description" }))).toEqual(["beta", "delta"])
  })

  it("sorts by stars, name and last update", () => {
    expect(names(filterRepos(repos, { ...base, sort: "stars" }))[0]).toBe("beta")
    expect(names(filterRepos(repos, { ...base, sort: "name" }))).toEqual(["alpha", "beta", "delta", "gamma"])
    expect(names(filterRepos(repos, base))).toEqual(["alpha", "beta", "delta", "gamma"])
  })
})
