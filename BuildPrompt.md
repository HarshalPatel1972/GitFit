# GitFit — Complete Build Prompt
**Repository:** https://github.com/HarshalPatel1972/GitFit.git  
**Tagline:** *Your GitHub, finally under control.*  
**Version:** Full Spec (All Phases)  
**Author:** Harshal Patel

---

## 0. Agent Operating Rules (Read First — Never Violate)

1. **Atomic commits only.** Every commit = one logical unit of work. Never bundle unrelated changes. Commit message format: `type(scope): description` — e.g. `feat(auth): add GitHub OAuth with NextAuth v5`, `fix(bulk): handle rate limit on archive`, `style(dashboard): refine repo card hover state`. Types: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`, `test`.
2. **Never commit broken code.** Every commit must leave the app in a runnable state.
3. **Feature branches.** Branch per feature: `feat/bulk-actions`, `feat/stars-manager`, `feat/pins-editor`. Merge to `main` when feature is complete and stable.
4. **Read this entire document before writing a single line of code.**
5. **Environment variables go in `.env.local` only.** Never hardcode secrets. Always update `.env.example` when adding a new env var.
6. **No placeholder UIs.** Every screen built must be functional and match the design system. No lorem ipsum. No grey boxes.
7. **Mobile-first responsive.** Every component must work at 320px and scale up gracefully.
8. **Optimistic UI everywhere.** Mutations update the UI instantly; API fires in background. On error, revert and toast.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | GitFit |
| **Domain** | gitfit.vercel.app (or custom) |
| **Repo** | https://github.com/HarshalPatel1972/GitFit.git |
| **Stack** | Next.js 14 (App Router), NextAuth v5, Octokit, TanStack Query, Tailwind CSS |
| **Deploy** | Vercel (free tier, no credit card) |
| **Database** | None — GitHub API is the source of truth |
| **Auth** | GitHub OAuth only |

---

## 2. Design System

### 2.1 Philosophy

GitFit's visual language is a **warm, editorial blend of Claude's calm intelligence and GitHub's developer trust**. It should feel like someone took GitHub's information density and gave it a cozy reading-lamp glow — the kind of dashboard you *want* to open because it feels considered, warm, and human.

The aesthetic is: **Refined Warmth × Developer Precision**
- Not cold and sterile (GitHub default)
- Not garish or loud
- Warm, legible, intentional — like a beautifully typeset developer's journal

### 2.2 Color Palette (CSS Variables)

```css
:root {
  /* Core Backgrounds */
  --bg-canvas:       #0d0b09;   /* near-black with warm undertone — main app bg */
  --bg-surface:      #161310;   /* card/panel background */
  --bg-elevated:     #1e1a16;   /* modals, dropdowns, raised elements */
  --bg-hover:        #252018;   /* hover state for interactive rows */

  /* Warm Neutrals */
  --border-subtle:   #2e2820;   /* hairline borders */
  --border-default:  #3d3528;   /* default borders */
  --border-strong:   #5a4d3a;   /* focus rings, active borders */

  /* Text */
  --text-primary:    #f0ebe3;   /* headings, primary content */
  --text-secondary:  #b5a898;   /* secondary labels, metadata */
  --text-muted:      #7a6e63;   /* placeholders, disabled */
  --text-inverse:    #0d0b09;   /* text on warm accent */

  /* Accent — Warm Amber (primary action) */
  --accent-primary:     #d4a843;  /* buttons, active states, CTAs */
  --accent-primary-dim: #a07d28;  /* hover on primary */
  --accent-glow:        rgba(212, 168, 67, 0.15); /* glow for focus rings */

  /* Accent — Terracotta (destructive, delete) */
  --accent-danger:      #c0522a;
  --accent-danger-dim:  #8f3b1c;
  --accent-danger-glow: rgba(192, 82, 42, 0.15);

  /* Accent — Sage Green (success, public) */
  --accent-success:     #6b9e72;
  --accent-success-dim: #4f7a56;

  /* Accent — Slate Blue (archive, neutral action) */
  --accent-neutral:     #6b83a0;
  --accent-neutral-dim: #4f6278;

  /* Semantic states */
  --repo-public:    var(--accent-success);
  --repo-private:   var(--accent-neutral);
  --repo-archived:  var(--text-muted);
  --repo-forked:    #a07d28;

  /* Shadows */
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:   0 12px 40px rgba(0,0,0,0.6);
  --shadow-glow: 0 0 0 3px var(--accent-glow);
}
```

### 2.3 Typography

**Primary Font: Fraunces** (variable, from Google Fonts)  
Use `@import` in `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&display=swap');
```

```css
/* Type Scale */
--font-display: 'Fraunces', Georgia, serif;   /* headings, logo, hero text */
--font-body:    'Fraunces', Georgia, serif;   /* body copy — Fraunces is legible enough */
--font-mono:    'JetBrains Mono', 'Fira Code', monospace; /* code, repo names, counts */

