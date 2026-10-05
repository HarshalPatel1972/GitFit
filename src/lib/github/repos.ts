"use server"

import { getOctokit } from "@/lib/github/client"
import type { GitFitRepo } from "@/types"

export async function fetchAllRepos(): Promise<GitFitRepo[]> {
  const octokit = await getOctokit()
  const repos = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    {
      per_page: 100,
      sort: "updated",
      direction: "desc",
      affiliation: "owner",
    }
  )

  return repos as GitFitRepo[]
}
