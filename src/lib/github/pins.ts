"use server"

import { auth } from "@/lib/auth"
import { graphqlFetch } from "@/lib/github/graphql"
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

const UPDATE_PINNED_ITEMS = `
  mutation SetPinnedItems($repositoryIds: [ID!]!) {
    setPinnedItems(input: { itemIds: $repositoryIds, type: REPOSITORY }) {
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
  query GetPinnableRepos($first: Int!, $after: String) {
    viewer {
      repositories(first: $first, after: $after, ownerAffiliations: [OWNER], orderBy: {field: STARGAZERS, direction: DESC}) {
        nodes {
          id
          name
          description
          stargazerCount
          primaryLanguage { name color }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export async function fetchPinnedItems(): Promise<Pin[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const data = await graphqlFetch(session.accessToken, GET_PINNED_ITEMS)
  return data.viewer.pinnedItems.nodes as Pin[]
}

export async function fetchPinnableRepos(): Promise<Pin[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  const data = await graphqlFetch(session.accessToken, GET_PINNABLE_REPOS, { first: 50 })
  return data.viewer.repositories.nodes as Pin[]
}

export async function updatePins(repositoryIds: string[]) {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  return graphqlFetch(session.accessToken, UPDATE_PINNED_ITEMS, { repositoryIds })
}
