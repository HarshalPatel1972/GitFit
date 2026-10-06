// The GitFit Score: one number for how well a GitHub profile fits its owner today,
// i.e. how much of what people see is current, described work rather than clutter.
// Shared by the public check-up on the landing page and the signed-in dashboard,
// so the score a visitor sees before signing in is the same one they improve after.

export interface ScorableRepo {
  name: string
  full_name: string
  description: string | null
  archived: boolean
  fork: boolean
  pushed_at: string
  created_at: string
  size: number // KB
  stargazers_count: number
  topics?: string[]
}

export const CLUTTER_AFTER_DAYS = 180

export interface FitReport {
  score: number
  grade: string
  verdict: string
  total: number
  active: number
  archived: number
  clutter: ScorableRepo[]
  clutterKB: number
  noDescription: number
  noTopics: number
  untouchedForks: number
}

const DAY = 86_400_000

export function isClutter(repo: ScorableRepo, now = Date.now()): boolean {
  return !repo.archived && now - new Date(repo.pushed_at).getTime() > CLUTTER_AFTER_DAYS * DAY
}

/** A fork nobody ever pushed to: GitHub sets pushed_at to (about) the fork time. */
export function isUntouchedFork(repo: ScorableRepo): boolean {
  if (!repo.fork || repo.archived) return false
  return new Date(repo.pushed_at).getTime() - new Date(repo.created_at).getTime() < 60_000
}

const GRADES: [number, string, string][] = [
  [90, "Perfect fit", "Every repo on your profile earns its place."],
  [75, "Good fit", "Mostly tidy. A quick pass keeps it that way."],
  [55, "Loose fit", "Some clutter is hiding your best work."],
  [35, "Cluttered", "Your best work is buried under old experiments."],
  [0, "Buried", "Most of what people see is clutter."],
]

export function analyzeRepos(repos: ScorableRepo[], now = Date.now()): FitReport {
  const activeRepos = repos.filter((r) => !r.archived)
  const clutter = activeRepos
    .filter((r) => isClutter(r, now))
    .sort((a, b) => b.size - a.size)
  const noDescription = activeRepos.filter((r) => !r.description?.trim()).length
  const noTopics = activeRepos.filter((r) => !r.topics || r.topics.length === 0).length
  const untouchedForks = activeRepos.filter(isUntouchedFork).length

  // Each problem is weighted by how much of the active profile it affects.
  // Archived repos are put away: they don't count against you.
  const n = activeRepos.length
  const ratio = (count: number) => (n === 0 ? 0 : count / n)
  const penalty =
    45 * ratio(clutter.length) +
    20 * ratio(untouchedForks) +
    20 * ratio(noDescription) +
    15 * ratio(noTopics)
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)))
  const [, grade, verdict] = GRADES.find(([min]) => score >= min)!

  return {
    score,
    grade,
    verdict,
    total: repos.length,
    active: n,
    archived: repos.length - n,
    clutter,
    clutterKB: clutter.reduce((sum, r) => sum + r.size, 0),
    noDescription,
    noTopics,
    untouchedForks,
  }
}

/** "1.2 GB", "340 MB", "12 KB" from a size in KB. */
export function formatSize(kb: number): string {
  if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)} GB`
  if (kb >= 1024) return `${Math.round(kb / 1024)} MB`
  return `${kb} KB`
}

/** "3 days", "5 months", "2 years" since a date. */
export function timeSince(iso: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(iso).getTime()) / DAY)
  if (days < 1) return "today"
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} month${months === 1 ? "" : "s"}`
  }
  const years = Math.floor(days / 365)
  return `${years} year${years === 1 ? "" : "s"}`
}
