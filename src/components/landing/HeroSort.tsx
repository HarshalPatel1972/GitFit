"use client"

import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"
import { prefersReducedMotion } from "@/hooks/useInView"

/**
 * The opening scene, which is the product in five seconds:
 *   pile  → repos tumble in as a messy heap (what a profile feels like today)
 *   scan  → a line sweeps through and labels each one: keep or clutter
 *   fit   → clutter slides into the archive tray, keepers snap into a tidy grid
 */

type Phase = "empty" | "pile" | "scan" | "fit"

interface Tile {
  name: string
  meta: string
  lang: string
  keep: boolean
}

const TILES: Tile[] = [
  { name: "test-app-2", meta: "untouched 3 yrs", lang: "#f1e05a", keep: false },
  { name: "portfolio", meta: "updated 2 days ago", lang: "#3178c6", keep: true },
  { name: "tutorial-final-v2", meta: "untouched 2 yrs", lang: "#f1e05a", keep: false },
  { name: "untitled-fork", meta: "never touched", lang: "#3572A5", keep: false },
  { name: "api-gateway", meta: "updated this week", lang: "#00ADD8", keep: true },
  { name: "hello-world", meta: "untouched 4 yrs", lang: "#e34c26", keep: false },
  { name: "design-system", meta: "updated 5 days ago", lang: "#3178c6", keep: true },
  { name: "todo-app-copy", meta: "untouched 3 yrs", lang: "#f1e05a", keep: false },
  { name: "ml-notebooks", meta: "updated last month", lang: "#DA5B0B", keep: true },
  { name: "old-blog-2019", meta: "untouched 5 yrs", lang: "#563d7c", keep: false },
  { name: "cli-toolkit", meta: "updated yesterday", lang: "#dea584", keep: true },
  { name: "react-starter-tmp", meta: "untouched 2 yrs", lang: "#f1e05a", keep: false },
  { name: "mobile-app", meta: "updated 3 weeks ago", lang: "#A97BFF", keep: true },
  { name: "asdf", meta: "untouched 4 yrs", lang: "#89e051", keep: false },
]

// Deterministic "random" heap so server and client render the same pile
function heapPosition(i: number) {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12345.6789
  const rx = a - Math.floor(a)
  const ry = b - Math.floor(b)
  return { left: 6 + rx * 44, top: 12 + ry * 42, rotate: (rx - 0.5) * 34 }
}

const keepers = TILES.filter((t) => t.keep)
const clutter = TILES.filter((t) => !t.keep)

function placement(tile: Tile, index: number, phase: Phase) {
  if (phase === "empty") {
    const heap = heapPosition(index)
    return { left: heap.left, top: -30, rotate: heap.rotate * 2, scale: 1, opacity: 0 }
  }
  if (phase === "pile" || phase === "scan") {
    return { ...heapPosition(index), scale: 1, opacity: 1 }
  }
  if (tile.keep) {
    const k = keepers.indexOf(tile)
    return { left: k % 2 === 0 ? 2 : 51, top: 11 + Math.floor(k / 2) * 18.5, rotate: 0, scale: 1, opacity: 1 }
  }
  // Clutter is stacked like a deck of cards in the archive tray: put away, not destroyed
  const c = clutter.indexOf(tile)
  const top = c === clutter.length - 1
  return { left: 6 + c * 1.4, top: 72 + c * 0.9, rotate: (c - 3.5) * 1.4, scale: 0.82, opacity: top ? 0.9 : 0.6 }
}

export function HeroSort() {
  const [phase, setPhase] = useState<Phase>("empty")
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => setPhase("fit"))
      return () => cancelAnimationFrame(id)
    }
    const timers = [
      setTimeout(() => setPhase("pile"), 150),
      setTimeout(() => setPhase("scan"), 1700),
      setTimeout(() => setPhase("fit"), 3100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [run])

  const replay = () => {
    setPhase("empty")
    setRun((r) => r + 1)
  }

  const sorted = phase === "fit"
  const labelled = phase === "scan" || phase === "fit"

  return (
    <div className="hero-stage">
    <div className={`hero-board hero-board--${phase}`} aria-label="Animation: a messy pile of repositories sorts itself into a tidy grid, with old ones moved to the archive" role="img">
      <div className="hero-board__status" aria-hidden="true">
        <span className={sorted ? "is-dim" : ""}>{TILES.length} repos</span>
        <span className="hero-board__arrow">→</span>
        <span className={sorted ? "is-volt" : "is-dim"}>{keepers.length} that fit</span>
      </div>

      <div className="hero-board__tray" aria-hidden="true">
        <span>Archive</span>
        <span className={sorted ? "is-volt" : ""}>{sorted ? `${clutter.length} put away` : "empty"}</span>
      </div>

      <div className="hero-board__scan" aria-hidden="true" />

      {TILES.map((tile, i) => {
        const p = placement(tile, i, phase)
        return (
          <div
            key={tile.name}
            aria-hidden="true"
            className={`hero-tile ${labelled ? (tile.keep ? "hero-tile--keep" : "hero-tile--clutter") : ""}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
              transitionDelay:
                phase === "pile" ? `${i * 70}ms` : phase === "fit" ? `${(tile.keep ? 0 : 120) + (i % 7) * 40}ms` : "0ms",
            }}
          >
            <span className="hero-tile__name">
              <i style={{ background: tile.lang }} />
              {tile.name}
            </span>
            <span className="hero-tile__meta">{tile.meta}</span>
            <span className="hero-tile__tag">{tile.keep ? "fits" : "clutter"}</span>
          </div>
        )
      })}
    </div>
      <button
        type="button"
        className={`hero-board__replay ${sorted ? "is-visible" : ""}`}
        onClick={replay}
        tabIndex={sorted ? 0 : -1}
      >
        <RotateCcw size={13} aria-hidden="true" /> Replay
      </button>
    </div>
  )
}
