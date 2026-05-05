<div align="center">
  <img src="src/app/icon.png" width="120" height="120" alt="GitFit Logo" />
  <h1>GitFit</h1>
  <p><strong>Your GitHub, finally under control.</strong></p>
  <p><em>The premium workbench for the organized developer.</em></p>

  <p>
    <a href="https://git-fit-ten.vercel.app/"><strong>Explore the Dashboard »</strong></a>
  </p>
</div>

---

## 📖 The Story

Every developer knows the "Repository Sprawl." 

It starts with a few weekend projects. Then come the forks, the experiments, and the tutorials. Fast forward three years, and your GitHub profile is a graveyard of `test-app-2` and `tutorial-final-v2`. GitHub's interface is built for the *depth* of a single project, but it wasn't designed for the *breadth* of a lifelong portfolio.

**GitFit was built to change that.**

It is a high-fidelity, editorial-grade dashboard designed to help you prune the dead weight and highlight your best work. It’s not just a manager; it’s a fitness tracker for your digital legacy.

---

## ✨ Core Pillars

### ⚡ Bulk Mastery
Stop clicking through three nested settings pages just to archive one repo. GitFit allows you to **Archive, Privatize, or Delete** dozens of repositories in seconds. Rename en-masse, update descriptions, and tag topics with surgical precision.

### 🔍 Intelligence (Smart Filters)
The **"Dead Repos"** engine automatically identifies projects that haven't seen a commit in 6+ months. Filter by language, visibility, or age to instantly find exactly what you're looking for.

### 🌟 The Stars Archive
We all star repos we intend to use, only to forget them. Our **Stars Manager** surfaces "Forgotten Stars"—repos you starred over a year ago—allowing you to search, filter by language, and bulk-unstar to keep your inspiration feed fresh.

### 📌 Profile Architecture
Your "Pinned Repos" are your digital resume. GitFit’s native **Drag-and-Drop Pin Editor** lets you reorder and sync your profile pins with a live preview, ensuring your first impression is always your best.

### 📬 The Unified Feed
One view. All your open PRs and Issues across every repository you own. Identify **Stale Issues** that have been sitting idle and bulk-close them with custom comments to maintain a healthy project velocity.

---

## 🛡️ Privacy First

GitFit is a **stateless tool**. 
- **Zero Databases:** We don't store your repo data.
- **Direct API:** All actions happen directly between your browser and GitHub.
- **Session Only:** Your OAuth token lives only in your encrypted session and never touches our logs.

---

## 🛠️ Technical Stack

Built with a focus on speed, typography, and premium aesthetics.

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Auth:** NextAuth v5 (Auth.js) with GitHub OAuth
- **Data:** TanStack Query & Octokit REST/GraphQL
- **Aesthetics:** HSL-tailored colors, Fraunces Display typography, and Noise texture overlays.

---

## 🚀 Getting Started

To run your own instance of GitFit:

1. **Clone & Install**
   ```bash
   git clone https://github.com/HarshalPatel1972/GitFit.git
   npm install
   ```

2. **Configure Environment**
   Create a `.env.local` with your GitHub OAuth credentials:
   ```env
   GITHUB_CLIENT_ID=xxx
   GITHUB_CLIENT_SECRET=xxx
   NEXTAUTH_SECRET=xxx
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Launch**
   ```bash
   npm run dev
   ```

---

<div align="center">
  <p>Crafted for developers who care about their digital footprint.</p>
  <p><strong>GitFit — Stay Lean. Stay Professional.</strong></p>
</div>