/* Sizes */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — meta, secondary */
--text-base: 1rem;      /* 16px — body default */
--text-lg:   1.125rem;  /* 18px — card titles */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px — section headers */
--text-3xl:  1.875rem;  /* 30px — page titles */
--text-4xl:  2.25rem;   /* 36px — hero */

/* Weights */
--weight-light:   300;
--weight-regular: 400;
--weight-medium:  500;
--weight-semibold:600;
--weight-bold:    700;
--weight-black:   900;
```

**Font Personality Rules:**
- Repo names → `font-mono` (they are identifiers)
- All headings → Fraunces, weight 600–800, optical size 144
- Stats/counts → Fraunces italic, weight 300–400 (elegant, airy)
- Action labels (button text) → Fraunces, weight 600, tracking `+0.02em`
- Metadata (dates, sizes) → Fraunces, weight 300, muted color

### 2.4 Spacing & Layout

```
Base unit: 4px
Layout max-width: 1280px
Sidebar width: 240px
Content padding: 24px (desktop), 16px (mobile)
Card gap: 16px
Section gap: 48px
```

### 2.5 Component Tokens

```css
/* Border radius */
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-full: 9999px;

/* Transitions */
--transition-fast:   120ms ease;
--transition-base:   200ms ease;
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 2.6 Core Component Specs

**Repo Card**
- Background: `--bg-surface`
- Border: `1px solid --border-subtle`
- Border-radius: `--radius-lg`
- Padding: `16px 20px`
- On hover: border transitions to `--border-default`, `translateY(-1px)`, subtle shadow
- Checkbox appears on hover (top-left) OR when any card is selected (all cards show checkbox)
- Selection state: `--border-strong` border, `--accent-glow` box-shadow
- Repo name: `font-mono`, `--text-base`, `--text-primary`
- Description: Fraunces, `--text-sm`, `--text-secondary`, 2-line clamp
- Meta row: language dot + name, star count, fork count, last pushed — Fraunces light, `--text-muted`
- Badges: `public` (sage pill), `private` (slate pill), `archived` (grey pill), `fork` (amber pill)

**Bulk Action Bar** (floats at bottom when ≥1 repo selected)
- Fixed, bottom-center, `translateY(100%)` → `translateY(0)` spring animation on appear
- Background: `--bg-elevated`, backdrop-blur, border `--border-strong`
- Border-radius: `--radius-xl`
- Padding: `12px 20px`
- Contents: "N selected" label | Divider | [Archive] [Privatize] [Publicize] [Tag] [Rename] [Delete]
- Delete button: terracotta color, separated by divider from other actions
- Each button: icon + label, `--radius-md`, hover fills with action accent color
- Dismiss: click outside selected repos, or press Escape

**Filter Bar**
- Sticky below the header
- Horizontal scroll on mobile (no wrapping)
- Filters: Search (full-text across name+description), Visibility (All / Public / Private), Status (All / Active / Archived), Language (dropdown, all unique languages detected), Sort (Updated / Name / Stars / Size / Created)
- Each filter pill: `--bg-elevated`, active state fills with `--accent-primary` at 20% opacity + amber border

**Toast Notifications**
- Top-right, stacked
- Success: sage green left border
- Error: terracotta left border
- Undo toasts: include countdown bar + "Undo" button (3s window for reversible actions)

---

## 3. Project Structure

