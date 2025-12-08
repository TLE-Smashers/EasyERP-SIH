"use server";

import { getActiveNotices } from "@/lib/google/sheets.notices";

/**
 * Get active notices for faculty
 */
export async function getFacultyNotices() {
  try {
    const result = await getActiveNotices("Faculty");
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message || "Failed to fetch notices",
        notices: [],
      };
    }

    // Sort by priority (High > Medium > Low) and then by date (newest first)
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    const sortedNotices = result.data.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    return {
      success: true,
      notices: sortedNotices,
    };
  } catch (error) {
    console.error("Error fetching faculty notices:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch notices",
      notices: [],
    };
  }
}
