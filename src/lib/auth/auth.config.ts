import CredentialsProvider from 'next-auth/providers/credentials';
// Uncomment when ready to use Google OAuth
// import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/actions/auth/getUserByEmail';

/**
 * NextAuth Configuration
 * Handles authentication using Credentials (Email/Password) and Google OAuth (commented)
 * Following SOLID principles with callback separation
 */
export const authOptions: any = {
  providers: [
    // Credentials Provider - Email & Password Authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@test.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          console.log('[Auth] Starting authorization for:', credentials?.email);
          
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            console.error('[Auth] Missing email or password');
            throw new Error('Email and password are required');
          }

          // Check environment variables
          if (!process.env.USERS_SHEET_ID && !process.env.GOOGLE_SHEETS_ID) {
            console.error('[Auth] Missing USERS_SHEET_ID or GOOGLE_SHEETS_ID');
            throw new Error('System configuration error. Please contact support.');
          }

          // Fetch user from Google Sheets
          console.log('[Auth] Fetching user from Google Sheets...');
          const user = await getUserByEmail(credentials.email as string);

          if (!user) {
            console.error('[Auth] No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }

          console.log('[Auth] User found:', { email: user.email, role: user.role, status: user.status });

          // Check if account is active
          if (user.status !== 'active') {
            console.error('[Auth] Account inactive:', user.email);
            throw new Error('Your account has been deactivated. Please contact administrator.');
          }

          // Verify password
          if (!user.password) {
            console.error('[Auth] No password set for user:', user.email);
            throw new Error('Password not set for this account');
          }

          let isPasswordValid = false;
          
          try {
            // For students and faculty, compare passwords directly without hashing
            if (user.role === 'student' || user.role === 'faculty') {
              isPasswordValid = credentials.password === user.password;
              console.log('[Auth] Direct password comparison for', user.role, ':', isPasswordValid);
            } else {
              // For other roles (admin, librarian, etc.), use bcrypt to compare hashed passwords
              isPasswordValid = await bcrypt.compare(
                credentials.password as string,
                user.password
              );
              console.log('[Auth] Bcrypt password comparison:', isPasswordValid);
            }
          } catch (passwordError) {
            console.error('[Auth] Password verification error:', passwordError);
            throw new Error('Invalid email or password');
          }

          if (!isPasswordValid) {
            console.error('[Auth] Invalid password for user:', user.email);
            throw new Error('Invalid email or password');
          }

          console.log('[Auth] Authorization successful for:', user.email);

          // Return user data (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
          };
        } catch (error) {
          console.error('[Auth] Authorization error:', error);
          // Re-throw the error with the message for better client-side handling
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('Authentication failed. Please try again.');
        }
      },
    }),

    // Google OAuth Provider (Uncomment when ready to use)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code"
    //     }
    //   }
    // }),
  ],

  // Callbacks to customize JWT and session
  callbacks: {
    // JWT Callback - Add custom fields to token
    async jwt({ token, user, account, trigger }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.department = (user as any).department;
      }

      // OAuth sign in - fetch role from Google Sheets
      if (account?.provider === 'google' && user?.email) {
        const userData = await getUserByEmail(user.email);
        if (userData) {
          token.role = userData.role;
          token.department = userData.department;
        }
      }

      return token;
    },

    // Session Callback - Add custom fields to session
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },

    // Redirect Callback - Role-based redirect after login
    async redirect({ url, baseUrl, token }: any) {
      // Handle role-based redirects after login
      if (url === baseUrl || url === `${baseUrl}/login`) {
        const role = token?.role;

        if (role === 'super-admin') {
          return `${baseUrl}/dashboard/super-admin`;
        } else if (role === 'librarian') {
          return `${baseUrl}/dashboard/library`;
        } else if (role === 'warden' || role === 'hostel') {
          return `${baseUrl}/dashboard/hostel`;
        } else if (role === 'admission') {
          return `${baseUrl}/dashboard/admission`;
        } else if (role === 'accountant') {
          return `${baseUrl}/dashboard/accounts`;
        } else if (role === 'student') {
          return `${baseUrl}/dashboard/student`;
        } else if (role === 'faculty') {
          return `${baseUrl}/dashboard/faculty`;
        }

        // Default to main dashboard (for admin and others)
        return `${baseUrl}/dashboard`;
      }

      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login page
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};
