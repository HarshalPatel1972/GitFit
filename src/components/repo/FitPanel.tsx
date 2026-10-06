"use client"

import { ArrowRight, Check } from "lucide-react"
import { ScoreRing } from "@/components/ui/ScoreRing"
import { matchesPreset } from "@/lib/filters"
import { analyzeRepos, formatSize } from "@/lib/score"
import type { FilterPreset, GitFitRepo } from "@/types"

interface Fix {
  preset: FilterPreset
  count: number
  title: string
  why: string
  action: string
}

/**
 * The top of the dashboard: the fit score, plus a "fix list" that turns the score into
 * concrete next steps. Each fix filters the board to the culprits and selects them,
 * so the next click is the bulk action that fixes them.
 */
export function FitPanel({
  repos,
  activePreset,
  onFix,
}: {
  repos: GitFitRepo[]
  activePreset: FilterPreset
  onFix: (preset: FilterPreset, select: boolean) => void
}) {
  const report = analyzeRepos(repos)
  const count = (preset: FilterPreset) => repos.filter((r) => matchesPreset(r, preset)).length

  const fixes: Fix[] = [
    {
      preset: "clutter",
      count: report.clutter.length,
      title: "untouched for 6+ months",
      why: report.clutter.length ? `${formatSize(report.clutterKB)} people scroll past` : "",
      action: "Select to archive",
    },
    {
      preset: "untouched-forks",
      count: count("untouched-forks"),
      title: "forks you never changed",
      why: "copies that say nothing about you",
      action: "Select",
    },
    {
      preset: "no-description",
      count: count("no-description"),
      title: "with no description",
      why: "visitors can't tell what they are",
      action: "Show",
    },
    {
      preset: "no-topics",
      count: count("no-topics"),
      title: "with no topics",
      why: "invisible in GitHub search",
      action: "Select to tag",
    },
  ]

  const fits = report.active - report.clutter.length

  return (
    <section className="fit-panel" aria-label="Fit score and fix list">
      <div className="fit-panel__score">
        <ScoreRing score={report.score} size={136} />
        <div>
          <p className="eyebrow">Your profile</p>
          <p className="fit-panel__grade">{report.grade}</p>
          <p className="fit-panel__summary">
            <strong className="is-volt">{fits}</strong> of {report.active} active repos fit
            {report.archived > 0 ? (
              <>
                {" "}· <strong>{report.archived}</strong> put away
              </>
            ) : null}
          </p>
        </div>
      </div>

      <ol className="fit-panel__fixes" aria-label="Fix list">
        {fixes.map((fix) => {
          const done = fix.count === 0
          const active = activePreset === fix.preset
          return (
            <li key={fix.preset} className={`${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
              <span className="fit-panel__count">{done ? <Check size={18} aria-label="none" /> : fix.count}</span>
              <span className="fit-panel__fix-text">
                <strong>repos {fix.title}</strong>
                {!done && fix.why && <small>{fix.why}</small>}
              </span>
              {!done && (
                <button
                  type="button"
                  onClick={() => onFix(active ? "all" : fix.preset, !active && fix.action.startsWith("Select"))}
                  aria-pressed={active}
                >
                  {active ? "Show all" : fix.action}
                  {!active && <ArrowRight size={14} aria-hidden="true" />}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
