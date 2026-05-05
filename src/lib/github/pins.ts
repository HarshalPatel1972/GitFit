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

// Minimum possible mutation to test connectivity and logic
const UPDATE_PINNED_ITEMS = `
  mutation($ids: [ID!]!) {
    updateUserPinnedItems(input: { pinnedRepositoryIds: $ids }) {
      user {
        id
      }
    }
  }
`

const GET_PINNABLE_REPOS = `
  query GetPinnableRepos($first: Int!) {
    viewer {
      repositories(first: $first, ownerAffiliations: [OWNER], orderBy: {field: STARGAZERS, direction: DESC}) {
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

export async function fetchPinnedItems(): Promise<Pin[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  try {
    const data = await graphqlFetch(session.accessToken, GET_PINNED_ITEMS)
    return (data.viewer.pinnedItems.nodes || []) as Pin[]
  } catch (error) {
    console.error("fetchPinnedItems error:", error)
    return []
  }
}

export async function fetchPinnableRepos(): Promise<Pin[]> {
  const session = await auth()
  if (!session?.accessToken) throw new Error("Not authenticated")

  try {
    const data = await graphqlFetch(session.accessToken, GET_PINNABLE_REPOS, { first: 100 })
    return (data.viewer.repositories.nodes || []) as Pin[]
  } catch (error) {
    console.error("fetchPinnableRepos error:", error)
    return []
  }
}

export async function updatePins(repositoryIds: string[]) {
  const session = await auth()
  if (!session?.accessToken) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    console.log("Attempting to update pins with IDs:", repositoryIds)
    await graphqlFetch(session.accessToken, UPDATE_PINNED_ITEMS, { ids: repositoryIds })
    return { success: true }
  } catch (error: any) {
    console.error("updatePins server-side catch:", error.message)
    return { success: false, error: error.message }
  }
}