```
gitfit/
├── .github/
│   └── copilot-instructions.md      ← agent operating rules (copy from Section 0)
├── app/
│   ├── layout.tsx                   ← root layout, fonts, providers
│   ├── page.tsx                     ← landing page (unauthenticated)
│   ├── (auth)/
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── (app)/
│   │   ├── layout.tsx               ← authenticated layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx             ← main repo manager
│   │   ├── stars/
│   │   │   └── page.tsx             ← stars manager
│   │   ├── feed/
│   │   │   └── page.tsx             ← cross-repo PR + issue feed
│   │   ├── pins/
│   │   │   └── page.tsx             ← pin editor
│   │   └── settings/
│   │       └── page.tsx             ← app preferences
├── components/
│   ├── ui/                          ← base components (Button, Badge, Toast, Modal, Input)
│   ├── repo/
│   │   ├── RepoCard.tsx
│   │   ├── RepoGrid.tsx
│   │   ├── FilterBar.tsx
│   │   ├── BulkActionBar.tsx
│   │   └── BulkDeleteConfirm.tsx
│   ├── stars/
│   │   ├── StarCard.tsx
│   │   └── StarGrid.tsx
│   ├── feed/
│   │   ├── FeedItem.tsx
│   │   └── FeedList.tsx
│   ├── pins/
│   │   └── PinEditor.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── UserMenu.tsx
├── lib/
│   ├── github/
│   │   ├── client.ts                ← Octokit REST client factory
│   │   ├── graphql.ts               ← GitHub GraphQL client factory
│   │   ├── repos.ts                 ← repo fetch helpers
│   │   ├── stars.ts                 ← stars fetch helpers
│   │   ├── feed.ts                  ← PRs + issues fetch helpers
│   │   └── pins.ts                  ← pin GraphQL queries
│   └── actions/
│       ├── bulk.ts                  ← bulkPrivatize, bulkArchive, bulkDelete, bulkTag, bulkRename
│       ├── stars.ts                 ← unstar, bulk unstar
│       └── pins.ts                  ← updatePins
├── hooks/
│   ├── useRepos.ts
│   ├── useSelection.ts
│   ├── useStars.ts
│   └── useFeed.ts
├── types/
│   └── index.ts                     ← GitFitRepo, GitFitStar, FeedItem, Pin types
├── .env.example
├── .env.local                       ← NEVER commit
└── tailwind.config.ts
```

---

## 4. Environment Variables

```bash
# .env.example
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                     # openssl rand -base64 32

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# GitHub OAuth App settings:
# Homepage URL: http://localhost:3000
# Callback URL: http://localhost:3000/api/auth/callback/github
```

**Required OAuth Scopes** (set in NextAuth config):
```
repo            # Read + write all repos (public + private)
delete_repo     # Separate scope required for deletion
user            # Profile, avatar, username
read:org        # Phase 3 — org repos
```

---

## 5. Phase 1 — Core Repo Manager

### 5.1 Landing Page (`/`)

Shown only to unauthenticated users. Authenticated users redirect to `/dashboard`.

**Layout:**
- Full-viewport hero
- Background: `--bg-canvas` with a very subtle warm noise texture (CSS `filter: url(#noise)` SVG filter or `background-image: url(/noise.png)`)
- Centered content, generous vertical padding

**Hero Content:**
```
[GitFit logotype — Fraunces Black, --text-4xl, warm amber]

Your GitHub,
finally under control.
[Fraunces Light Italic, --text-3xl, --text-secondary, 2 lines]

[Sign in with GitHub — primary button, full icon + label]
```

**Feature Grid** (below hero, 3-column):
```
🗂  Bulk Actions        — Archive, privatize, delete — 10 repos in 10 seconds.
🔍  Smart Filters       — Dead repos, by language, by age. Find anything instantly.
⭐  Stars Manager       — Browse and prune your 400 forgotten starred repos.
📌  Pin Editor          — Drag, reorder, publish. Visual pin management.
🔀  Cross-repo Feed     — All your PRs and issues. One dashboard.
🏷  Bulk Tagging        — Add topics to 20 repos in one click.
```

**Footer:** "Open source. No data stored. Reads and writes only through GitHub's official API."

---

### 5.2 Authentication

Use **NextAuth v5** (Auth.js).

```ts
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo delete_repo user read:org"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    }
  }
})
```

Store `accessToken` on the session. Every server action reads it via `await auth()`.

---

### 5.3 Authenticated Layout

**Sidebar (240px, fixed left):**
```
[GitFit logo — top, links to /dashboard]
─────────────────────
Dashboard      (grid icon)
Stars          (star icon)
Feed           (activity icon)
Pins           (pin icon)
─────────────────────
Settings       (gear icon)
─────────────────────
[Avatar + username]
[Sign out]
```

Sidebar background: `--bg-surface`. Active item: amber left border (`3px solid --accent-primary`), `--bg-hover` fill.

**Main content area:** `calc(100vw - 240px)`, scrollable, `--bg-canvas`.

**Mobile:** Sidebar collapses to hamburger. Slides in from left as overlay.

