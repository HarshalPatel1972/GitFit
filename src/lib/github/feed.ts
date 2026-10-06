"use server"

import { getOctokit } from "@/lib/github/client"
import { hasNextPage, run, type ActionResult, type Page } from "@/lib/result"
import type { FeedItem } from "@/types"

/** One page of open issues involving the user (excluding PRs, which GitHub mixes in). */
export async function fetchIssuesPage(page: number): Promise<ActionResult<Page<FeedItem>>> {
  return run(async () => {
    const octokit = await getOctokit()
    const { data, headers } = await octokit.rest.issues.listForAuthenticatedUser({
      filter: "all",
      state: "open",
      sort: "updated",
      per_page: 100,
      page,
    })
    return {
      hasNext: hasNextPage(headers),
      items: data
        .filter((issue) => !issue.pull_request)
        .map((issue) => mapIssueToFeedItem(issue as unknown as Record<string, unknown>, "issue")),
    }
  })
}

/** One page of the user's open PRs. GitHub search returns at most 1,000 results (10 pages). */
export async function fetchPRsPage(page: number): Promise<ActionResult<Page<FeedItem>>> {
  return run(async () => {
    const octokit = await getOctokit()
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: "is:pr is:open author:@me",
      sort: "updated",
      per_page: 100,
      page,
    })
    return {
      hasNext: page * 100 < Math.min(data.total_count, 1000),
      items: data.items.map((pr) => mapIssueToFeedItem(pr as unknown as Record<string, unknown>, "pr")),
    }
  })
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
