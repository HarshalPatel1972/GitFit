import type { Metadata } from "next"
import Link from "next/link"
import { CONTACT_EMAIL, LegalPage } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Terms of Service — GitFit",
  description: "The terms for using GitFit, the bulk manager for your GitHub account.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="6 October 2026">
      <p>
        These terms apply to your use of the hosted GitFit service (the &quot;Service&quot;). By
        signing in, you agree to them. If you do not agree, do not use the Service.
      </p>

      <h2>1. What GitFit is</h2>
      <p>
        GitFit is a free tool that lets you view and change your own GitHub repositories, stars,
        issues and pull requests in bulk, using GitHub&apos;s official API and the permissions you
        grant. GitFit is an independent project and is{" "}
        <strong>not affiliated with, endorsed by or sponsored by GitHub, Inc.</strong>
      </p>

      <h2>2. Your account and GitHub&apos;s terms</h2>
      <p>
        You sign in with your GitHub account and remain bound by{" "}
        <a
          href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub&apos;s Terms of Service
        </a>{" "}
        and its Acceptable Use Policies. You must meet GitHub&apos;s minimum age requirement. You
        are responsible for everything done through GitFit with your account.
      </p>

      <h2>3. Your actions are your responsibility</h2>
      <p>
        GitFit performs the actions you choose, on the repositories you select. Some of them{" "}
        <strong>cannot be undone</strong>, including:
      </p>
      <ul>
        <li>deleting repositories;</li>
        <li>
          making a public repository private, which permanently removes its stars and watchers on
          GitHub;
        </li>
        <li>making a private repository public, which exposes its contents and history;</li>
        <li>closing issues and posting comments, which notifies other people.</li>
      </ul>
      <p>
        Review your selection carefully and keep backups of anything important. We are not
        responsible for data loss or other consequences of actions you perform through the Service.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service to break the law or GitHub&apos;s terms, or to spam or harass others;</li>
        <li>
          attempt to disrupt, overload, probe or gain unauthorised access to the Service or other
          users&apos; data;
        </li>
        <li>use automated means to make excessive requests to the Service.</li>
      </ul>
      <p>
        Security issues should be reported responsibly as described in the project&apos;s{" "}
        <a
          href="https://github.com/HarshalPatel1972/GitFit/blob/main/SECURITY.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          security policy
        </a>
        .
      </p>

      <h2>5. Open-source software</h2>
      <p>
        GitFit&apos;s source code is available under the{" "}
        <a
          href="https://github.com/HarshalPatel1972/GitFit/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          MIT License
        </a>
        . These terms cover the hosted Service; the license covers the code.
      </p>

      <h2>6. Availability and changes</h2>
      <p>
        The Service is provided free of charge. We may change, suspend or discontinue any part of
        it at any time, and it may be limited by GitHub&apos;s API availability and rate limits. We
        may suspend access for anyone who breaks these terms.
      </p>

      <h2>7. No warranty</h2>
      <p>
        The Service is provided <strong>&quot;as is&quot; and &quot;as available&quot;</strong>,
        without warranties of any kind, express or implied, including merchantability, fitness for
        a particular purpose and non-infringement. We do not guarantee that it will be error-free,
        uninterrupted or secure.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, the GitFit maintainers will not be liable for any
        indirect, incidental, special, consequential or punitive damages, or for any loss of data,
        repositories, stars, profits or goodwill, arising from your use of or inability to use the
        Service. Nothing in these terms limits liability that cannot be limited under applicable
        law.
      </p>

      <h2>9. Privacy</h2>
      <p>
        How GitFit handles data is described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Any dispute will be subject to the
        jurisdiction of the courts of India, without affecting any mandatory consumer protections
        you have where you live.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms. The date above shows the latest version. Continuing to use the
        Service after a change means you accept the updated terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </LegalPage>
  )
}
