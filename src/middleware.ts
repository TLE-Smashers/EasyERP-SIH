import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"
import { getStudentProfileByEmail } from "@/actions/student/getStudentProfile"

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    return Response.redirect(loginUrl)
  }

  // Check if user is a student and redirect based on graduation status
  if (isLoggedIn && req.auth?.user?.role === 'student') {
    const userEmail = req.auth.user.email

    // Fetch student profile to check status
    if (userEmail) {
      try {
        const studentProfile = await getStudentProfileByEmail(userEmail)

        if (studentProfile.success && studentProfile.data) {
          const isGraduated = studentProfile.data.status === 'graduated'

          // Redirect graduated students to alumni dashboard
          if (isGraduated && pathname.startsWith('/dashboard/student')) {
            const alumniUrl = new URL('/dashboard/alumni', req.url)
            return NextResponse.redirect(alumniUrl)
          }

          // Redirect active students away from alumni dashboard
          if (!isGraduated && pathname.startsWith('/dashboard/alumni')) {
            const studentUrl = new URL('/dashboard/student', req.url)
            return NextResponse.redirect(studentUrl)
          }
        }
      } catch (error) {
        console.error('Error checking student status:', error)
        // Continue without redirect on error
      }
    }
  }

  // User is logged in, allow access
  return
})

export const config = {
  matcher: ["/dashboard/:path*"],
}

// Use Node.js runtime for middleware
export const runtime = 'nodejs';