---

### 5.4 Dashboard — Repo Manager

**Page Header:**
```
Your Repositories
[Fraunces, --text-3xl]   [Refresh button]

[X public] [Y private] [Z archived] [total: N]
[stat pills, Fraunces Light Italic]
```

**Filter Bar (sticky):**
```
[🔍 Search repos...]  [Visibility ▾]  [Status ▾]  [Language ▾]  [Sort ▾]  [View: Grid|List]
```

**Repo Grid:** CSS Grid, `repeat(auto-fill, minmax(320px, 1fr))`.

**Repo Card spec:** (see Section 2.6)

**Selection UX:**
- Clicking anywhere on a card (not links) while holding Shift selects a range
- "Select All" checkbox in filter bar header when ≥1 card is rendered
- Selection count badge floats on Bulk Action Bar

**Bulk Action Bar spec:** (see Section 2.6)

---

### 5.5 Bulk Actions — Server Actions

All actions live in `lib/actions/bulk.ts`. Use `'use server'` directive.

```ts
// Pattern for all bulk actions
'use server'
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { Octokit } from "octokit"

export async function bulkPrivatize(repoFullNames: string[]) {
  const session = await auth()
  const octokit = new Octokit({ auth: session!.accessToken })

  const results = await Promise.allSettled(
    repoFullNames.map(fullName => {
      const [owner, repo] = fullName.split('/')
      return octokit.rest.repos.update({ owner, repo, private: true })
    })
  )

  return summarizeResults(results, repoFullNames)
}
```

**Implement all of these:**

| Function | API call | Reversible? |
|---|---|---|
| `bulkPrivatize(names[])` | `PATCH /repos/{owner}/{repo}` `{private: true}` | Yes → bulkPublicize |
| `bulkPublicize(names[])` | `PATCH /repos/{owner}/{repo}` `{private: false}` | Yes → bulkPrivatize |
| `bulkArchive(names[])` | `PATCH /repos/{owner}/{repo}` `{archived: true}` | Yes → bulkUnarchive |
| `bulkUnarchive(names[])` | `PATCH /repos/{owner}/{repo}` `{archived: false}` | Yes |
| `bulkDelete(names[])` | `DELETE /repos/{owner}/{repo}` | **No** — require count confirm |
| `bulkAddTopics(names[], topics[])` | `PUT /repos/{owner}/{repo}/topics` | Yes |
| `bulkRemoveTopics(names[], topics[])` | `PUT /repos/{owner}/{repo}/topics` | Yes |
| `bulkUpdateDescription(updates[])` | `PATCH /repos/{owner}/{repo}` `{description}` | Yes |
| `bulkRename(renames[])` | `PATCH /repos/{owner}/{repo}` `{name}` | Yes |

**Rate Limit Handling:**
- GitHub REST: 5000 req/hour for authenticated users
- Detect `403` with `X-RateLimit-Remaining: 0`
- On rate limit: pause, show "Rate limited — resuming in Xs" toast with live countdown, retry
- Use `Promise.allSettled` — never `Promise.all` — so partial failures don't abort everything
- Return `{ succeeded: string[], failed: { name: string, error: string }[] }` from every action

**Delete Confirmation Modal:**
```
Deleting 7 repositories

This action is permanent and cannot be undone.
These repos will be gone forever.

Type [7] to confirm:
[___________]

[Cancel]  [Delete 7 repos — terracotta button, disabled until count matches]
```

---

### 5.6 Bulk Rename

Open a modal with a rename pattern editor:

```
Rename 5 repositories

Mode: [Add prefix ▾]  [Add suffix]  [Find & replace]  [Custom per repo]

Prefix: [archive-_____________]

Preview:
  my-old-project     →  archive-my-old-project
  test-thing         →  archive-test-thing
  unused-api         →  archive-unused-api

[Cancel]  [Apply Rename]
```

Custom per-repo mode shows a table with editable name fields.

---

### 5.7 Bulk Topic Editor

Open a panel from the Bulk Action Bar:

```
Manage Topics for 6 repos

Add topics: [+ react] [+ typescript] [+ nextjs]   [Type to add...]

Remove topics (found across selected repos):
  [✕ javascript]  [✕ webpack]  [✕ create-react-app]

[Cancel]  [Apply]
```

---

### 5.8 Dead Repos Detector

A surfaced "view" in the Dashboard filter bar: **"Dead Repos"** filter preset.

