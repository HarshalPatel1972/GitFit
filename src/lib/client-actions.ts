"use client"

import { signOut } from "next-auth/react"
import { GitFitError, unwrap, type ActionResult, type Page } from "@/lib/result"
import type { BulkActionResult } from "@/types"

/**
 * Loads every page from a paged server action, one short request per page, so large
 * accounts never hit the hosting platform's request time limit.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<ActionResult<Page<T>>>,
  { maxPages = 100, onProgress }: { maxPages?: number; onProgress?: (loaded: number) => void } = {}
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = []
  for (let page = 1; page <= maxPages; page++) {
    const { items: pageItems, hasNext } = unwrap(await fetchPage(page))
    items.push(...pageItems)
    onProgress?.(items.length)
    if (!hasNext) return { items, truncated: false }
  }
  return { items, truncated: true }
}

const BULK_BATCH_SIZE = 10

/**
 * Runs a bulk server action in batches (GitHub allows roughly one write per second),
 * reporting progress. Stops early on rate limits or errors and reports the rest as skipped,
 * keeping whatever already succeeded.
 */
export async function runBulk<T>(
  items: T[],
  action: (batch: T[]) => Promise<ActionResult<BulkActionResult>>,
  {
    nameOf = String,
    onProgress,
  }: { nameOf?: (item: T) => string; onProgress?: (done: number, total: number) => void } = {}
): Promise<BulkActionResult> {
  const total: BulkActionResult = { succeeded: [], failed: [], rateLimited: false }
  onProgress?.(0, items.length)

  for (let start = 0; start < items.length; start += BULK_BATCH_SIZE) {
    const batch = items.slice(start, start + BULK_BATCH_SIZE)
    const skipRest = (reason: string, from: number) =>
      items.slice(from).forEach((item) => total.failed.push({ name: nameOf(item), error: reason }))

    let result: BulkActionResult
    try {
      result = unwrap(await action(batch))
    } catch (error) {
      if (isSessionExpired(error)) throw error
      if (error instanceof GitFitError && error.code === "rate_limited") total.rateLimited = true
      skipRest(error instanceof Error ? error.message : "Request failed", start)
      break
    }

    total.succeeded.push(...result.succeeded)
    total.failed.push(...result.failed)
    onProgress?.(Math.min(start + BULK_BATCH_SIZE, items.length), items.length)

    if (result.rateLimited) {
      total.rateLimited = true
      skipRest("Skipped: GitHub rate limit reached", start + BULK_BATCH_SIZE)
      break
    }
  }

  return total
}

export function isSessionExpired(error: unknown): boolean {
  return error instanceof GitFitError && error.code === "unauthorized"
}

/** Signs the user out with a "session expired" notice if the GitHub token stopped working. */
export function handleSessionExpiry(error: unknown): boolean {
  if (!isSessionExpired(error)) return false
  signOut({ redirectTo: "/?error=session_expired" })
  return true
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong"
}
