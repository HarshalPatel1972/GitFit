"use client"

import type { GitFitRepo } from "@/types"
import { Star, GitFork, Circle } from "lucide-react"

interface RepoCardProps {
  repo: GitFitRepo
  isSelected: boolean
  showCheckbox: boolean
  onToggle: (e: React.MouseEvent) => void
  animationDelay?: number
}

export function RepoCard({
  repo,
  isSelected,
  showCheckbox,
  onToggle,
  animationDelay = 0,
}: RepoCardProps) {
  const timeSince = getTimeSince(repo.pushed_at)

  return (
    <div
      onClick={onToggle}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${isSelected ? "var(--border-strong)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all var(--transition-base)",
        boxShadow: isSelected ? "var(--shadow-glow)" : "none",
        position: "relative",
        animation: `fadeInUp 250ms ease-out ${animationDelay}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--border-default)"
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow = "var(--shadow-sm)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--border-subtle)"
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "none"
        }
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          opacity: showCheckbox ? 1 : 0,
          transform: showCheckbox ? "scale(1)" : "scale(0.8)",
          transition: "all var(--transition-fast)",
        }}
        className={showCheckbox ? "" : "card-checkbox"}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "var(--radius-sm)",
            border: `2px solid ${isSelected ? "var(--accent-primary)" : "var(--border-default)"}`,
            background: isSelected ? "var(--accent-primary)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
          }}
        >
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="var(--text-inverse)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingLeft: showCheckbox ? 28 : 0, transition: "padding var(--transition-fast)" }}>
        {/* Name + badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
          >
            {repo.name}
          </a>

          {/* Badges */}
          <VisibilityBadge
            isPrivate={repo.private}
            archived={repo.archived}
            fork={repo.fork}
          />
        </div>

        {/* Description */}
        {repo.description && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              marginBottom: 10,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {repo.description}
          </p>
        )}

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: "var(--text-xs)",
            color: "var(--text-muted)",
            fontWeight: 300,
            flexWrap: "wrap",
          }}
        >
          {repo.language && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Circle
                size={8}
                fill={getLanguageColor(repo.language)}
                stroke="none"
              />
              {repo.language}
            </span>
          )}
          {repo.stargazers_count > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={12} />
              {repo.stargazers_count}
            </span>
          )}
          {repo.forks_count > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <GitFork size={12} />
              {repo.forks_count}
            </span>
          )}
          <span>{timeSince}</span>
        </div>
      </div>

      <style>{`
        .card-checkbox {
          opacity: 0 !important;
        }
        div:hover > .card-checkbox {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
      `}</style>
    </div>
  )
}

function VisibilityBadge({
  isPrivate,
  archived,
  fork,
}: {
  isPrivate: boolean
  archived: boolean
  fork: boolean
}) {
  if (archived) {
    return (
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "var(--radius-full)",
          fontSize: "var(--text-xs)",
          fontWeight: 500,
          background: "rgba(122, 110, 99, 0.15)",
          color: "var(--repo-archived)",
        }}
      >
        archived
      </span>
    )
  }

  return (
    <>
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "var(--radius-full)",
          fontSize: "var(--text-xs)",
          fontWeight: 500,
          background: isPrivate
            ? "rgba(107, 131, 160, 0.15)"
            : "rgba(107, 158, 114, 0.15)",
          color: isPrivate ? "var(--repo-private)" : "var(--repo-public)",
        }}
      >
        {isPrivate ? "private" : "public"}
      </span>
      {fork && (
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            background: "rgba(160, 125, 40, 0.15)",
            color: "var(--repo-forked)",
          }}
        >
          fork
        </span>
      )}
    </>
  )
}

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
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
  }
  return colors[lang] || "#858585"
}

// Skeleton loader
export function RepoCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        animation: `fadeInUp 250ms ease-out ${delay}ms both`,
      }}
    >
      <div
        className="animate-shimmer"
        style={{
          height: 18,
          width: "60%",
          borderRadius: "var(--radius-sm)",
          marginBottom: 10,
        }}
      />
      <div
        className="animate-shimmer"
        style={{
          height: 14,
          width: "90%",
          borderRadius: "var(--radius-sm)",
          marginBottom: 6,
        }}
      />
      <div
        className="animate-shimmer"
        style={{
          height: 14,
          width: "70%",
          borderRadius: "var(--radius-sm)",
          marginBottom: 14,
        }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <div
          className="animate-shimmer"
          style={{
            height: 12,
            width: 50,
            borderRadius: "var(--radius-sm)",
          }}
        />
        <div
          className="animate-shimmer"
          style={{
            height: 12,
            width: 30,
            borderRadius: "var(--radius-sm)",
          }}
        />
        <div
          className="animate-shimmer"
          style={{
            height: 12,
            width: 40,
            borderRadius: "var(--radius-sm)",
          }}
        />
      </div>
    </div>
  )
}
