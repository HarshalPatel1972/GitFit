"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            textAlign: "center",
            animation: "fadeIn 300ms ease-out both",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-full)",
              background: "var(--accent-danger-glow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <AlertTriangle size={28} color="var(--accent-danger)" />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              marginBottom: 8,
              maxWidth: 400,
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. This might be a GitHub API issue or a
            network problem.
          </p>

          {this.state.error && (
            <pre
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                padding: "8px 16px",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: 20,
                maxWidth: 400,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--accent-primary)",
              background: "var(--accent-glow)",
              borderRadius: "var(--radius-md)",
              transition: "all var(--transition-fast)",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
