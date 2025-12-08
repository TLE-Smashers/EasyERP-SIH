import { handlers } from '@/lib/auth/auth';

/**
 * NextAuth API Route Handler
 * Handles all authentication requests
 * GET /api/auth/* - Authentication endpoints
 * POST /api/auth/* - Authentication actions
 */
export const { GET, POST } = handlers;

// Force Node.js runtime (required for googleapis)
export const runtime = 'nodejs';
