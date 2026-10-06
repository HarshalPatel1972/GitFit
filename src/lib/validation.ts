/** GitHub repo names: letters, digits, ".", "-", "_", up to 100 chars, not "." or "..". */
export function validateRepoName(name: string): string | null {
  if (!name) return "Name cannot be empty"
  if (name.length > 100) return "Longer than 100 characters"
  if (name === "." || name === "..") return "Reserved name"
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return "Only letters, numbers, . - _ allowed"
  return null
}

/** GitHub topics: lowercase letters, digits and hyphens, max 50 chars, no leading/trailing hyphen. */
export function normalizeTopic(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .replace(/-$/, "")
}
