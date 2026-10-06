"use client"

import { useEffect, useState } from "react"

/** Colour of a fit score: coral when cluttered, chalk in between, volt when it fits. */
export function scoreColor(score: number) {
  if (score >= 75) return "var(--accent-primary)"
  if (score >= 55) return "var(--text-primary)"
  return "var(--accent-danger)"
}

/**
 * The fit score as a ring that fills and counts up to its value, so a change in score
 * (after a clean-up) is visible as motion, not just a new number.
 */
export function ScoreRing({
  score,
  size = 160,
  label = "fit score",
  animate = true,
}: {
  score: number
  size?: number
  label?: string
  animate?: boolean
}) {
  const [shown, setShown] = useState(animate ? 0 : score)

  useEffect(() => {
    if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(score))
      return () => cancelAnimationFrame(id)
    }
    let frame = 0
    const from = shown
    const start = performance.now()
    const duration = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(from + (score - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // Animate from the currently shown value whenever the target score changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, animate])

  const stroke = Math.max(6, size / 18)
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const color = scoreColor(shown)

  return (
    <div
      className="score-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${score} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - shown / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-ring__value" aria-hidden="true">
        <span style={{ fontSize: size * 0.34, color }}>{shown}</span>
        <small style={{ fontSize: Math.max(10, size * 0.075) }}>{label}</small>
      </div>
    </div>
  )
}
