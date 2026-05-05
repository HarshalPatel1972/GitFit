"use server"

import { auth } from "@/lib/auth"
import { createOctokit } from "@/lib/github/client"
import type { GitFitRepo } from "@/types"

export async function fetchAllRepos(): Promise<GitFitRepo[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const octokit = createOctokit(session.accessToken)
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
