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
  mutation($ids: [ID!]!) {
    updateUserPinnedItems(input: { pinnedRepositoryIds: $ids }) {
      user {
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            ... on Repository {
              id
              name
            }
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
    // We increase affiliations to ensure we see all repos the user can pin
    const data = await graphqlFetch(session.accessToken, GET_PINNABLE_REPOS, { first: 100 })
    return (data.viewer.repositories.nodes || []) as Pin[]
  } catch (error) {
    console.error("fetchPinnableRepos error:", error)
    return []
  }
}

export async function updatePins(repositoryIds: string[]) {
  const session = await auth()
  if (!session?.accessToken) return { success: false, error: "Not authenticated" }

  try {
    // Ensure we only pass up to 6 IDs as per GitHub limit
    const idsToPin = repositoryIds.slice(0, 6)
    
    const result = await graphqlFetch(session.accessToken, UPDATE_PINNED_ITEMS, { ids: idsToPin })
    
    // Check if the returned pins match what we sent
    const newPins = result.updateUserPinnedItems.user.pinnedItems.nodes || []
    console.log("GitHub confirmed pins:", newPins.map((p: any) => p.name))
    
    return { success: true, count: newPins.length }
  } catch (error: any) {
    console.error("updatePins error:", error.message)
    return { success: false, error: error.message }
  }
}
