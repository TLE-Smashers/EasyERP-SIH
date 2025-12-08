"use client"

import { useState } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      // Validate inputs
      if (!formData.email.trim()) {
        setError("Please enter your email address")
        return
      }

      if (!formData.password) {
        setError("Please enter your password")
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        return
      }

      const result = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Improved error messages based on error type
        const errorMsg = result.error.toLowerCase()
        
        if (errorMsg.includes("no user found") || errorMsg.includes("invalid")) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (errorMsg.includes("inactive") || errorMsg.includes("deactivated")) {
          setError("Your account is inactive. Please contact the administrator for assistance.")
        } else if (errorMsg.includes("password not set")) {
          setError("Password not configured for this account. Please contact the administrator.")
        } else if (errorMsg.includes("required")) {
          setError("Email and password are required.")
        } else if (errorMsg.includes("configuration") || errorMsg.includes("config")) {
          setError("System configuration error. Please contact technical support.")
        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
          setError("Network error. Please check your internet connection and try again.")
        } else if (errorMsg.includes("timeout")) {
          setError("Request timeout. Please try again.")
        } else {
          // Show a user-friendly message for unknown errors
          setError("Login failed. Please verify your credentials or contact support if the issue persists.")
        }
        return
      }

      if (!result?.ok) {
        setError("Authentication failed. Please try again.")
        return
      }

  // Wait a bit for session to be established
  await new Promise(resolve => setTimeout(resolve, 500))
  
  try {
    // Fetch session after login
    const sessionRes = await fetch('/api/auth/session');
    
    if (!sessionRes.ok) {
      setError("Failed to establish session. Please try logging in again.")
      return
    }
    
    const session = await sessionRes.json();
    
    if (!session?.user) {
      setError("Session verification failed. Please try logging in again.")
      return
    }
    
    const role = session.user.role;
    
    if (!role) {
      setError("User role not found. Please contact the administrator.")
      return
    }
    
      // Direct redirect based on role
      if (role === 'librarian') {
        router.push("/dashboard/library")
      } else if (role === 'warden' || role === 'hostel') {
        router.push("/dashboard/hostel")
      } else if (role === 'admission') {
        router.push("/dashboard/admission")
      } else if (role === 'accountant') {
        router.push("/dashboard/accounts")
      } else if (role === 'student') {
        router.push("/dashboard/student")
      } else if (role === 'faculty') {
        router.push("/dashboard/faculty")
      } else {
        // Admin and others
        router.push("/dashboard")
      }
    } catch (sessionError) {
      console.error("Session error:", sessionError)
      setError("Failed to verify session. Please try logging in again.")
    }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <Image
                  src="/logoEasyErp.png"
                  alt="Easy ERP Logo"
                  width={64}
                  height={64}
                  className="rounded-lg mb-2"
                />
                <h1 className="text-2xl font-bold">Easy ERP</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your ERP account
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@test.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </Field>

              {/* Google OAuth - Commented for now */}
              {/* <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => signIn("google")}
                  disabled={isLoading}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="ml-2">Continue with Google</span>
                </Button>
              </Field> */}

              <FieldDescription className="text-center text-xs text-muted-foreground">
                Test: admin@test.com / 12345
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block overflow-hidden">
            <img
              src="https://plus.unsplash.com/premium_photo-1671148830485-baf199706d45?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Students studying"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Vignette shadow effect from corners */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"></div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
