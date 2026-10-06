"use server"

import { getOctokit } from "@/lib/github/client"
import { hasNextPage, run, type ActionResult, type Page } from "@/lib/result"
import type { GitFitRepo } from "@/types"

/** One page of the user's own repos, trimmed to the fields GitFit uses. */
export async function fetchReposPage(page: number): Promise<ActionResult<Page<GitFitRepo>>> {
  return run(async () => {
    const octokit = await getOctokit()
    const { data, headers } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: "updated",
      direction: "desc",
      affiliation: "owner",
    })

    return {
      hasNext: hasNextPage(headers),
      items: data.map((r) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        private: r.private,
        archived: r.archived,
        fork: r.fork,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        size: r.size,
        pushed_at: r.pushed_at ?? r.updated_at ?? "",
        created_at: r.created_at ?? "",
        updated_at: r.updated_at ?? "",
        topics: r.topics ?? [],
        owner: { login: r.owner.login, avatar_url: r.owner.avatar_url },
      })),
    }
  })
}
