"use server";

import { fetchAllStudents } from "@/lib/google/sheets.student";
import type { Student } from "@/types/student";

interface StudentProfileResponse {
  success: boolean;
  data?: Student;
  message?: string;
}

export async function getStudentProfileByEmail(
  email: string
): Promise<StudentProfileResponse> {
  try {
    if (!email) {
      return {
        success: false,
        message: "Email is required to fetch student profile",
      };
    }

    const students = await fetchAllStudents();
    const student = students.find(
      (entry) => entry.personalInfo.email.toLowerCase() === email.toLowerCase()
    );

    if (!student) {
      return {
        success: false,
        message: "Student profile not found",
      };
    }

    return {
      success: true,
      data: student,
    };
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return {
      success: false,
      message: "Failed to fetch student profile",
    };
  }
}
