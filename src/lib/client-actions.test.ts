import { describe, expect, it, vi } from "vitest"

const signOut = vi.fn()
vi.mock("next-auth/react", () => ({ signOut: (...args: unknown[]) => signOut(...args) }))

import { fetchAllPages, handleSessionExpiry, runBulk } from "@/lib/client-actions"
import { GitFitError, type ActionResult } from "@/lib/result"
import type { BulkActionResult } from "@/types"

const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data })
const fail = (code: "unauthorized" | "rate_limited" | "unknown", message = "x") =>
  ({ ok: false, error: { code, message } }) as const
const items = Array.from({ length: 25 }, (_, i) => `owner/r${i}`)
const allSucceed = async (batch: string[]) => ok<BulkActionResult>({ succeeded: batch, failed: [] })

describe("runBulk", () => {
  it("sends work in batches of at most 10 and reports progress", async () => {
    const sizes: number[] = []
    const progress: string[] = []
    const result = await runBulk(
      items,
      async (batch) => {
        sizes.push(batch.length)
        return allSucceed(batch)
      },
      { onProgress: (done, total) => progress.push(`${done}/${total}`) }
    )
    expect(sizes).toEqual([10, 10, 5])
    expect(progress).toEqual(["0/25", "10/25", "20/25", "25/25"])
    expect(result.succeeded).toHaveLength(25)
    expect(result.failed).toEqual([])
  })

  it("collects per-item failures without stopping", async () => {
    const result = await runBulk(items, async (batch) =>
      ok<BulkActionResult>({
        succeeded: batch.filter((n) => n !== "owner/r13"),
        failed: batch.includes("owner/r13") ? [{ name: "owner/r13", error: "Not Found" }] : [],
      })
    )
    expect(result.succeeded).toHaveLength(24)
    expect(result.failed).toEqual([{ name: "owner/r13", error: "Not Found" }])
  })

  it("stops on a rate limit, skips the rest, and keeps earlier successes", async () => {
    let call = 0
    const result = await runBulk(items, async (batch) =>
      ++call === 2
        ? ok<BulkActionResult>({
            succeeded: batch.slice(0, 3),
            failed: batch.slice(3).map((name) => ({ name, error: "rate limit" })),
            rateLimited: true,
          })
        : allSucceed(batch)
    )
    expect(call).toBe(2)
    expect(result.rateLimited).toBe(true)
    expect(result.succeeded).toHaveLength(13)
    expect(result.failed).toHaveLength(12)
    expect(result.failed.at(-1)?.error).toMatch(/^Skipped/)
  })

  it("marks the remaining items failed when a request errors", async () => {
    let call = 0
    const result = await runBulk(items, async (batch) =>
      ++call === 2 ? fail("unknown", "server down") : allSucceed(batch)
    )
    expect(result.succeeded).toHaveLength(10)
    expect(result.failed).toHaveLength(15)
    expect(result.failed[0].error).toBe("server down")
  })

  it("throws when the session has expired so the UI can sign out", async () => {
    await expect(runBulk(items, async () => fail("unauthorized"))).rejects.toMatchObject({
      code: "unauthorized",
    })
  })

  it("names non-string items with nameOf", async () => {
    const issues = [{ n: 1 }, { n: 2 }]
    const result = await runBulk(issues, async () => fail("unknown", "boom"), {
      nameOf: (i) => `#${i.n}`,
    })
    expect(result.failed.map((f) => f.name)).toEqual(["#1", "#2"])
  })
})

describe("fetchAllPages", () => {
  it("follows pages until there is no next page", async () => {
    const pages = await fetchAllPages(async (page) => ok({ items: [page], hasNext: page < 3 }))
    expect(pages).toEqual({ items: [1, 2, 3], truncated: false })
  })

  it("stops at maxPages and reports truncation", async () => {
    const onProgress = vi.fn()
    const pages = await fetchAllPages(async (page) => ok({ items: [page], hasNext: true }), {
      maxPages: 10,
      onProgress,
    })
    expect(pages.items).toHaveLength(10)
    expect(pages.truncated).toBe(true)
    expect(onProgress).toHaveBeenLastCalledWith(10)
  })

  it("throws the server error", async () => {
    await expect(fetchAllPages(async () => fail("rate_limited", "slow down"))).rejects.toThrow(
      "slow down"
    )
  })
})

describe("handleSessionExpiry", () => {
  it("signs out with a notice only for expired sessions", () => {
    expect(handleSessionExpiry(new Error("other"))).toBe(false)
    expect(signOut).not.toHaveBeenCalled()
    expect(handleSessionExpiry(new GitFitError({ code: "unauthorized", message: "x" }))).toBe(true)
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/?error=session_expired" })
  })
})
