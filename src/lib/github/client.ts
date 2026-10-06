import { Octokit } from "octokit"
import { getAccessToken } from "@/lib/auth"

// Retry once on short rate-limit waits; fail fast on long ones instead of holding the
// request open until GitHub's hourly quota resets.
const MAX_RETRY_WAIT_SECONDS = 30

const retryIfShortWait = (retryAfter: number, options: { request: { retryCount: number } }) =>
  options.request.retryCount === 0 && retryAfter <= MAX_RETRY_WAIT_SECONDS

/** Server-only: an Octokit client authenticated as the signed-in user. */
export async function getOctokit() {
  return new Octokit({
    auth: await getAccessToken(),
    throttle: {
      onRateLimit: retryIfShortWait,
      onSecondaryRateLimit: retryIfShortWait,
    },
  })
}
