"use client"

import { useEffect, useState } from "react"
import {
  Archive,
  ArrowRight,
  EyeOff,
  FileCode2,
  GitPullRequestClosed,
  KeyRound,
  Layers,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
} from "lucide-react"
import { prefersReducedMotion, useInView } from "@/hooks/useInView"
import { GitHubMark } from "@/components/landing/GitHubMark"

/* ---------- 1. How clutter piles up ---------- */

const YEARS = [
  { year: "Year 1", total: 4, used: 4, note: "Your first projects. You knew every one by heart." },
  { year: "Year 2", total: 13, used: 6, note: "Tutorials. So many tutorials." },
  { year: "Year 3", total: 25, used: 7, note: "Forks you meant to read later." },
  { year: "Year 4", total: 41, used: 7, note: "test-app-2. test-app-3. test-app-final." },
  { year: "Today", total: 63, used: 7, note: "63 repos. You still use 7." },
]

export function Sprawl() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25)
  return (
    <section className="story sprawl" aria-labelledby="sprawl-title">
      <p className="eyebrow">How it happens</p>
      <h2 id="sprawl-title">Nobody decides to have a messy GitHub.</h2>
      <p className="story__lead">
        It builds up one weekend project at a time. GitHub is designed to go deep on a single
        repository, not to keep a whole profile tidy, so the clutter just stays.
      </p>
      <div ref={ref} className={`sprawl__years ${inView ? "is-in" : ""}`}>
        {YEARS.map((y, yi) => (
          <div className="sprawl__year" key={y.year}>
            <div className="sprawl__stack" aria-hidden="true">
              {Array.from({ length: y.total }).map((_, i) => (
                <i
                  key={i}
                  className={i < y.used ? "is-used" : ""}
                  style={{ transitionDelay: `${yi * 260 + i * 14}ms` }}
                />
              ))}
            </div>
            <p className="sprawl__count">
              <strong>{y.total}</strong> repos
            </p>
            <p className="sprawl__label">{y.year}</p>
            <p className="sprawl__note">{y.note}</p>
          </div>
        ))}
      </div>
      <p className="sprawl__legend" aria-hidden="true">
        <span><i className="is-used" /> repos you actually use</span>
        <span><i /> everything else people see first</span>
      </p>
    </section>
  )
}

/* ---------- 2. 240 clicks vs 3 ---------- */

const GITHUB_STEPS = ["Open the repo", "Settings", "Scroll to Danger Zone", "Archive this repository", "I understand", "Confirm"]
const GITFIT_STEPS = ["Select clutter", "Archive", "Confirm"]
const REPOS = 40

export function ClickRace() {
  const [ref, inView] = useInView<HTMLDivElement>(0.45)
  const [githubClicks, setGithubClicks] = useState(0)
  const [gitfitClicks, setGitfitClicks] = useState(0)
  const total = GITHUB_STEPS.length * REPOS

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => {
        setGithubClicks(total)
        setGitfitClicks(GITFIT_STEPS.length)
      })
      return () => cancelAnimationFrame(id)
    }
    const gitfitTimers = GITFIT_STEPS.map((_, i) => setTimeout(() => setGitfitClicks(i + 1), 300 + i * 260))
    const interval = setInterval(() => {
      setGithubClicks((c) => {
        if (c >= total) {
          clearInterval(interval)
          return c
        }
        return c + 1
      })
    }, 24)
    return () => {
      gitfitTimers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [inView, total])

  const githubRepo = Math.min(REPOS, Math.floor(githubClicks / GITHUB_STEPS.length))
  const githubStep = githubClicks % GITHUB_STEPS.length
  const gitfitDone = gitfitClicks === GITFIT_STEPS.length

  return (
    <section className="story race" aria-labelledby="race-title">
      <p className="eyebrow">Why GitFit</p>
      <h2 id="race-title">Archiving 40 old repos, two ways.</h2>
      <div ref={ref} className="race__lanes">
        <div className="race__lane">
          <p className="race__who">On GitHub</p>
          <p className="race__count" aria-live="off">
            {githubClicks}
            <span> clicks</span>
          </p>
          <ol className="race__steps" aria-label="Steps per repository on GitHub">
            {GITHUB_STEPS.map((s, i) => (
              <li key={s} className={githubClicks > 0 && githubClicks < total && i === githubStep ? "is-active" : ""}>
                {s}
              </li>
            ))}
          </ol>
          <p className="race__progress">
            repo {Math.max(1, Math.min(REPOS, githubRepo + (githubClicks < total ? 1 : 0)))} of {REPOS}
            {githubClicks >= total ? " · done, finally" : ""}
          </p>
          <span className="race__bar" aria-hidden="true">
            <span style={{ width: `${(githubClicks / total) * 100}%` }} />
          </span>
        </div>

        <div className="race__lane race__lane--gitfit">
          <p className="race__who">On GitFit</p>
          <p className="race__count">
            {gitfitClicks}
            <span> clicks</span>
          </p>
          <ol className="race__steps" aria-label="Steps on GitFit">
            {GITFIT_STEPS.map((s, i) => (
              <li key={s} className={i < gitfitClicks ? "is-done" : ""}>
                {s}
              </li>
            ))}
          </ol>
          <p className="race__progress">{gitfitDone ? `all ${REPOS} archived ✓` : " "}</p>
          <span className="race__bar" aria-hidden="true">
            <span style={{ width: `${(gitfitClicks / GITFIT_STEPS.length) * 100}%` }} />
          </span>
        </div>
      </div>
      <p className="story__lead race__caption">
        GitHub has no way to change many repos at once. GitFit does it for dozens in one go,
        and it works the same for making repos private, adding topics, renaming and more.
      </p>
    </section>
  )
}

