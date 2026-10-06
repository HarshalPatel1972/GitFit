"use client"

import { GitFork, Lock, Star } from "lucide-react"
import { isClutter, isUntouchedFork, timeSince } from "@/lib/score"
import type { GitFitRepo } from "@/types"

interface RepoCardProps {
  repo: GitFitRepo
  isSelected: boolean
  showCheckbox?: boolean
  onToggle: (e: React.MouseEvent) => void
  animationDelay?: number
}

/**
 * A repo as a tile on the board, using the same language as the landing page:
 * volt edge = fits, coral edge = clutter, grey = archived (put away).
 */
export function RepoCard({ repo, isSelected, onToggle, animationDelay = 0 }: RepoCardProps) {
  const clutter = isClutter(repo)
  const untouchedFork = isUntouchedFork(repo)
  const status = repo.archived ? "archived" : clutter || untouchedFork ? "clutter" : "fits"
  const age = timeSince(repo.pushed_at)

  return (
    <article
      className={`repo-tile repo-tile--${status} ${isSelected ? "is-selected" : ""}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onToggle}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${repo.name}`}
        className="repo-tile__check"
        onClick={(e) => {
          e.stopPropagation()
          onToggle(e)
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <header className="repo-tile__head">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="repo-tile__name"
        >
          {repo.name}
        </a>
        <span className="repo-tile__status">
          {status === "archived" ? "archived" : status === "clutter" ? (untouchedFork ? "unchanged fork" : "clutter") : "fits"}
        </span>
      </header>

      <div className="repo-tile__chips">
        {repo.private && (
          <span>
            <Lock size={11} aria-hidden="true" /> private
          </span>
        )}
        {repo.fork && (
          <span>
            <GitFork size={11} aria-hidden="true" /> fork
          </span>
        )}
        {repo.topics?.slice(0, 3).map((t) => (
          <span key={t} className="repo-tile__topic">
            {t}
          </span>
        ))}
      </div>

      <p className={`repo-tile__desc ${repo.description ? "" : "is-missing"}`}>
        {repo.description || "No description: visitors can't tell what this is."}
      </p>

      <footer className="repo-tile__foot">
        {repo.language && (
          <span>
            <i style={{ background: languageColor(repo.language) }} aria-hidden="true" />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span>
            <Star size={12} aria-hidden="true" /> {repo.stargazers_count}
          </span>
        )}
        <span className={clutter ? "is-coral" : ""}>
          {age === "today" ? "updated today" : clutter ? `untouched ${age}` : `updated ${age} ago`}
        </span>
      </footer>
    </article>
  )
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Lua: "#000080",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
}

function languageColor(lang: string): string {
  return LANGUAGE_COLORS[lang] || "#858585"
}

export function RepoCardSkeleton({ delay = 0 }: { delay?: number }) {
  return <div className="repo-tile repo-tile--skeleton animate-shimmer" style={{ animationDelay: `${delay}ms` }} />
}
