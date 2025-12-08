import { cache } from 'react';
import { getSheetData } from '@/lib/google/sheets';
import { AuthUser, UserRole } from '@/types/auth';

/**
 * Cached fetch of the entire Users sheet.
 * Uses React/Next server `cache` so repeated server calls reuse in-memory results
 * for the lifetime of the server instance (suitable for data that changes infrequently).
 */
export const fetchAllUsers = cache(async function fetchAllUsers(): Promise<any[]> {
  const usersSheetId = process.env.USERS_SHEET_ID;
  if (!usersSheetId) {
    console.warn('[usersCache] USERS_SHEET_ID not configured');
    return [];
  }

  const data = await getSheetData(usersSheetId, 'Users!A:G');
  return data || [];
});

export async function getUserFromUsersByEmail(email: string): Promise<AuthUser | null> {
  const rows = await fetchAllUsers();
  const row = rows.find(
    (r) => r.Email?.toString().toLowerCase() === email.toLowerCase()
  );

  if (!row) return null;

  const user: AuthUser = {
    id: row.Email as string,
    email: row.Email as string,
    name: row.Name as string,
    password: row.Password as string,
    role: row.Role as UserRole,
    department: row.Department as string || undefined,
    status: (row.Status as 'active' | 'inactive') || 'active',
  };

  return user;
}
