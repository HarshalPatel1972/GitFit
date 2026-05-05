"use server"

import { auth } from "@/lib/auth"
import { createOctokit } from "@/lib/github/client"
import type { BulkActionResult } from "@/types"

function summarizeResults(
  results: PromiseSettledResult<unknown>[],
  names: string[]
): BulkActionResult {
  const succeeded: string[] = []
  const failed: { name: string; error: string }[] = []

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(names[i])
    } else {
      failed.push({
        name: names[i],
        error: result.reason?.message || "Unknown error",
      })
    }
  })

  return { succeeded, failed }
}

export async function bulkPrivatize(repoFullNames: string[]): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, private: true })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkPublicize(repoFullNames: string[]): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, private: false })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkArchive(repoFullNames: string[]): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, archived: true })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkUnarchive(repoFullNames: string[]): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, archived: false })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkDelete(repoFullNames: string[]): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map((fullName) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.delete({ owner, repo })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkAddTopics(
  repoFullNames: string[],
  newTopics: string[]
): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map(async (fullName) => {
      const [owner, repo] = fullName.split("/")
      // Fetch existing topics first
      const { data } = await octokit.rest.repos.getAllTopics({ owner, repo })
      const merged = [...new Set([...data.names, ...newTopics])]
      return octokit.rest.repos.replaceAllTopics({ owner, repo, names: merged })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkRemoveTopics(
  repoFullNames: string[],
  topicsToRemove: string[]
): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const results = await Promise.allSettled(
    repoFullNames.map(async (fullName) => {
      const [owner, repo] = fullName.split("/")
      const { data } = await octokit.rest.repos.getAllTopics({ owner, repo })
      const filtered = data.names.filter((t: string) => !topicsToRemove.includes(t))
      return octokit.rest.repos.replaceAllTopics({ owner, repo, names: filtered })
    })
  )
  return summarizeResults(results, repoFullNames)
}

export async function bulkUpdateDescription(
  updates: { fullName: string; description: string }[]
): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const names = updates.map((u) => u.fullName)
  const results = await Promise.allSettled(
    updates.map(({ fullName, description }) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, description })
    })
  )
  return summarizeResults(results, names)
}

export async function bulkRename(
  renames: { fullName: string; newName: string }[]
): Promise<BulkActionResult> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")
  const octokit = createOctokit(session.accessToken)

  const names = renames.map((r) => r.fullName)
  const results = await Promise.allSettled(
    renames.map(({ fullName, newName }) => {
      const [owner, repo] = fullName.split("/")
      return octokit.rest.repos.update({ owner, repo, name: newName })
    })
  )
  return summarizeResults(results, names)
}
