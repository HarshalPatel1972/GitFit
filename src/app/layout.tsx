import type { Metadata } from "next"
import { Fraunces, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { ToastProvider } from "@/components/ui/Toast"

// Self-hosted at build time: no requests to Google Fonts at runtime
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
})

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
    <html lang="en" className={`${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
