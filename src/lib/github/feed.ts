"use server"

import { auth } from "@/lib/auth"
import { createOctokit } from "@/lib/github/client"
import type { FeedItem } from "@/types"

export async function fetchUserIssues(): Promise<FeedItem[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const octokit = createOctokit(session.accessToken)
  const issues = await octokit.paginate(
    octokit.rest.issues.listForAuthenticatedUser,
    {
      filter: "all",
      state: "open",
      sort: "updated",
      per_page: 100,
    }
  )

  // Filter out pull requests (GitHub's issue API returns PRs too)
  return issues
    .filter((issue: Record<string, unknown>) => !(issue as { pull_request?: unknown }).pull_request)
    .map((issue: Record<string, unknown>) => mapIssueToFeedItem(issue as Record<string, unknown>, "issue"))
}

export async function fetchUserPRs(): Promise<FeedItem[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const octokit = createOctokit(session.accessToken)

  // Use search API for user's PRs since there's no direct paginate endpoint for pulls
  const prs = await octokit.paginate(
    octokit.rest.search.issuesAndPullRequests,
    {
      q: `is:pr is:open author:@me`,
      sort: "updated",
      per_page: 100,
    },
    (response) => response.data
  )

  return prs.map((pr: Record<string, unknown>) => mapIssueToFeedItem(pr as Record<string, unknown>, "pr"))
}

function mapIssueToFeedItem(item: Record<string, unknown>, type: "pr" | "issue"): FeedItem {
  const repoUrl = (item.repository_url as string) || ""
  const repoParts = repoUrl.split("/")
  const repoName = repoParts[repoParts.length - 1] || ""
  const ownerName = repoParts[repoParts.length - 2] || ""

  return {
    id: item.id as number,
    type,
    title: item.title as string,
    number: item.number as number,
    state: item.state as string,
    html_url: item.html_url as string,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    labels: ((item.labels as Array<Record<string, unknown>>) || []).map((l) => ({
      name: l.name as string,
      color: l.color as string,
    })),
    assignees: ((item.assignees as Array<Record<string, unknown>>) || []).map((a) => ({
      login: a.login as string,
      avatar_url: a.avatar_url as string,
    })),
    repo: {
      owner: ownerName,
      name: repoName,
      full_name: `${ownerName}/${repoName}`,
    },
    user: {
      login: (item.user as Record<string, unknown>)?.login as string,
      avatar_url: (item.user as Record<string, unknown>)?.avatar_url as string,
    },
  }
}
