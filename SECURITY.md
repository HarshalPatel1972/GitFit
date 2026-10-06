# Security Policy

GitFit acts on people's GitHub accounts, including deleting repositories and changing their visibility, so security reports are taken seriously.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately using one of these:

- **GitHub:** [Report a vulnerability](https://github.com/HarshalPatel1972/GitFit/security/advisories/new) (private advisory)
- **Email:** harshalpatel6828@gmail.com, with the subject line `GitFit security`

Please include:

- what the issue is and what an attacker could do with it
- steps to reproduce, or a proof of concept
- the affected URL, page or file, if you know it

## What to expect

- An acknowledgement within **3 business days**
- An initial assessment within **7 days**
- A fix for confirmed, serious issues as quickly as possible, usually within 30 days
- Credit in the release notes once it's fixed, if you'd like it

## Scope

In scope:

- the hosted GitFit service and this repository's code
- anything that exposes a user's GitHub access token, lets one user act on another user's account, or bypasses the confirmations for destructive actions

Out of scope:

- vulnerabilities in GitHub itself (report them to [GitHub's bug bounty](https://bounty.github.com/))
- denial-of-service or volumetric attacks
- reports from automated scanners without a demonstrated impact
- missing best-practice headers with no practical exploit

## Safe harbour

We won't take legal action against good-faith research that follows this policy: test only with your own GitHub account and repositories, avoid harming other users or their data, and give us reasonable time to fix the issue before disclosing it.
