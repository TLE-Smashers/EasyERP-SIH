"use server";

import {
  markStudentAttendance,
  getAttendanceByDateAndClass,
} from "@/lib/google/sheets.studentAttendance";

/**
 * Mark attendance for students
 */
export async function saveStudentAttendance(
  attendanceData: {
    date: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    branch: string;
    year: string;
    semester: string;
    subject: string;
    status: "present" | "absent";
    remarks?: string;
  }[],
  facultyId: string,
  facultyName: string
) {
  try {
    // Map to correct field names for the sheet
    const records = attendanceData.map((data) => ({
      date: data.date,
      studentId: data.studentId,
      enrollmentNumber: data.rollNumber,
      studentName: data.studentName,
      branch: data.branch,
      currentYear: data.year,
      currentSemester: data.semester,
      status: data.status,
      facultyId,
      facultyName,
      subject: data.subject,
      remarks: data.remarks,
    }));

    await markStudentAttendance(records);

    return {
      success: true,
      message: `Attendance marked successfully for ${records.length} students`,
    };
  } catch (error) {
    console.error("Error saving student attendance:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to mark attendance",
    };
  }
}

/**
 * Check if attendance is already marked for a date and class
 */
export async function checkAttendanceExists(
  date: string,
  branch: string,
  year: string,
  subject: string,
  section?: string
) {
  try {
    const existingRecords = await getAttendanceByDateAndClass(
      date,
      branch,
      year,
      section
    );

    // Filter by subject as well
    const subjectRecords = existingRecords.filter((r) => r.subject === subject);

    return {
      success: true,
      exists: subjectRecords.length > 0,
      records: subjectRecords,
    };
  } catch (error) {
    console.error("Error checking attendance:", error);
    return {
      success: false,
      exists: false,
      message: error instanceof Error ? error.message : "Failed to check attendance",
    };
  }
}
