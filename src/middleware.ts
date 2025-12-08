import { auth } from "@/lib/auth/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Allow access to dashboard routes if logged in
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    return Response.redirect(loginUrl)
  }

  // User is logged in, allow access
  return
})

export const config = {
  matcher: ["/dashboard/:path*"],
}

// Use Node.js runtime for middleware
export const runtime = 'nodejs';
