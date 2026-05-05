import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute = ["/dashboard", "/stars", "/feed", "/pins", "/settings"].some(
    (path) => req.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Redirect authenticated users from landing to dashboard
  if (req.nextUrl.pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/", "/dashboard/:path*", "/stars/:path*", "/feed/:path*", "/pins/:path*", "/settings/:path*"],
}
