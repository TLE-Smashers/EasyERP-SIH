"use server";

import { 
  fetchStudentsByBranch, 
  getFiltersForBranch
} from "@/lib/google/sheets.studentTable";

/**
 * Get students filtered by faculty's branch
 * @param branch - The branch to filter students by
 * @param year - Optional year filter
 * @param section - Optional section filter
 */
export async function getStudentsByBranch(
  branch: string,
  year?: string
) {
  try {
    console.log("[getStudentsByBranch] Called with:", { branch, year });
    const students = await fetchStudentsByBranch(branch, year);
    console.log("[getStudentsByBranch] Success, returning", students.length, "students");

    return {
      success: true,
      data: students,
      message: "Students fetched successfully",
    };
  } catch (error) {
    console.error("[getStudentsByBranch] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch students";
    console.error("[getStudentsByBranch] Error message:", errorMessage);
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}

/**
 * Get unique years and sections for a branch
 */
export async function getBranchFilters(branch: string) {
  try {
    const { years, sections } = await getFiltersForBranch(branch);

    return {
      success: true,
      data: { years, sections },
      message: "Filters fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching branch filters:", error);
    return {
      success: false,
      data: { years: [], sections: [] },
      message: error instanceof Error ? error.message : "Failed to fetch filters",
    };
  }
}
