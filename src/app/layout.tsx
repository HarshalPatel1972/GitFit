import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { ToastContainer } from "@/components/ui/Toast"

export const metadata: Metadata = {
  title: "GitFit — Your GitHub, finally under control",
  description:
    "Bulk manage your GitHub repos, stars, pins, and issues. Archive, privatize, delete, tag, and rename — all in one warm, fast dashboard.",
  icons: { icon: "/icon.png" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
