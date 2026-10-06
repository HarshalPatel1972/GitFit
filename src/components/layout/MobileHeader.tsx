"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Menu } from "lucide-react"
import { GitFitMark } from "@/components/landing/GitHubMark"
import { scoreColor } from "@/components/ui/ScoreRing"
import { analyzeRepos } from "@/lib/score"
import type { GitFitRepo } from "@/types"

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: repos } = useQuery<GitFitRepo[]>({ queryKey: ["repos"], enabled: false })
  const score = useMemo(() => (repos ? analyzeRepos(repos).score : null), [repos])

  return (
    <header className="mobile-header">
      <button type="button" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <Link href="/dashboard" className="mobile-header__brand">
        <GitFitMark size={18} /> GitFit
      </Link>
      {score !== null && (
        <span className="mobile-header__score" aria-label={`Fit score ${score} of 100`}>
          <span style={{ color: scoreColor(score) }}>{score}</span> fit
        </span>
      )}
    </header>
  )
}
