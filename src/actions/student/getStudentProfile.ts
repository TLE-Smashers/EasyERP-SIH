"use server";

import { fetchAllStudents } from "@/lib/google/sheets.student";
import { fetchStudentsFromSheet } from "@/lib/google/sheets.studentTable";
import type { Student } from "@/types/student";
import type { StudentRecord } from "@/lib/google/sheets.studentTable";

interface StudentProfileResponse {
  success: boolean;
  data?: Student;
  message?: string;
}

/**
 * Convert StudentRecord from Student sheet to Student format
 */
function convertStudentRecordToStudent(record: StudentRecord): Student {
  // Calculate if graduated
  const admissionYear = parseInt(record.admissionYear);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const graduationYear = admissionYear + 4;
  const isGraduated = currentYear > graduationYear || (currentYear === graduationYear && currentMonth >= 5);

  return {
    id: record.id,
    personalInfo: {
      fullName: record.fullName,
      email: record.email,
      mobileNumber: record.mobileNumber,
      dateOfBirth: record.dateOfBirth,
      address: '', // Not in Student sheet
      guardianName: record.guardianName,
      guardianContact: '', // Not in Student sheet
    },
    academicInfo: {
      studentId: record.id,
      rollNumber: record.enrollmentNumber,
      course: record.course,
      branch: record.branch,
      year: parseInt(record.currentYear) || 1,
      semester: parseInt(record.currentSemester) || 1,
      batch: record.batch || `${record.admissionYear}-${parseInt(record.admissionYear) + 4}`,
    },
    status: isGraduated ? 'graduated' : 'active',
    admissionDate: record.admissionDate,
    documents: {},
  };
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

    // First, try to get from Student sheet (real data)
    try {
      const studentsFromSheet = await fetchStudentsFromSheet();
      const studentRecord = studentsFromSheet.find(
        (entry) => entry.email.toLowerCase() === email.toLowerCase()
      );

      if (studentRecord) {
        const student = convertStudentRecordToStudent(studentRecord);
        return {
          success: true,
          data: student,
        };
      }
    } catch (sheetError) {
      console.log('Student sheet not found or error, falling back to Admissions:', sheetError);
    }

    // Fallback to Admissions sheet
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
