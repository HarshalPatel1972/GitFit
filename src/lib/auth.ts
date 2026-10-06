import NextAuth from "next-auth"
import { getToken } from "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import { headers } from "next/headers"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // repo: manage repos, issues, stars · delete_repo: bulk delete
          // read:org: org repos/issues · read:user + user:email: sign-in profile
          scope: "repo delete_repo read:org read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    // The GitHub token stays inside the encrypted JWT cookie. It is deliberately
    // NOT copied onto the session, because the session is readable from the browser.
  },
})

/**
 * Server-only: reads the GitHub access token from the encrypted session cookie.
 * Never return this value to the client.
 */
export async function getAccessToken(): Promise<string> {
  const reqHeaders = await headers()
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  // Cookie name depends on whether the site runs over HTTPS ("__Secure-" prefix).
  for (const secureCookie of [true, false]) {
    const token = await getToken({ req: { headers: reqHeaders }, secret, secureCookie })
    if (typeof token?.accessToken === "string") return token.accessToken
  }
  throw new Error("Not authenticated")
}
