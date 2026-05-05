"use server"

import { auth } from "@/lib/auth"
import { createOctokit } from "@/lib/github/client"
import type { GitFitStar } from "@/types"

export async function fetchAllStars(): Promise<GitFitStar[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const octokit = createOctokit(session.accessToken)
  const stars = await octokit.paginate(
    octokit.rest.activity.listReposStarredByAuthenticatedUser,
    {
      per_page: 100,
      sort: "created",
      direction: "desc",
      headers: {
        accept: "application/vnd.github.v3.star+json",
      },
    }
  )

  // The star+json media type returns { starred_at, repo } objects
  return stars.map((item: Record<string, unknown>) => {
    const s = item as { starred_at?: string; repo?: Record<string, unknown> }
    const repo = (s.repo || item) as Record<string, unknown>
    return {
      ...repo,
      starred_at: s.starred_at || undefined,
    } as GitFitStar
  })
}
