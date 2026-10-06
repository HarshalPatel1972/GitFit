/**
 * Public URL of the site, used for canonical links, the sitemap and social previews.
 * Set NEXT_PUBLIC_SITE_URL once you have a custom domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://git-fit-ten.vercel.app")
).replace(/\/$/, "")

export const SITE_NAME = "GitFit"
export const SITE_TAGLINE = "Your GitHub, finally under control"
export const SITE_DESCRIPTION =
  "Bulk manage your GitHub repos, stars and issues. Archive, privatize, delete, tag and rename dozens of repos in seconds. Free, open source, no data stored."
