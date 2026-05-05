# GitFit — Your GitHub, finally under control.

GitFit is a better GitHub repository manager. Authenticate once with GitHub OAuth
and get bulk operations, smart filters, a stars manager, pin editor, and
cross-repo issue/PR feed — all in one warm, fast dashboard.

## Features

- **Bulk Actions** — Archive, privatize, delete, tag, rename N repos in one click
- **Smart Filters** — Dead repos, by language, by visibility, by last activity
- **Stars Manager** — Browse, search, bulk unstar your forgotten starred repos
- **Pin Editor** — Drag-and-drop pin reordering with live GitHub profile sync
- **Cross-repo Feed** — All open PRs and issues across all your repos, unified
- **Stale Issues** — Find and bulk-close issues that have been open for months

## Privacy

GitFit stores nothing. Zero databases. Your GitHub OAuth token lives in your
browser session only. All reads and writes go directly through GitHub's official API.

## Development

```bash
git clone https://github.com/HarshalPatel1972/GitFit.git
cd GitFit
cp .env.example .env.local
# Fill in GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET
npm install
npm run dev
```

## GitHub OAuth App Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App with:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local`
4. Generate a `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

## Stack

Next.js 16 · NextAuth v5 · Octokit · TanStack Query · Tailwind CSS · Vercel
