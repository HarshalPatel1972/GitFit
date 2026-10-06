import type { Metadata } from "next"
import { CONTACT_EMAIL, LegalPage } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Privacy Policy — GitFit",
  description: "What GitFit does with your data: no database, no tracking, nothing stored on our servers.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="6 October 2026">
      <p>
        GitFit (&quot;GitFit&quot;, &quot;we&quot;, &quot;us&quot;) is an open-source tool for
        managing your GitHub repositories, stars, issues and pull requests. This policy explains
        what data GitFit handles when you use it and what we do with it. The short version:{" "}
        <strong>
          GitFit has no database, does not store your GitHub data, and does not track you.
        </strong>
      </p>

      <h2>1. What we receive when you sign in</h2>
      <p>You sign in with your GitHub account. GitHub then shares with GitFit:</p>
      <ul>
        <li>your name, email address and profile picture (avatar);</li>
        <li>
          an access token that lets GitFit act on your behalf on GitHub, limited to the permissions
          you approve (see section 3).
        </li>
      </ul>
      <p>
        These are kept in an <strong>encrypted session cookie in your own browser</strong>. They are
        not saved in any database. The access token is never sent to your browser in readable form
        and is only decrypted on our server for the moment needed to call GitHub. The session lasts
        up to 30 days, or until you sign out.
      </p>

      <h2>2. What happens when you use GitFit</h2>
      <p>
        When you open a page or run an action (for example, archiving repositories), our server
        uses your access token to call GitHub&apos;s official API and passes the result straight
        back to your browser. Your repository, star, issue and pull-request data is{" "}
        <strong>not stored, cached, sold or shared</strong> by GitFit.
      </p>
      <p>
        Some preferences stay only in your browser&apos;s local storage: your settings (default
        sort and stale-issue threshold), your GitFit pin board, and whether the sidebar is
        collapsed. They never leave your device, and you can delete them by clearing your
        browser&apos;s site data.
      </p>

      <h2>3. GitHub permissions we ask for</h2>
      <ul>
        <li>
          <code>repo</code>: list and change your repositories, issues and stars (archive, change
          visibility, rename, add topics, close issues, unstar).
        </li>
        <li>
          <code>delete_repo</code>: only used when you explicitly delete repositories and confirm
          it.
        </li>
        <li>
          <code>read:org</code>: show issues and repositories from organizations you belong to.
        </li>
        <li>
          <code>read:user</code> and <code>user:email</code>: your name, avatar and email for
          sign-in.
        </li>
      </ul>
      <p>
        GitFit only performs actions you start yourself. You can revoke GitFit&apos;s access at any
        time in{" "}
        <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">
          GitHub → Settings → Applications
        </a>
        .
      </p>

      <h2>4. Cookies</h2>
      <p>
        GitFit only uses cookies that are strictly necessary for signing in: the encrypted session
        cookie, plus short-lived security cookies used during sign-in (CSRF protection and the
        return address after GitHub sign-in). We use no advertising, analytics or tracking
        cookies, so there is no cookie banner.
      </p>

      <h2>5. Service providers</h2>
      <ul>
        <li>
          <strong>GitHub</strong> provides sign-in and all repository data. Your use of GitHub is
          covered by{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub&apos;s privacy statement
          </a>
          .
        </li>
        <li>
          <strong>Vercel</strong> hosts GitFit. Like any web host, it processes technical request
          data (such as IP address, browser type and the pages requested) to deliver the site and
          keep it secure, and keeps short-lived server logs. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Vercel&apos;s privacy policy
          </a>
          .
        </li>
      </ul>
      <p>We do not sell or rent personal data to anyone.</p>

      <h2>6. Your rights</h2>
      <p>
        Because GitFit keeps no account database, there is nothing stored about you on our side to
        access, correct or delete beyond the session cookie in your browser. To remove everything:
        sign out (which deletes the session cookie), clear GitFit&apos;s site data in your browser,
        and revoke GitFit in your GitHub settings. Depending on where you live, laws such as the EU
        and UK GDPR or India&apos;s Digital Personal Data Protection Act, 2023 give you rights over
        your personal data. To exercise them or ask a question, email us at the address below.
      </p>

      <h2>7. Children</h2>
      <p>
        GitFit is not directed at children. You must meet GitHub&apos;s minimum age requirement
        (13, or older where local law requires) to use it.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        If we change how GitFit handles data, we will update this page and the date above. Material
        changes will also be noted in the project&apos;s public repository.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions or requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  )
}
