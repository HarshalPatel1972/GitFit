"use server"

import { getOctokit } from "@/lib/github/client"
import { hasNextPage, run, type ActionResult, type Page } from "@/lib/result"
import type { GitFitStar } from "@/types"

interface StarredRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  topics?: string[]
  owner: { login: string; avatar_url: string }
}

/** One page of the user's stars (newest first), trimmed to the fields GitFit uses. */
export async function fetchStarsPage(page: number): Promise<ActionResult<Page<GitFitStar>>> {
  return run(async () => {
    const octokit = await getOctokit()
    const { data, headers } = await octokit.rest.activity.listReposStarredByAuthenticatedUser({
      per_page: 100,
      page,
      sort: "created",
      direction: "desc",
      // star+json wraps each repo as { starred_at, repo }
      headers: { accept: "application/vnd.github.v3.star+json" },
    })

    const items = (data as unknown as { starred_at?: string; repo?: StarredRepo }[]).map(
      (item) => {
        const r = item.repo ?? (item as unknown as StarredRepo)
        return {
          id: r.id,
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          html_url: r.html_url,
          language: r.language,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          topics: r.topics ?? [],
          owner: { login: r.owner.login, avatar_url: r.owner.avatar_url },
          starred_at: item.starred_at,
        }
      }
    )

    return { items, hasNext: hasNextPage(headers) }
  })
}
