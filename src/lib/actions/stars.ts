"use server"

import { getOctokit } from "@/lib/github/client"
import { settleEach, splitFullName } from "@/lib/github/settle"
import type { ActionResult } from "@/lib/result"
import type { BulkActionResult } from "@/types"

export async function bulkUnstar(repoFullNames: string[]): Promise<ActionResult<BulkActionResult>> {
  const octokit = await getOctokit()
  return settleEach(repoFullNames, (n) => n, (fullName) =>
    octokit.rest.activity.unstarRepoForAuthenticatedUser(splitFullName(fullName))
  )
}
