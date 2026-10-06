"use server"

import { getOctokit } from "@/lib/github/client"
import { settleEach } from "@/lib/github/settle"
import type { ActionResult } from "@/lib/result"
import type { BulkActionResult } from "@/types"

type IssueRef = { owner: string; repo: string; number: number }

const issueName = (i: IssueRef) => `${i.owner}/${i.repo}#${i.number}`

export async function bulkCloseIssues(
  issues: IssueRef[],
  comment?: string
): Promise<ActionResult<BulkActionResult>> {
  const body = comment?.trim().slice(0, 65536)
  const octokit = await getOctokit()

  return settleEach(issues, issueName, async ({ owner, repo, number }) => {
    // Comment is optional and written by the user; nothing is posted on their behalf otherwise
    if (body) {
      await octokit.rest.issues.createComment({ owner, repo, issue_number: number, body })
    }
    return octokit.rest.issues.update({ owner, repo, issue_number: number, state: "closed" })
  })
}
