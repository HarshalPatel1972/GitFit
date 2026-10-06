"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { useState } from "react"
import { handleSessionExpiry } from "@/lib/client-actions"
import { GitFitError } from "@/lib/result"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleSessionExpiry }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            // Retrying can't fix an expired token or an exhausted rate limit
            retry: (failureCount, error) =>
              !(error instanceof GitFitError && error.code !== "unknown") && failureCount < 2,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  )
}
