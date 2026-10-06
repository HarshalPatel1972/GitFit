"use client"

import { useState } from "react"
import Link from "next/link"
import "./landing.css"
import { HeroSort } from "@/components/landing/HeroSort"
import { CheckupForm, CheckupResults } from "@/components/landing/Checkup"
import { ClickRace, FinalCta, HowItWorks, Safety, Sprawl } from "@/components/landing/Story"
import { GitFitMark, GitHubMark } from "@/components/landing/GitHubMark"
import type { CheckupResult } from "@/lib/public-checkup"

/**
 * Landing page story, in order:
 *   hero      what it is (mess becomes order, in one animation) + a free check-up
 *   results   your own profile, scored and sorted, then the sign-in
 *   sprawl    why your GitHub got this way
 *   race      why GitFit beats doing it by hand
 *   how       how it works and what you can do
 *   safety    why it's safe to let it near your repos
 *   final     sign in
 */
export function Landing({
  signInAction,
  notice,
}: {
  signInAction: () => Promise<void>
  notice?: string
}) {
  const [result, setResult] = useState<CheckupResult | null>(null)

  function showResult(r: CheckupResult) {
    setResult(r)
    requestAnimationFrame(() =>
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" })
    )
  }

  return (
    <div className="lp">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="lp-nav">
        <Link href="/" className="lp-nav__brand" aria-label="GitFit home">
          <GitFitMark /> GitFit
        </Link>
        <nav aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#safety">Safety</a>
          <a href="https://github.com/HarshalPatel1972/GitFit" target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </nav>
        <form action={signInAction}>
          <button type="submit" className="btn btn--outline btn--sm">
            <GitHubMark size={15} /> Sign in
          </button>
        </form>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            {notice && (
              <p className="hero__notice" role="status">
                {notice}
              </p>
            )}
            <p className="eyebrow">GitHub, decluttered</p>
            <h1 id="hero-title">
              Your best work is in there.
              <span> Somewhere.</span>
            </h1>
            <p className="hero__lead">
              Years of tutorials, forks and repos called <code>test-app-2</code> pile up until nobody
              can find what you&apos;re proud of. GitFit sorts your GitHub in minutes: archive, hide, tag and
              tidy dozens of repos at once.
            </p>
            <CheckupForm onResult={showResult} />
            <form action={signInAction} className="hero__alt">
              Or{" "}
              <button type="submit" className="link-button">
                sign in with GitHub
              </button>{" "}
              and start sorting.
            </form>
            <p className="hero__terms">
              By signing in you agree to the <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
          <HeroSort />
        </section>

        {result && <CheckupResults result={result} signInAction={signInAction} />}

        <Sprawl />
        <ClickRace />
        <HowItWorks />
        <Safety />
        <FinalCta signInAction={signInAction} />
      </main>

      <footer className="lp-footer">
        <span className="lp-nav__brand">
          <GitFitMark size={18} /> GitFit
        </span>
        <p>Free and open source. Reads and writes only through GitHub&apos;s official API. Not affiliated with GitHub.</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://github.com/HarshalPatel1972/GitFit/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">
            Security
          </a>
          <a href="https://github.com/HarshalPatel1972/GitFit" target="_blank" rel="noopener noreferrer">
            Source
          </a>
        </nav>
      </footer>
    </div>
  )
}
