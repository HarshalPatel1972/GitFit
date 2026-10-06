import { describe, expect, it } from "vitest"
import { normalizeTopic, validateRepoName } from "@/lib/validation"

describe("validateRepoName", () => {
  it("accepts names GitHub allows", () => {
    for (const name of ["my-repo", "My_Repo.v2", "a", "x".repeat(100)]) {
      expect(validateRepoName(name)).toBeNull()
    }
  })

  it("rejects names GitHub would refuse", () => {
    expect(validateRepoName("")).toMatch(/empty/)
    expect(validateRepoName("x".repeat(101))).toMatch(/100/)
    expect(validateRepoName("..")).toMatch(/Reserved/)
    expect(validateRepoName("has space")).toMatch(/Only/)
    expect(validateRepoName("emoji🚀")).toMatch(/Only/)
  })
})

describe("normalizeTopic", () => {
  it("lowercases and replaces invalid characters with hyphens", () => {
    expect(normalizeTopic("  Machine Learning ")).toBe("machine-learning")
    expect(normalizeTopic("C++/Rust!!")).toBe("c-rust")
    expect(normalizeTopic("--edge--")).toBe("edge")
  })

  it("caps topics at 50 characters without a trailing hyphen", () => {
    const topic = normalizeTopic(`${"a".repeat(49)} b`)
    expect(topic.length).toBeLessThanOrEqual(50)
    expect(topic.endsWith("-")).toBe(false)
  })
})
