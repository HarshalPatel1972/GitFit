import { describe, expect, it } from "vitest"
import { MAX_ITEMS_PER_REQUEST, settleEach, splitFullName } from "@/lib/github/settle"

const httpError = (status: number, message = "error") => Object.assign(new Error(message), { status })

describe("settleEach", () => {
  it("reports each item's success or failure", async () => {
    const result = await settleEach(["a/1", "a/2"], (n) => n, async (n) => {
      if (n === "a/2") throw httpError(404, "Not Found")
    })
    expect(result).toEqual({
      ok: true,
      data: { succeeded: ["a/1"], failed: [{ name: "a/2", error: "Not Found" }], rateLimited: false },
    })
  })

  it("flags rate limiting", async () => {
    const result = await settleEach(["a/1"], (n) => n, async () => {
      throw httpError(403, "You have exceeded a secondary rate limit")
    })
    expect(result.ok && result.data.rateLimited).toBe(true)
  })

  it("fails the whole call when the token is rejected", async () => {
    const result = await settleEach(["a/1", "a/2"], (n) => n, async () => {
      throw httpError(401, "Bad credentials")
    })
    expect(result).toMatchObject({ ok: false, error: { code: "unauthorized" } })
  })

  it("refuses oversized requests", async () => {
    const tooMany = Array.from({ length: MAX_ITEMS_PER_REQUEST + 1 }, (_, i) => `a/${i}`)
    let calls = 0
    const result = await settleEach(tooMany, (n) => n, async () => {
      calls++
    })
    expect(result.ok).toBe(false)
    expect(calls).toBe(0)
  })
})

describe("splitFullName", () => {
  it("splits owner/repo and rejects malformed names", () => {
    expect(splitFullName("octo/hello")).toEqual({ owner: "octo", repo: "hello" })
    expect(() => splitFullName("nope")).toThrow()
  })
})