Definition: `pushed_at` older than 6 months AND not archived.

When active, shows a banner:
```
🪦  23 repos haven't had activity in 6+ months.
    Bulk archive them to clean up your profile.
    [Select All Dead]  [Archive Selected]
```

---

## 6. Phase 2 — Stars Manager & Pins Editor

### 6.1 Stars Manager (`/stars`)

**Page Header:**
```
Starred Repositories
[N total stars]  [X languages]

[Search stars...]  [Language ▾]  [Sort: Recently starred ▾]
```

**Star Card:** Same card design as repo card but lighter — shows original owner/repo, star date, language, description, and an "Unstar" hover button (amber star → grey).

**Bulk Unstar:**
- Same multi-select UX as dashboard
- Bulk Action Bar shows only: [Unstar Selected]
- No destructive confirm needed (re-starring is easy)

**Grouping toggle:** Flat list OR grouped by language (accordion sections).

**"Forgotten Stars" preset filter:** Starred >1 year ago, never visited (no way to detect visits, so just age-based). Banner: "You starred these 1+ year ago. Still relevant?"

**API:** `GET /user/starred` (paginated, 100 per page — fetch all via loop). Unstar: `DELETE /user/starred/{owner}/{repo}`.

---

### 6.2 Pins Editor (`/pins`)

GitHub lets you pin exactly 6 items (repos or gists) on your profile. This is only editable via **GitHub GraphQL API**.

**Page Layout:**
```
Profile Pins

Your profile shows these 6 pinned items.
Drag to reorder. Click × to remove. Click + to add from your repos.

[Pin 1 card]  [Pin 2 card]  [Pin 3 card]
[Pin 4 card]  [Pin 5 card]  [Pin 6 card — or Add +]

[Save Pins — primary button]
```

**Pin Card:** Draggable. Shows repo name, description, language, stars. Drag handle on left. Remove × on top-right.

**Add Pin Modal:** Searchable list of your non-pinned repos. Click to add (up to 6 total).

**Drag & Drop:** Use `@dnd-kit/core` and `@dnd-kit/sortable`. Smooth spring animation on reorder.

**GraphQL mutations:**
```graphql
mutation UpdatePinnedItems($input: UpdateUserPinnedItemsInput!) {
  updateUserPinnedItems(input: $input) {
    pinnedItems {
      nodes {
        ... on Repository {
          id
          name
          description
        }
      }
    }
  }
}
```

Fetch current pins:
```graphql
query GetPinnedItems {
  viewer {
    pinnedItems(first: 6, types: [REPOSITORY]) {
      nodes {
        ... on Repository {
          id
          name
          description
          stargazerCount
          primaryLanguage { name color }
        }
      }
    }
  }
}
```

---

## 7. Phase 3 — Cross-Repo Feed & Stale Issue Manager

### 7.1 Cross-Repo Feed (`/feed`)

**The problem:** GitHub has no unified view of all your open PRs and issues across all repos.

**Page Layout:**
```
Activity Feed

[Tab: Open PRs (N)] [Tab: Open Issues (N)] [Tab: Stale Issues (N)]

[Filter: All repos ▾]  [Filter: All labels ▾]  [Sort: Updated ▾]
```

**Feed Item Card:**
```
[repo-owner/repo-name]        [PR #123 or Issue #456]
Title of the PR or Issue                              [2 days ago]
[Labels: bug  enhancement]    [Assignees: avatar avatar]
```

Clicking a feed item opens in a new tab to the actual GitHub URL.

**Stale Issues Tab:**
- Issues open for more than 30/60/90 days (configurable filter)
- Bulk action: **Bulk Close Issues** — posts a comment "Closing as stale via GitFit" then closes
- This is the only Stale-specific action. No auto-labeling (requires label management scope).

**API:**
```
GET /user/issues?filter=all&state=open&sort=updated&per_page=100
GET /user/pulls?state=open&sort=updated&per_page=100
```

Note: `/user/issues` returns issues from repos you own or are assigned to. Paginate fully.

---

### 7.2 Stale Issue Bulk-Close

Bulk Action Bar for issues:
```
[N selected]  |  [Close Issues]  [Add Label ▾]  [Assign ▾]
```

**Close Issues action:**
```ts
export async function bulkCloseIssues(issues: { owner: string, repo: string, number: number }[]) {
  // POST /repos/{owner}/{repo}/issues/{issue_number}/comments
  //   body: "Closing as stale. Managed via [GitFit](https://gitfit.vercel.app)."
  // PATCH /repos/{owner}/{repo}/issues/{issue_number}  { state: "closed" }
}
```

