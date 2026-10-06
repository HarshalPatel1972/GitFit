import type { ScorableRepo } from "@/lib/score"

// The landing-page check-up runs entirely in the visitor's browser against GitHub's public
// API: no sign-in, nothing sent to or stored by GitFit. Unauthenticated requests are limited
// to 60 per hour per visitor, which is plenty for a few check-ups.

export interface PublicRepo extends ScorableRepo {
  language: string | null
  html_url: string
}

export interface CheckupResult {
  login: string
  name: string | null
  avatarUrl: string
  publicRepoCount: number
  repos: PublicRepo[]
  truncated: boolean
}

export type CheckupErrorCode = "invalid" | "not_found" | "rate_limited" | "network"

export class CheckupError extends Error {
  constructor(public code: CheckupErrorCode, message: string) {
    super(message)
    this.name = "CheckupError"
  }
}

const USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
const MAX_PAGES = 3

/** Accepts "octocat", "@octocat" or a pasted github.com URL. */
export function parseUsername(input: string): string | null {
  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
  return USERNAME.test(cleaned) ? cleaned : null
}

async function getJson(url: string, fetchImpl: typeof fetch) {
  let response: Response
  try {
    response = await fetchImpl(url, { headers: { Accept: "application/vnd.github+json" } })
  } catch {
    throw new CheckupError("network", "Couldn't reach GitHub. Check your connection and try again.")
  }
  if (response.status === 404) {
    throw new CheckupError("not_found", "No GitHub user with that name.")
  }
  if (response.status === 403 || response.status === 429) {
    throw new CheckupError(
      "rate_limited",
      "GitHub limits free check-ups to 60 requests an hour per visitor. Try again later, or sign in to skip the limit."
    )
  }
  if (!response.ok) {
    throw new CheckupError("network", `GitHub returned an error (${response.status}). Try again in a moment.`)
  }
  return response.json()
}

export async function runPublicCheckup(input: string, fetchImpl: typeof fetch = fetch): Promise<CheckupResult> {
  const login = parseUsername(input)
  if (!login) throw new CheckupError("invalid", "That doesn't look like a GitHub username.")

  const user = await getJson(`https://api.github.com/users/${login}`, fetchImpl)
  const repos: PublicRepo[] = []
  const pages = Math.min(MAX_PAGES, Math.ceil((user.public_repos ?? 0) / 100))

  for (let page = 1; page <= pages; page++) {
    const batch: PublicRepo[] = await getJson(
      `https://api.github.com/users/${login}/repos?type=owner&sort=pushed&per_page=100&page=${page}`,
      fetchImpl
    )
    repos.push(
      ...batch.map((r) => ({
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        archived: r.archived,
        fork: r.fork,
        pushed_at: r.pushed_at,
        created_at: r.created_at,
        size: r.size,
        stargazers_count: r.stargazers_count,
        topics: r.topics ?? [],
        language: r.language,
        html_url: r.html_url,
      }))
    )
  }

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    publicRepoCount: user.public_repos ?? repos.length,
    repos,
    truncated: (user.public_repos ?? 0) > MAX_PAGES * 100,
  }
}
