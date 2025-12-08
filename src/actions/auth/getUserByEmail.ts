import { AuthUser, UserRole } from '@/types/auth';
import { getUserFromUsersByEmail } from '@/lib/usersCache';

/**
 * Fetches user data from Google Sheets by email
 * For login this now checks only the Users sheet (cached).
 * Following SOLID principles - this action only handles user retrieval
 * 
 * @param email - User's email address
 * @returns AuthUser object or null if not found
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    
    if (!sheetId) {
      console.error('GOOGLE_SHEETS_ID not configured in environment variables');
      throw new Error('GOOGLE_SHEETS_ID not configured');
    }

    console.log('[getUserByEmail] Looking for user in Users sheet only:', email);

    // Only check Users sheet for login (faculty and students should be represented here for login)
    try {
      const user = await getUserFromUsersByEmail(email);
      if (user) {
        console.log('[getUserByEmail] User found in Users sheet:', user.email);
        return user;
      }
      console.log('[getUserByEmail] User not found in Users sheet:', email);
      return null;
    } catch (error) {
      console.error('[getUserByEmail] Error fetching from Users sheet:', error);
      return null;
    }
  } catch (error) {
    console.error('[getUserByEmail] Error fetching user by email:', error);
    return null;
  }
}

/**
 * Validates if a user role is valid
 * @param role - Role to validate
 * @returns boolean
 */
export function isValidRole(role: string): role is UserRole {
  const validRoles: UserRole[] = [
    'admin',
    'admission',
    'accountant',
    'warden',
    'librarian',
    'student',
    'faculty',
  ];
  return validRoles.includes(role as UserRole);
}
