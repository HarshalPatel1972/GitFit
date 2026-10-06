import { describe, expect, it, vi } from "vitest"
import { GitFitError, hasNextPage, run, toActionError, unwrap } from "@/lib/result"

const httpError = (status: number, message = "error") => Object.assign(new Error(message), { status })

describe("toActionError", () => {
  it("treats a 401 or a missing session as unauthorized", () => {
    expect(toActionError(httpError(401, "Bad credentials")).code).toBe("unauthorized")
    expect(toActionError(new Error("Not authenticated")).code).toBe("unauthorized")
  })

  it("detects primary and secondary rate limits", () => {
    expect(toActionError(httpError(429)).code).toBe("rate_limited")
    expect(toActionError(httpError(403, "API rate limit exceeded")).code).toBe("rate_limited")
    expect(toActionError(httpError(403, "Must have admin rights")).code).toBe("unknown")
  })

  it("keeps the original message for other errors, truncated", () => {
    const error = toActionError(new Error("x".repeat(500)))
    expect(error.code).toBe("unknown")
    expect(error.message).toHaveLength(300)
  })
})

describe("run / unwrap", () => {
  it("wraps success and failure as values", async () => {
    expect(await run(async () => 42)).toEqual({ ok: true, data: 42 })
    vi.spyOn(console, "error").mockImplementation(() => {})
    const failed = await run(async () => {
      throw httpError(401)
    })
    expect(failed).toMatchObject({ ok: false, error: { code: "unauthorized" } })
  })

  it("unwrap returns data or throws a GitFitError with the code", () => {
    expect(unwrap({ ok: true, data: "a" })).toBe("a")
    try {
      unwrap({ ok: false, error: { code: "rate_limited", message: "wait" } })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(GitFitError)
      expect(error).toMatchObject({ code: "rate_limited", message: "wait" })
    }
  })
})

describe("hasNextPage", () => {
  it("reads GitHub's Link header", () => {
    expect(hasNextPage({ link: '<https://api.github.com/x?page=2>; rel="next", <…>; rel="last"' })).toBe(true)
    expect(hasNextPage({ link: '<https://api.github.com/x?page=1>; rel="prev"' })).toBe(false)
    expect(hasNextPage({})).toBe(false)
  })
})
