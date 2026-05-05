// === Core Types for GitFit ===

// Extend NextAuth types to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken: string
  }
}

// === Repo Types ===

export interface GitFitRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  private: boolean
  archived: boolean
  fork: boolean
  language: string | null
  stargazers_count: number
  forks_count: number
  size: number
  pushed_at: string
  created_at: string
  updated_at: string
  topics: string[]
  owner: {
    login: string
    avatar_url: string
  }
}

// === Stars Types ===

export interface GitFitStar {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  owner: {
    login: string
    avatar_url: string
  }
  starred_at?: string
  topics: string[]
}

// === Feed Types ===

export interface FeedItem {
  id: number
  type: "pr" | "issue"
  title: string
  number: number
  state: string
  html_url: string
  created_at: string
  updated_at: string
  labels: { name: string; color: string }[]
  assignees: { login: string; avatar_url: string }[]
  repo: {
    owner: string
    name: string
    full_name: string
  }
  user: {
    login: string
    avatar_url: string
  }
}

// === Pin Types ===

export interface Pin {
  id: string
  name: string
  description: string | null
  stargazerCount: number
  primaryLanguage: {
    name: string
    color: string
  } | null
}

// === Filter Types ===

export type Visibility = "all" | "public" | "private"
export type Status = "all" | "active" | "archived"
export type SortOption = "updated" | "name" | "stars" | "size" | "created"
export type ViewMode = "grid" | "list"
export type FilterPreset = "all" | "dead"

export interface Filters {
  search: string
  visibility: Visibility
  status: Status
  language: string
  sort: SortOption
  preset: FilterPreset
}

// === Bulk Action Results ===

export interface BulkActionResult {
  succeeded: string[]
  failed: { name: string; error: string }[]
}
