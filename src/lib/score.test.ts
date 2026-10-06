import { describe, expect, it } from "vitest"
import { analyzeRepos, formatSize, isUntouchedFork, timeSince, type ScorableRepo } from "@/lib/score"

const NOW = new Date("2026-10-06T00:00:00Z").getTime()
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString()

function repo(overrides: Partial<ScorableRepo> = {}): ScorableRepo {
  return {
    name: "r",
    full_name: "me/r",
    description: "A thing",
    archived: false,
    fork: false,
    pushed_at: daysAgo(5),
    created_at: daysAgo(400),
    size: 100,
    stargazers_count: 0,
    topics: ["cli"],
    ...overrides,
  }
}

describe("analyzeRepos", () => {
  it("gives a tidy, active account a perfect score", () => {
    const report = analyzeRepos([repo(), repo({ name: "b" })], NOW)
    expect(report.score).toBe(100)
    expect(report.grade).toBe("Perfect fit")
    expect(report.clutter).toHaveLength(0)
  })

  it("counts repos untouched for 6+ months as clutter, heaviest first", () => {
    const report = analyzeRepos(
      [
        repo({ name: "fresh" }),
        repo({ name: "old-small", pushed_at: daysAgo(400), size: 10 }),
        repo({ name: "old-big", pushed_at: daysAgo(200), size: 5000 }),
      ],
      NOW
    )
    expect(report.clutter.map((r) => r.name)).toEqual(["old-big", "old-small"])
    expect(report.clutterKB).toBe(5010)
    expect(report.score).toBe(70) // 100 - 45 * 2/3
  })

  it("does not penalise archived repos", () => {
    const report = analyzeRepos([repo(), repo({ archived: true, pushed_at: daysAgo(900), description: null })], NOW)
    expect(report.score).toBe(100)
    expect(report.archived).toBe(1)
    expect(report.active).toBe(1)
  })

  it("penalises missing descriptions, missing topics and untouched forks", () => {
    const report = analyzeRepos(
      [repo({ description: null, topics: [], fork: true, pushed_at: daysAgo(10), created_at: daysAgo(10) })],
      NOW
    )
    expect(report.noDescription).toBe(1)
    expect(report.noTopics).toBe(1)
    expect(report.untouchedForks).toBe(1)
    expect(report.score).toBe(45)
  })

  it("handles an empty account", () => {
    expect(analyzeRepos([], NOW)).toMatchObject({ score: 100, total: 0, active: 0 })
  })
})

describe("helpers", () => {
  it("detects forks that were never pushed to", () => {
    const created = daysAgo(30)
    expect(isUntouchedFork(repo({ fork: true, created_at: created, pushed_at: created }))).toBe(true)
    expect(isUntouchedFork(repo({ fork: true, created_at: created, pushed_at: daysAgo(2) }))).toBe(false)
    expect(isUntouchedFork(repo({ fork: false, created_at: created, pushed_at: created }))).toBe(false)
  })

  it("formats sizes and elapsed time", () => {
    expect(formatSize(512)).toBe("512 KB")
    expect(formatSize(5 * 1024)).toBe("5 MB")
    expect(formatSize(1.5 * 1024 * 1024)).toBe("1.5 GB")
    expect(timeSince(daysAgo(3), NOW)).toBe("3 days")
    expect(timeSince(daysAgo(70), NOW)).toBe("2 months")
    expect(timeSince(daysAgo(800), NOW)).toBe("2 years")
  })
})
