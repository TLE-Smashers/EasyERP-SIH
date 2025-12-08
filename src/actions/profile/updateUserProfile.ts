"use server";

import { auth } from "@/lib/auth/auth";
import { updateSheetRow } from "@/lib/google/sheets";
import { getSheetData } from "@/lib/google/sheets";
import type { ApiResponse } from "@/lib/google/sheets";

/**
 * Updates user profile information in Google Sheets
 * Follows SOLID principles - Single Responsibility
 * 
 * @param name - Updated user name
 * @param department - Updated department
 * @returns ApiResponse with success status
 */
export async function updateUserProfile(
  name: string,
  department?: string
): Promise<ApiResponse> {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized: No authenticated user",
      };
    }

    // Validate input
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "Name is required",
      };
    }

    const sheetId = process.env.USERS_SHEET_ID;
    if (!sheetId) {
      return {
        success: false,
        error: "Configuration error: USERS_SHEET_ID not set",
      };
    }

    // Fetch all users to find the current user
    const data = await getSheetData(sheetId, "Users!A:G");

    // Find user row by email
    let userRowIndex = -1;
    let userRow = null;

    for (let i = 0; i < data.length; i++) {
      if (data[i].Email?.toString().toLowerCase() === session.user.email.toLowerCase()) {
        userRowIndex = i;
        userRow = data[i];
        break;
      }
    }

    if (userRowIndex === -1) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Update user data
    const currentUser = userRow!;
    const updatedRow = [
      currentUser.Email,
      name,
      currentUser.Password, // Keep existing password
      currentUser.Role,
      department || currentUser.Department || "",
      currentUser.Status,
      currentUser.LastLogin || "",
    ];

    // Update the specific row in Google Sheets (row number is index + 2 because of header)
    const range = `Users!A${userRowIndex + 2}:G${userRowIndex + 2}`;
    const result = await updateSheetRow(sheetId, range, [updatedRow]);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to update profile",
      };
    }

    return {
      success: true,
      data: { message: "Profile updated successfully" },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Failed to update profile: " + (error instanceof Error ? error.message : "Unknown error"),
    };
  }
}