**Add Label to Issues (bulk):**
```ts
export async function bulkAddLabels(issues: ..., labels: string[]) {
  // POST /repos/{owner}/{repo}/issues/{issue_number}/labels
}
```

---

## 8. Data Fetching Strategy

### 8.1 TanStack Query Setup

```ts
// hooks/useRepos.ts
import { useQuery } from '@tanstack/react-query'

export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: fetchAllRepos,
    staleTime: 5 * 60 * 1000,   // 5 min — repos don't change that fast
    gcTime: 30 * 60 * 1000,
  })
}
```

### 8.2 Fetching All Repos (pagination)

GitHub returns max 100 repos per page. Fetch all:

```ts
export async function fetchAllRepos(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken })
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: 'updated',
    direction: 'desc',
    affiliation: 'owner'          // owned only — not collaborator repos
  })
  return repos
}
```

Same pattern for stars: `octokit.paginate(octokit.rest.activity.listReposStarredByAuthenticatedUser, ...)`.

### 8.3 Optimistic Updates

After a bulk action succeeds on the server, update the TanStack Query cache directly:

```ts
// After bulkArchive succeeds:
queryClient.setQueryData(['repos'], (old: Repo[]) =>
  old.map(repo =>
    archivedNames.includes(repo.full_name)
      ? { ...repo, archived: true }
      : repo
  )
)
```

For delete: filter them out of cache immediately. For failed items: show error toast listing failed repo names.

---

## 9. Filtering & Sorting Logic (Client-side)

All filtering happens client-side after the full repo list is fetched. This ensures instant filter UX with zero API calls.

```ts
export function filterRepos(repos: Repo[], filters: Filters): Repo[] {
  return repos
    .filter(r => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!r.name.toLowerCase().includes(q) &&
            !(r.description?.toLowerCase().includes(q))) return false
      }
      if (filters.visibility === 'public' && r.private) return false
      if (filters.visibility === 'private' && !r.private) return false
      if (filters.status === 'archived' && !r.archived) return false
      if (filters.status === 'active' && r.archived) return false
      if (filters.language && r.language !== filters.language) return false
      if (filters.preset === 'dead') {
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        if (new Date(r.pushed_at) > sixMonthsAgo || r.archived) return false
      }
      return true
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'name':    return a.name.localeCompare(b.name)
        case 'stars':   return b.stargazers_count - a.stargazers_count
        case 'size':    return b.size - a.size
        case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })
}
```

---

## 10. Key UI Interactions (Affordance Details)

### 10.1 Checkbox Reveal
- Default: repo card shows no checkbox
- On card hover: checkbox fades in (opacity 0 → 1, 120ms)
- When ANY card is selected: ALL cards show checkboxes permanently until selection is cleared
- Clicking the card body (not the repo name link) toggles selection
- Shift+click selects a range

### 10.2 Bulk Action Bar Animation
```css
.bulk-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(120%);
  transition: transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1); /* spring overshoot */
}
.bulk-bar.visible {
  transform: translateX(-50%) translateY(0);
}
```

### 10.3 Action Confirmation Flow
- Archive / Privatize / Publicize / Tag / Rename: Immediate, no confirm. Toast with undo (3s).
- Delete: Modal confirm (type count). No undo.
- Bulk unstar: Immediate, no confirm. Toast only.
- Bulk close issues: Confirm dialog. No undo.

### 10.4 Undo Toast Spec
```
[✓ Archived 7 repos]  [Undo →]
[━━━━━━━━━━░░░░░░░░░░]   (3 second countdown bar animates left to right)
```
Undo calls the reverse action (e.g. `bulkUnarchive` with the same names). After 3s, toast auto-dismisses.

### 10.5 Loading States
- Initial repo load: Skeleton cards (6 cards, same dimensions as real cards, animated shimmer)
- Shimmer uses a CSS `@keyframes` moving gradient: `--bg-surface` → `--bg-elevated` → `--bg-surface`
- Bulk action in progress: Action bar buttons show a subtle spinner, cards being affected get a pulsing opacity (0.5 → 1 loop)
- Never block the whole page — always partial loading states

### 10.6 Empty States
Each page needs a considered empty state, not a blank screen:

**No repos match filters:**
```
🔍
No repos match your filters.
Try broadening your search or clearing filters.
[Clear filters]
```

