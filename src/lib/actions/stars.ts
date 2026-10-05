"use server"

import { getOctokit } from "@/lib/github/client"
import type { BulkActionResult } from "@/types"

export async function unstar(fullName: string): Promise<void> {
  const octokit = await getOctokit()
  const [owner, repo] = fullName.split("/")
  await octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo })
}

export async function bulkUnstar(repoFullNames: string[]): Promise<BulkActionResult> {
  const octokit = await getOctokit()

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo })
    })
  )

  const succeeded: string[] = []
  const failed: { name: string; error: string }[] = []

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(repoFullNames[i])
    } else {
      failed.push({
        name: repoFullNames[i],
        error: result.reason?.message || "Unknown error",
      })
    }
  })

  return { succeeded, failed }
}
