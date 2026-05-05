import { signIn } from "@/lib/auth"
import { LandingContent } from "@/components/landing/LandingContent"

export default function LandingPage() {
  return (
    <LandingContent
      signInAction={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}
    />
  )
}