**No stars:**
```
⭐
No starred repositories yet.
Head to GitHub and star some repos.
```

**No open issues:**
```
✓
All clear.
No open issues across your repositories.
```

### 10.7 Keyboard Shortcuts
| Key | Action |
|---|---|
| `/` | Focus search |
| `Escape` | Clear selection / close modal |
| `A` | Select all (when no input focused) |
| `Shift+A` | Deselect all |

Show a keyboard shortcuts tooltip (bottom-left corner, always visible, small `?` icon).

---

## 11. Animations Spec

### Page Load (Dashboard)
```
1. Header fades in (opacity 0→1, y: -8→0, duration: 300ms)
2. Filter bar fades in (delay: 80ms)
3. Repo cards stagger in (delay: 40ms per card, max 8 cards animated, rest instant)
   Each card: opacity 0→1, y: 12→0, duration: 250ms, ease-out
```

### Card Selection
```
Checkbox appears: opacity 0→1, scale 0.8→1, 120ms
Card border: color transition 200ms
Card box-shadow: 200ms ease
```

### Bulk Bar
Spring bounce on appear (cubic-bezier overshoot, see 10.2).

### Pins Drag
Use `@dnd-kit/sortable` with `CSS.Transform.toString(transform)` and `transition: transform 200ms ease`. Dragging card: scale 1.02, shadow increase, z-index elevation.

---

## 12. Responsive Breakpoints

```
Mobile:  < 640px   — single column, hamburger sidebar
Tablet:  640–1024px — 2-column grid, collapsible sidebar  
Desktop: > 1024px  — 3-column grid (or 2 for wider cards), full sidebar
Wide:    > 1280px  — max-width container centers content
```

**Bulk Action Bar on mobile:** full-width, sticks to bottom of viewport. Actions scroll horizontally.

**Filter Bar on mobile:** horizontal scrolling strip. No line breaks.

---

## 13. Settings Page

Simple preferences, stored in `localStorage` (no server state needed):

```
Appearance
  Theme: [Warm Dark ●] [Light]  (light mode flips palette to --bg-canvas: #faf7f2)

Dashboard
  Repos per load: [50] [100] [All]
  Default sort: [Last updated ▾]
  Default view: [Grid] [List]

Feed
  Stale threshold: [30 days] [60 days] [90 days]

Keyboard shortcuts: [View all]

Danger Zone
  Disconnect GitHub account — [Sign out]
```

---

## 14. Error Handling & Edge Cases

| Scenario | Behavior |
|---|---|
| Token expired / revoked | Redirect to sign-in with "Session expired" message |
| GitHub API rate limit hit | Pause operations, show live countdown toast |
| Partial bulk failure | Show success count + list failed repos in error toast |
| Repo has open PRs (delete) | GitHub API will still reject — surface error: "Cannot delete: has open PRs" |
| Archived repo can't be deleted | Surface clearly: "Unarchive before deleting" |
| No repos | Empty state with a link to github.com/new |
| Over 6 pins | UI prevents adding a 7th pin (button greys out) |
| Network offline | Toast: "You're offline. Changes will resume when connection returns." |

---

## 15. Atomic Commit Sequence (Build Order)

Follow this exact order. Each item = one commit (or a small logical group).

