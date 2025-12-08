"use server";

import { auth } from "@/lib/auth/auth";
import { getUserByEmail } from "@/actions/auth/getUserByEmail";
import type { User } from "@/types/auth";

/**
 * Fetches the current logged-in user's profile information
 * Follows SOLID principles - Single Responsibility
 * 
 * @returns User profile data or null if not authenticated
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    // Get current session
    const session = await auth();

    if (!session?.user?.email) {
      console.log("No authenticated user found");
      return null;
    }

    // Fetch full user data from Google Sheets
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      console.log(`User profile not found: ${session.user.email}`);
      return null;
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}
