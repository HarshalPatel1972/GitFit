"use client"

import { FolderKanban, Search, Star, Pin, GitPullRequest, Tags } from "lucide-react"

function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

interface LandingContentProps {
  signInAction: () => Promise<void>
}

export function LandingContent({ signInAction }: LandingContentProps) {
  return (
    <div className="noise-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-4xl)",
            fontWeight: 900,
            color: "var(--accent-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 24,
            animation: "fadeInDown 400ms ease-out both",
          }}
        >
          GitFit
        </h1>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 4vw, var(--text-3xl))",
            fontWeight: 300,
            fontStyle: "italic",
            color: "var(--text-secondary)",
            lineHeight: 1.4,
            maxWidth: 520,
            marginBottom: 40,
            animation: "fadeInUp 400ms ease-out 100ms both",
          }}
        >
          Your GitHub,
          <br />
          finally under control.
        </p>

        <form action={signInAction}>
          <button
            type="submit"
            id="sign-in-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 32px",
              background: "var(--accent-primary)",
              color: "var(--text-inverse)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              fontWeight: 600,
              letterSpacing: "0.02em",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-md), 0 0 30px var(--accent-glow)",
              transition: "all var(--transition-base)",
              animation: "fadeInUp 400ms ease-out 200ms both",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-primary-dim)"
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow =
                "var(--shadow-lg), 0 0 50px var(--accent-glow)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-primary)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow =
                "var(--shadow-md), 0 0 30px var(--accent-glow)"
            }}
          >
            <GitHubIcon size={20} />
            Sign in with GitHub
          </button>
        </form>
      </main>

      {/* Feature Grid */}
      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          width: "100%",
        }}
      >
        {features.map((f, i) => (
          <div
            key={f.title}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              transition: "all var(--transition-base)",
              animation: `fadeInUp 250ms ease-out ${300 + i * 60}ms both`,
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-default)"
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "var(--shadow-md)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)"
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <div style={{ color: "var(--accent-primary)", marginBottom: 10 }}>
              {f.icon}
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          fontStyle: "italic",
        }}
      >
        Open source. No data stored. Reads and writes only through GitHub&apos;s official API.
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <FolderKanban size={22} />,
    title: "Bulk Actions",
    desc: "Archive, privatize, delete — 10 repos in 10 seconds.",
  },
  {
    icon: <Search size={22} />,
    title: "Smart Filters",
    desc: "Dead repos, by language, by age. Find anything instantly.",
  },
  {
    icon: <Star size={22} />,
    title: "Stars Manager",
    desc: "Browse and prune your 400 forgotten starred repos.",
  },
  {
    icon: <Pin size={22} />,
    title: "Pin Editor",
    desc: "Drag, reorder, publish. Visual pin management.",
  },
  {
    icon: <GitPullRequest size={22} />,
    title: "Cross-repo Feed",
    desc: "All your PRs and issues. One dashboard.",
  },
  {
    icon: <Tags size={22} />,
    title: "Bulk Tagging",
    desc: "Add topics to 20 repos in one click.",
  },
]