```
chore: init Next.js 14 app with TypeScript, Tailwind, ESLint
chore: configure Tailwind with design tokens and CSS variables
chore: add Fraunces font + JetBrains Mono via Google Fonts
chore: add .env.example and .gitignore
chore: create project folder structure (empty files with comments)

feat(auth): add NextAuth v5 with GitHub provider and required OAuth scopes
feat(auth): persist accessToken in session via jwt + session callbacks
feat(auth): add auth middleware to protect /dashboard, /stars, /feed, /pins
feat(auth): add sign-in redirect from / when unauthenticated

style(landing): build landing page hero with GitFit logotype
style(landing): add feature grid to landing page
style(landing): add landing page footer with privacy note

style(layout): build authenticated sidebar with navigation items
style(layout): build app header with user menu and avatar
style(layout): add mobile hamburger + slide-over sidebar

feat(github): add Octokit REST client factory using session token
feat(github): add fetchAllRepos with pagination (octokit.paginate)
feat(github): add GitFitRepo type mapping from GitHub API response

feat(dashboard): add TanStack Query provider and useRepos hook
feat(dashboard): build repo grid with RepoCard skeleton loading state
style(dashboard): build RepoCard component (name, description, badges, meta row)
feat(dashboard): add FilterBar (search, visibility, status, language, sort)
feat(dashboard): implement client-side filterRepos + sortRepos logic
style(dashboard): add page header with repo count stat pills

feat(selection): implement useSelection hook (toggle, shift-range, select-all)
style(selection): add checkbox reveal on card hover + selection state styling
feat(selection): build BulkActionBar with spring appear/dismiss animation

feat(bulk): implement bulkArchive server action
feat(bulk): implement bulkUnarchive server action
feat(bulk): add optimistic update + undo toast for archive/unarchive
feat(bulk): implement bulkPrivatize server action
feat(bulk): implement bulkPublicize server action
feat(bulk): add optimistic update + undo toast for privatize/publicize
feat(bulk): implement bulkAddTopics + bulkRemoveTopics server actions
feat(bulk): build BulkTopicEditor modal/panel
feat(bulk): implement bulkUpdateDescription server action
feat(bulk): implement bulkRename server action with prefix/suffix/find-replace
feat(bulk): build BulkRenameModal with live preview
feat(bulk): implement bulkDelete server action
feat(bulk): build BulkDeleteConfirmModal (count-typed confirmation)
feat(bulk): add rate limit detection and retry-after countdown toast

feat(dashboard): add Dead Repos preset filter (pushed >6 months, not archived)
style(dashboard): add Dead Repos banner with Select All Dead + Archive CTA

feat(stars): add fetchAllStars with pagination
feat(stars): build /stars page with StarCard component
feat(stars): add search + language filter for stars
feat(stars): add Forgotten Stars preset filter (starred >1 year ago)
feat(stars): implement unstar and bulkUnstar server actions
feat(stars): add grouped-by-language toggle view

feat(github): add GitHub GraphQL client with token
feat(github): add GetPinnedItems GraphQL query
feat(pins): build /pins page layout
feat(pins): install @dnd-kit/core @dnd-kit/sortable
feat(pins): build draggable PinCard with @dnd-kit/sortable
feat(pins): build AddPin modal with searchable repo list
feat(pins): implement updatePins GraphQL mutation server action
style(pins): polish drag animation (spring transform, shadow elevation)

feat(github): add fetchUserIssues + fetchUserPRs with pagination
feat(feed): build /feed page with tabbed layout (PRs / Issues / Stale)
feat(feed): build FeedItem card component
feat(feed): add filter by repo + sort controls
feat(feed): implement stale threshold filter (30/60/90 days)
feat(feed): implement bulkCloseIssues server action (comment + close)
feat(feed): implement bulkAddLabels server action
feat(feed): add bulk selection + BulkActionBar on feed page

feat(settings): build /settings page
feat(settings): add theme + dashboard + feed preferences to localStorage

feat(keyboard): add / shortcut to focus search
feat(keyboard): add Escape to clear selection/close modal
feat(keyboard): add A/Shift+A to select all / deselect all
feat(keyboard): add keyboard shortcuts tooltip (? icon, bottom-left)

style(animations): add staggered page-load animations to dashboard
style(animations): add shimmer skeleton loading state
style(empty-states): add empty states for all pages
style(responsive): audit and fix mobile layouts (320px minimum)

chore: audit OAuth scopes — confirm delete_repo scope works for bulk delete
chore: add error boundary for API failures
chore: final accessibility pass (focus rings, aria-labels, screen reader text)
docs: write README.md with setup instructions and feature list
chore: configure Vercel deployment, add all env vars to Vercel dashboard
```

---

## 16. README (include in repo)

```markdown
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

git clone https://github.com/HarshalPatel1972/GitFit.git
cd GitFit
cp .env.example .env.local
# Fill in GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET
npm install
npm run dev

## Stack

Next.js 14 · NextAuth v5 · Octokit · TanStack Query · Tailwind CSS · Vercel
```

---

## 17. Post-Launch Ideas (Backlog, Do Not Build Now)

- **Org support** — manage repos for GitHub orgs you admin
- **Export** — download repo list as CSV / JSON
- **Insights** — language distribution pie, activity heatmap across repos
- **GitHub Actions feed** — see failing/passing workflows across repos
- **Collaborator manager** — see who has access to what, bulk revoke
- **Webhook manager** — list and delete stale webhooks across repos
- **Deploy badges** — show Vercel/Netlify status badges inline on repo cards

---

*GitFit FullBuildPrompt.md · All Phases · Built for HarshalPatel1972*