/* ---------- 3. How it works ---------- */

const STEPS = [
  {
    n: "01",
    title: "Check up",
    text: "Sign in with GitHub. GitFit reads your repos, stars and issues and gives your profile a fit score.",
  },
  {
    n: "02",
    title: "Find the clutter",
    text: "Smart filters surface what's holding you back: repos untouched for months, forks you never changed, missing descriptions, forgotten stars, stale issues.",
  },
  {
    n: "03",
    title: "Make it fit",
    text: "Select dozens at once and fix them in one go. Your score climbs as you work, so you can see the difference.",
  },
]

const TOOLS = [
  { icon: Archive, label: "Archive in bulk" },
  { icon: EyeOff, label: "Make private or public" },
  { icon: Trash2, label: "Delete, with a safety check" },
  { icon: Tags, label: "Add or remove topics" },
  { icon: Pencil, label: "Rename with a live preview" },
  { icon: Star, label: "Clear out old stars" },
  { icon: GitPullRequestClosed, label: "Close stale issues" },
  { icon: Layers, label: "Shortlist your best repos" },
]

export function HowItWorks() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2)
  return (
    <section className="story how" id="how" aria-labelledby="how-title">
      <p className="eyebrow">How it works</p>
      <h2 id="how-title">Three steps. A few minutes. Done.</h2>
      <div ref={ref} className={`how__steps ${inView ? "is-in" : ""}`}>
        {STEPS.map((s, i) => (
          <div key={s.n} className="how__step" style={{ transitionDelay: `${i * 140}ms` }}>
            <span className="how__n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
      <ul className="how__tools" aria-label="What you can do">
        {TOOLS.map(({ icon: Icon, label }) => (
          <li key={label}>
            <Icon size={16} aria-hidden="true" /> {label}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- 4. Safety ---------- */

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Nothing permanent without your say",
    text: "Deleting asks you to type how many repos you mean. Making a repo private warns you that its stars will be lost. You always see the list first.",
  },
  {
    icon: KeyRound,
    title: "Your GitHub token stays on our server",
    text: "It lives in an encrypted cookie and is never readable by the page, so a browser extension or script can't grab it.",
  },
  {
    icon: LockKeyhole,
    title: "No database. No tracking.",
    text: "GitFit passes your requests to GitHub and remembers nothing. There is nothing of yours stored to leak.",
  },
  {
    icon: FileCode2,
    title: "Open source, MIT licensed",
    text: "Every line is public. Read it, audit it, or run your own copy.",
  },
]

export function Safety() {
  return (
    <section className="story safety" id="safety" aria-labelledby="safety-title">
      <p className="eyebrow">Built to be trusted</p>
      <h2 id="safety-title">It&apos;s your work. We treat it that way.</h2>
      <ul className="safety__list">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon size={22} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- 5. Final call ---------- */

export function FinalCta({ signInAction }: { signInAction: () => Promise<void> }) {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="final__grid" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>
      <h2 id="final-title">
        Your best work
        <br />
        deserves to be <span className="is-volt">found.</span>
      </h2>
      <form action={signInAction}>
        <button type="submit" className="btn btn--volt btn--lg">
          <GitHubMark /> Sign in with GitHub <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
      <p className="final__note">Free. Open source. Takes about ten seconds.</p>
    </section>
  )
}
