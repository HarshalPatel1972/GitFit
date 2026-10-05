"use server"

import { getOctokit } from "@/lib/github/client"
import type { BulkActionResult } from "@/types"

export async function bulkCloseIssues(
  issues: { owner: string; repo: string; number: number }[],
  comment?: string
): Promise<BulkActionResult> {
  const body = comment?.trim().slice(0, 65536)
  const octokit = await getOctokit()

  const names = issues.map((i) => `${i.owner}/${i.repo}#${i.number}`)
  const results = await Promise.allSettled(
    issues.map(async ({ owner, repo, number }) => {
      // Comment is optional and written by the user; nothing is posted on their behalf otherwise
      if (body) {
        await octokit.rest.issues.createComment({ owner, repo, issue_number: number, body })
      }
      // Then close
      return octokit.rest.issues.update({
        owner,
        repo,
        issue_number: number,
        state: "closed",
      })
    })
  )

  const succeeded: string[] = []
  const failed: { name: string; error: string }[] = []
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(names[i])
    } else {
      failed.push({ name: names[i], error: result.reason?.message || "Unknown error" })
    }
  })
  return { succeeded, failed }
}

export async function bulkAddLabels(
  issues: { owner: string; repo: string; number: number }[],
  labels: string[]
): Promise<BulkActionResult> {
  const octokit = await getOctokit()

  const names = issues.map((i) => `${i.owner}/${i.repo}#${i.number}`)
  const results = await Promise.allSettled(
    issues.map(({ owner, repo, number }) =>
      octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels,
      })
    )
  )

  const succeeded: string[] = []
  const failed: { name: string; error: string }[] = []
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(names[i])
    } else {
      failed.push({ name: names[i], error: result.reason?.message || "Unknown error" })
    }
  })
  return { succeeded, failed }
}
