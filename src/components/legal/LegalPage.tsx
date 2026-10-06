import Link from "next/link"

export const CONTACT_EMAIL = "harshalpatel6828@gmail.com"

/** Shared layout for the privacy policy and terms of service. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
      <main className="legal-page">
        <Link href="/" className="legal-back">
          ← Back to GitFit
        </Link>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        {children}
        <hr />
        <p>
          Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          See also our <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </main>
    </div>
  )
}
