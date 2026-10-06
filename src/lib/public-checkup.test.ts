import { describe, expect, it, vi } from "vitest"
import { parseUsername, runPublicCheckup } from "@/lib/public-checkup"

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }))

const repo = (name: string) => ({
  name,
  full_name: `octo/${name}`,
  description: null,
  archived: false,
  fork: false,
  pushed_at: "2020-01-01T00:00:00Z",
  created_at: "2019-01-01T00:00:00Z",
  size: 10,
  stargazers_count: 0,
  topics: [],
  language: "Go",
  html_url: "",
  owner: { login: "octo" },
})

describe("parseUsername", () => {
  it("accepts names, @names and profile URLs", () => {
    expect(parseUsername("octocat")).toBe("octocat")
    expect(parseUsername("  @octocat ")).toBe("octocat")
    expect(parseUsername("https://github.com/octocat?tab=repositories")).toBe("octocat")
  })

  it("rejects things that can't be GitHub usernames", () => {
    for (const bad of ["", "-octo", "octo-", "oc--to", "a".repeat(40), "octo cat", "../etc"]) {
      expect(parseUsername(bad)).toBeNull()
    }
  })
})

describe("runPublicCheckup", () => {
  it("loads the user and every page of repos (up to 3)", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.endsWith("/users/octo")) return json({ login: "octo", name: "Octo", avatar_url: "a", public_repos: 150 })
      const page = Number(new URL(url).searchParams.get("page"))
      return json(page === 1 ? Array.from({ length: 100 }, (_, i) => repo(`r${i}`)) : [repo("last")])
    })
    const result = await runPublicCheckup("octo", fetchMock as unknown as typeof fetch)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result.repos).toHaveLength(101)
    expect(result.repos[0]).not.toHaveProperty("owner")
    expect(result.truncated).toBe(false)
  })

  it("maps GitHub errors to friendly codes", async () => {
    await expect(runPublicCheckup("not valid")).rejects.toMatchObject({ code: "invalid" })
    await expect(runPublicCheckup("ghost", (() => json({}, 404)) as unknown as typeof fetch)).rejects.toMatchObject({
      code: "not_found",
    })
    await expect(runPublicCheckup("busy", (() => json({}, 403)) as unknown as typeof fetch)).rejects.toMatchObject({
      code: "rate_limited",
    })
    await expect(
      runPublicCheckup("offline", (() => Promise.reject(new TypeError("fail"))) as unknown as typeof fetch)
    ).rejects.toMatchObject({ code: "network" })
  })
})
