"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react"
import { ScoreRing } from "@/components/ui/ScoreRing"
import { CheckupError, runPublicCheckup, type CheckupResult } from "@/lib/public-checkup"
import { analyzeRepos, formatSize, isClutter, timeSince } from "@/lib/score"
import { GitHubMark } from "@/components/landing/GitHubMark"

export function CheckupForm({
  onResult,
  compact = false,
}: {
  onResult: (result: CheckupResult) => void
  compact?: boolean
}) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      onResult(await runPublicCheckup(value))
    } catch (err) {
      setError(err instanceof CheckupError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={`checkup-form ${compact ? "checkup-form--compact" : ""}`} onSubmit={submit}>
      <label htmlFor={compact ? "checkup-input-2" : "checkup-input"} className="checkup-form__label">
        Free check-up · no sign-in · reads public repos only
      </label>
      <div className="checkup-form__row">
        <span className="checkup-form__prefix" aria-hidden="true">github.com/</span>
        <input
          id={compact ? "checkup-input-2" : "checkup-input"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="your-username"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          required
          aria-describedby={error ? "checkup-error" : undefined}
        />
        <button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : null}
          {loading ? "Checking" : "Check my fit"}
        </button>
      </div>
      {error && (
        <p id="checkup-error" className="checkup-form__error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export function CheckupResults({
  result,
  signInAction,
}: {
  result: CheckupResult
  signInAction: () => Promise<void>
}) {
  const report = useMemo(() => analyzeRepos(result.repos), [result])
  const [copied, setCopied] = useState(false)

  const active = result.repos.filter((r) => !r.archived)
  const fits = active.filter((r) => !isClutter(r))
  const clutter = report.clutter
  const oldest = clutter.reduce<string | null>(
    (min, r) => (!min || r.pushed_at < min ? r.pushed_at : min),
    null
  )

  const stats = [
    {
      value: clutter.length,
      label: "repos untouched for 6+ months",
      detail: clutter.length ? `${formatSize(report.clutterKB)}${oldest ? ` · oldest ${timeSince(oldest)}` : ""}` : "nothing gathering dust",
    },
    { value: report.untouchedForks, label: "forks you never changed", detail: "copies that add nothing to your profile" },
    { value: report.noDescription, label: "repos with no description", detail: "visitors can't tell what they are" },
    { value: report.noTopics, label: "repos with no topics", detail: "invisible in GitHub search" },
  ]

  async function copyScore() {
    const text = `My GitHub fit score is ${report.score}/100 (${report.grade}). ${clutter.length} of ${report.active} repos are clutter. Check yours: ${window.location.origin}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (insecure context or denied); nothing to do
    }
  }

  return (
    <section className="results" id="results" aria-live="polite" aria-label={`Check-up results for ${result.login}`}>
      <div className="results__head">
        {/* eslint-disable-next-line @next/next/no-img-element -- small GitHub avatar */}
        <img src={result.avatarUrl} alt="" width={44} height={44} />
        <div>
          <p className="eyebrow">Check-up complete</p>
          <h2>{result.name || result.login}&apos;s GitHub</h2>
          <p className="results__basis">
            Based on {report.total} public repo{report.total === 1 ? "" : "s"}
            {result.truncated ? " (the 300 most recently updated)" : ""}. Private repos are included once you sign in.
          </p>
        </div>
      </div>

      {report.total === 0 ? (
        <p className="results__empty">No public repos yet: a clean slate. GitFit will help you keep it that way.</p>
      ) : (
        <>
          <div className="results__score">
            <ScoreRing score={report.score} size={196} />
            <div>
              <p className="results__grade">{report.grade}</p>
              <p className="results__verdict">{report.verdict}</p>
              <p className="results__summary">
                <strong className="is-volt">{fits.length}</strong> repos fit who you are today.{" "}
                <strong className="is-coral">{clutter.length}</strong> are clutter
                {clutter.length > 0 ? " that GitFit can put away in one go." : "."}
              </p>
            </div>
          </div>

          <ul className="results__stats">
            {stats.map((s) => (
              <li key={s.label}>
                <span className={`results__stat-value ${s.value > 0 ? "is-coral" : "is-volt"}`}>{s.value}</span>
                <span className="results__stat-label">{s.label}</span>
                <span className="results__stat-bar" aria-hidden="true">
                  <span style={{ width: `${report.active ? Math.round((s.value / report.active) * 100) : 0}%` }} />
                </span>
                <span className="results__stat-detail">{s.detail}</span>
              </li>
            ))}
          </ul>

          <div className="results__board">
            <TileColumn title="Fits" tone="keep" repos={fits.map((r) => ({ name: r.name, meta: `updated ${timeSince(r.pushed_at)} ago` }))} />
            <TileColumn
              title="Clutter"
              tone="clutter"
              repos={clutter.map((r) => ({ name: r.name, meta: `untouched ${timeSince(r.pushed_at)}` }))}
            />
          </div>
        </>
      )}

      <div className="results__cta">
        <div>
          <h3>{clutter.length > 0 ? `Put away all ${clutter.length} in under a minute.` : "Keep it this way."}</h3>
          <p>Sign in to see private repos too, then archive, describe, tag and tidy everything at once.</p>
        </div>
        <div className="results__cta-actions">
          <form action={signInAction}>
            <button type="submit" className="btn btn--volt">
              <GitHubMark /> Sign in with GitHub <ArrowRight size={16} aria-hidden="true" />
            </button>
          </form>
          {report.total > 0 && (
            <button type="button" className="btn btn--ghost" onClick={copyScore}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {copied ? "Copied" : "Copy my score"}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

const SHOW = 12

function TileColumn({
  title,
  tone,
  repos,
}: {
  title: string
  tone: "keep" | "clutter"
  repos: { name: string; meta: string }[]
}) {
  return (
    <div className={`tile-col tile-col--${tone}`}>
      <h3>
        {title} <span>{repos.length}</span>
      </h3>
      <ul>
        {repos.slice(0, SHOW).map((r, i) => (
          <li key={r.name} className="mini-tile" style={{ animationDelay: `${i * 45}ms` }}>
            <span className="mini-tile__name">{r.name}</span>
            <span className="mini-tile__meta">{r.meta}</span>
          </li>
        ))}
        {repos.length > SHOW && <li className="mini-tile mini-tile--more">+{repos.length - SHOW} more</li>}
        {repos.length === 0 && <li className="mini-tile mini-tile--more">none</li>}
      </ul>
    </div>
  )
}
