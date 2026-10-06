<div align="center">
  <img src="src/app/icon.svg" width="120" height="120" alt="GitFit logo" />
  <h1>GitFit</h1>
  <p><strong>Your GitHub, decluttered.</strong></p>
  <p><em>Your best work is in there. Somewhere. GitFit helps people find it.</em></p>

  <p>
    <a href="https://git-fit-ten.vercel.app/"><strong>Explore the Dashboard »</strong></a>
  </p>
</div>

---

## 📖 The Story

Every developer knows the "Repository Sprawl." 

It starts with a few weekend projects. Then come the forks, the experiments, and the tutorials. Fast forward three years, and your GitHub profile is a graveyard of `test-app-2` and `tutorial-final-v2`. GitHub's interface is built for the *depth* of a single project, but it wasn't designed for the *breadth* of a lifelong portfolio.

**GitFit was built to change that.**

It sorts your whole profile in minutes: clutter gets put away, and what's left fits who you are today. Try the free check-up on the homepage with any username (no sign-in), then sign in to fix everything it finds in a few clicks.

---

## ✨ Core Pillars

### ⚡ Bulk Mastery
Stop clicking through three nested settings pages just to archive one repo. GitFit allows you to **Archive, Privatize, or Delete** dozens of repositories in seconds. Rename en-masse, update descriptions, and tag topics with surgical precision.

### 🔍 Intelligence (Smart Filters)
The **"Dead Repos"** engine automatically identifies projects that haven't seen a commit in 6+ months. Filter by language, visibility, or age to instantly find exactly what you're looking for.

### 🌟 The Stars Archive
We all star repos we intend to use, only to forget them. Our **Stars Manager** surfaces "Forgotten Stars"—repos you starred over a year ago—allowing you to search, filter by language, and bulk-unstar to keep your inspiration feed fresh.

### 📌 Pin Board
Keep your most important repos one glance away. The **Drag-and-Drop Pin Board** lets you shortlist and reorder up to six repos inside GitFit, starting from your current GitHub profile pins. (GitHub doesn't offer an API for changing profile pins, so your public profile is left untouched.)

### 📬 The Unified Feed
One view. All your open PRs and Issues across every repository you own. Identify **Stale Issues** that have been sitting idle and bulk-close them, optionally with a comment you write to maintain a healthy project velocity.

---

## 🛡️ Privacy First

GitFit is a **stateless tool**. 
- **Zero Databases:** We don't store your repo data.
- **Direct API:** Every action is a call to GitHub's official API, made by GitFit's server on your behalf. Nothing is cached or kept.
- **Session Only:** Your OAuth token lives only in your encrypted session and never touches our logs.

---

## 🛠️ Technical Stack

Built with a focus on speed, typography, and premium aesthetics.

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Auth:** NextAuth v5 (Auth.js) with GitHub OAuth
- **Data:** TanStack Query & Octokit REST/GraphQL
- **Design:** "get it to fit": deep slate, volt for what fits, coral for clutter; Barlow Condensed and JetBrains Mono; a living canvas background.

---

## 🚀 Getting Started

To run your own instance of GitFit:

1. **Clone & Install**
   ```bash
   git clone https://github.com/HarshalPatel1972/GitFit.git
   npm install
   ```

2. **Configure Environment**
   Create a [GitHub OAuth App](https://github.com/settings/developers) with the callback URL
   `http://localhost:3000/api/auth/callback/github`, then copy `.env.example` to `.env.local` and fill it in:
   ```env
   AUTH_SECRET=xxx            # openssl rand -base64 32
   GITHUB_CLIENT_ID=xxx
   GITHUB_CLIENT_SECRET=xxx
   ```

3. **Launch**
   ```bash
   npm run dev
   ```

4. **Check your changes**
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
   CI runs the same checks on every pull request.

---

## 🔒 Security

Found a vulnerability? Please report it privately. See [SECURITY.md](SECURITY.md).

---

## 📄 License

GitFit is open source under the [MIT License](LICENSE).

---

<div align="center">
  <p>Crafted for developers who care about their digital footprint.</p>
  <p><strong>GitFit: get it to fit.</strong></p>
</div>
