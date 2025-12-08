/**
 * Server Actions for Student Management
 */

"use server";

import { fetchAllStudents, getUniqueBranches, getUniqueYears } from "@/lib/google/sheets.student";
import type { Student, StudentFilters } from "@/types/student";

/**
 * Get all students with optional filters
 */
export async function getStudents(filters?: StudentFilters) {
  try {
    let students = await fetchAllStudents();

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      students = students.filter(student =>
        student.personalInfo.fullName.toLowerCase().includes(searchLower) ||
        student.academicInfo.studentId.toLowerCase().includes(searchLower) ||
        student.academicInfo.rollNumber?.toLowerCase().includes(searchLower) ||
        student.personalInfo.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply branch filter
    if (filters?.branch) {
      students = students.filter(student => student.academicInfo.branch === filters.branch);
    }

    // Apply year filter
    if (filters?.year) {
      students = students.filter(student => student.academicInfo.year === filters.year);
    }

    // Apply status filter
    if (filters?.status) {
      students = students.filter(student => student.status === filters.status);
    }

    return {
      success: true,
      data: students,
    };
  } catch (error) {
    console.error("Error getting students:", error);
    return {
      success: false,
      message: "Failed to fetch students",
      data: [],
    };
  }
}

/**
 * Get filter options (branches and years)
 */
export async function getFilterOptions() {
  try {
    const [branches, years] = await Promise.all([
      getUniqueBranches(),
      getUniqueYears(),
    ]);

    return {
      success: true,
      data: { branches, years },
    };
  } catch (error) {
    console.error("Error getting filter options:", error);
    return {
      success: false,
      message: "Failed to fetch filter options",
      data: { branches: [], years: [] },
    };
  }
}
