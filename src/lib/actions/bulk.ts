"use server"

import { getOctokit } from "@/lib/github/client"
import { settleEach, splitFullName } from "@/lib/github/settle"
import type { ActionResult } from "@/lib/result"
import type { BulkActionResult } from "@/types"

type Result = Promise<ActionResult<BulkActionResult>>

async function updateEach(repoFullNames: string[], changes: { private?: boolean; archived?: boolean }): Result {
  const octokit = await getOctokit()
  return settleEach(repoFullNames, (n) => n, (fullName) =>
    octokit.rest.repos.update({ ...splitFullName(fullName), ...changes })
  )
}

export async function bulkPrivatize(repoFullNames: string[]): Result {
  return updateEach(repoFullNames, { private: true })
}

export async function bulkPublicize(repoFullNames: string[]): Result {
  return updateEach(repoFullNames, { private: false })
}

export async function bulkArchive(repoFullNames: string[]): Result {
  return updateEach(repoFullNames, { archived: true })
}

export async function bulkUnarchive(repoFullNames: string[]): Result {
  return updateEach(repoFullNames, { archived: false })
}

export async function bulkDelete(repoFullNames: string[]): Result {
  const octokit = await getOctokit()
  return settleEach(repoFullNames, (n) => n, (fullName) =>
    octokit.rest.repos.delete(splitFullName(fullName))
  )
}

export async function bulkAddTopics(repoFullNames: string[], newTopics: string[]): Result {
  const octokit = await getOctokit()
  return settleEach(repoFullNames, (n) => n, async (fullName) => {
    const { owner, repo } = splitFullName(fullName)
    // Fetch existing topics first
    const { data } = await octokit.rest.repos.getAllTopics({ owner, repo })
    const merged = [...new Set([...data.names, ...newTopics])]
    if (merged.length > 20) {
      throw new Error(`would have ${merged.length} topics (GitHub allows 20)`)
    }
    return octokit.rest.repos.replaceAllTopics({ owner, repo, names: merged })
  })
}

export async function bulkRemoveTopics(repoFullNames: string[], topicsToRemove: string[]): Result {
  const octokit = await getOctokit()
  return settleEach(repoFullNames, (n) => n, async (fullName) => {
    const { owner, repo } = splitFullName(fullName)
    const { data } = await octokit.rest.repos.getAllTopics({ owner, repo })
    const filtered = data.names.filter((t: string) => !topicsToRemove.includes(t))
    return octokit.rest.repos.replaceAllTopics({ owner, repo, names: filtered })
  })
}

export async function bulkUpdateDescription(
  updates: { fullName: string; description: string }[]
): Result {
  const octokit = await getOctokit()
  return settleEach(updates, (u) => u.fullName, ({ fullName, description }) =>
    octokit.rest.repos.update({ ...splitFullName(fullName), description })
  )
}

export async function bulkRename(renames: { fullName: string; newName: string }[]): Result {
  const octokit = await getOctokit()
  return settleEach(renames, (r) => r.fullName, ({ fullName, newName }) =>
    octokit.rest.repos.update({ ...splitFullName(fullName), name: newName })
  )
}
