import { signIn } from "@/lib/auth"
import { Landing } from "@/components/landing/Landing"

const notices: Record<string, string> = {
  session_expired: "Your GitHub session expired or access was revoked. Please sign in again.",
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <Landing
      notice={error ? notices[error] : undefined}
      signInAction={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}
    />
  )
}
