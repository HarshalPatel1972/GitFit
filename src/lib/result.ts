// Shared by server actions and client code. Server actions return errors as values
// because Next.js replaces thrown error messages with a generic one in production.

export type ActionErrorCode = "unauthorized" | "rate_limited" | "unknown"

export interface ActionError {
  code: ActionErrorCode
  message: string
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError }

export function isUnauthorized(error: unknown): boolean {
  const status = (error as { status?: number })?.status
  const message = error instanceof Error ? error.message : ""
  return status === 401 || message === "Not authenticated"
}

export function isRateLimited(error: unknown): boolean {
  const status = (error as { status?: number })?.status
  const message = error instanceof Error ? error.message : ""
  return status === 429 || (status === 403 && /rate limit/i.test(message))
}

export function toActionError(error: unknown): ActionError {
  if (isUnauthorized(error)) {
    return { code: "unauthorized", message: "Your GitHub session has expired. Please sign in again." }
  }
  if (isRateLimited(error)) {
    return {
      code: "rate_limited",
      message: "GitHub's rate limit was reached. Please wait a few minutes and try again.",
    }
  }
  const message = error instanceof Error ? error.message : "Unknown error"
  return { code: "unknown", message: message.slice(0, 300) }
}

/** Server-side: run an action and convert any failure into an ActionResult. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (error) {
    const actionError = toActionError(error)
    if (actionError.code === "unknown") console.error("GitHub action failed:", error)
    return { ok: false, error: actionError }
  }
}

/** Client-side error carrying the server's error code. */
export class GitFitError extends Error {
  code: ActionErrorCode
  constructor({ code, message }: ActionError) {
    super(message)
    this.name = "GitFitError"
    this.code = code
  }
}

export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.data
  throw new GitFitError(result.error)
}

export interface Page<T> {
  items: T[]
  hasNext: boolean
}

/** True when a GitHub REST response's Link header points to another page. */
export function hasNextPage(headers: { link?: string }): boolean {
  return /rel="next"/.test(headers.link ?? "")
}
