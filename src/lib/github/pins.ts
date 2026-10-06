"use server"

import { getAccessToken } from "@/lib/auth"
import { graphqlFetch } from "@/lib/github/graphql"
import { run, type ActionResult } from "@/lib/result"
import type { Pin } from "@/types"

const GET_PINNED_ITEMS = `
  query GetPinnedItems {
    viewer {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            id
            name
            description
            stargazerCount
            primaryLanguage { name color }
          }
        }
      }
    }
  }
`

const GET_PINNABLE_REPOS = `
  query GetPinnableRepos($first: Int!) {
    viewer {
      repositories(first: $first, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          id
          name
          description
          stargazerCount
          primaryLanguage { name color }
        }
      }
    }
  }
`

export async function fetchPinnedItems(): Promise<ActionResult<Pin[]>> {
  return run(async () => {
    const data = await graphqlFetch(await getAccessToken(), GET_PINNED_ITEMS)
    return (data.viewer.pinnedItems.nodes || []) as Pin[]
  })
}

export async function fetchPinnableRepos(): Promise<ActionResult<Pin[]>> {
  return run(async () => {
    const data = await graphqlFetch(await getAccessToken(), GET_PINNABLE_REPOS, { first: 100 })
    return (data.viewer.repositories.nodes || []) as Pin[]
  })
}
