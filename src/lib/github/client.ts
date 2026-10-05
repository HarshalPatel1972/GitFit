import { Octokit } from "octokit"
import { getAccessToken } from "@/lib/auth"

/** Server-only: an Octokit client authenticated as the signed-in user. */
export async function getOctokit() {
  return new Octokit({ auth: await getAccessToken() })
}
