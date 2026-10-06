import { isRateLimited, isUnauthorized, run, type ActionResult } from "@/lib/result"
import type { BulkActionResult } from "@/types"

/** Upper bound per server request. The client sends bulk work in smaller batches. */
export const MAX_ITEMS_PER_REQUEST = 25

/**
 * Server-side: apply `fn` to every item and report per-item success/failure.
 * An expired token fails the whole call so the client can ask the user to sign in.
 */
export async function settleEach<T>(
  items: T[],
  nameOf: (item: T) => string,
  fn: (item: T) => Promise<unknown>
): Promise<ActionResult<BulkActionResult>> {
  return run(async () => {
    if (items.length > MAX_ITEMS_PER_REQUEST) {
      throw new Error(`At most ${MAX_ITEMS_PER_REQUEST} items per request`)
    }

    const results = await Promise.allSettled(items.map(fn))
    const summary: BulkActionResult = { succeeded: [], failed: [], rateLimited: false }

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        summary.succeeded.push(nameOf(items[i]))
        return
      }
      if (isUnauthorized(result.reason)) throw result.reason
      if (isRateLimited(result.reason)) summary.rateLimited = true
      summary.failed.push({
        name: nameOf(items[i]),
        error: result.reason instanceof Error ? result.reason.message : "Unknown error",
      })
    })

    return summary
  })
}

export function splitFullName(fullName: string) {
  const [owner, repo] = fullName.split("/")
  if (!owner || !repo) throw new Error(`Invalid repository name: ${fullName}`)
  return { owner, repo }
}
