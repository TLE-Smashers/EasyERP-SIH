"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const STUDENT_ATTENDANCE_SHEET_NAME = "Student_Attendance";

interface AttendanceRecord {
  attendanceId: string;
  date: string;
  studentId: string;
  enrollmentNumber: string;
  studentName: string;
  branch: string;
  currentYear: string;
  currentSemester: string;
  status: string;
  facultyId: string;
  facultyName: string;
  subject: string;
  remarks: string;
  markedAt: string;
  updatedAt: string;
  academicYear: string;
}

interface SubjectAttendance {
  subject: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

interface AttendanceStats {
  overallPercentage: number;
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  subjectWise: SubjectAttendance[];
  recentAttendance: {
    date: string;
    subject: string;
    status: string;
    facultyName: string;
  }[];
}

async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_ID not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function rowToAttendance(row: string[]): AttendanceRecord {
  return {
    attendanceId: row[0] || "",
    date: row[1] || "",
    studentId: row[2] || "",
    enrollmentNumber: row[3] || "",
    studentName: row[4] || "",
    branch: row[5] || "",
    currentYear: row[6] || "",
    currentSemester: row[7] || "",
    status: row[8] || "",
    facultyId: row[9] || "",
    facultyName: row[10] || "",
    subject: row[11] || "",
    remarks: row[12] || "",
    markedAt: row[13] || "",
    updatedAt: row[14] || "",
    academicYear: row[15] || "",
  };
}

export async function getStudentAttendanceByEmail(email: string): Promise<{
  success: boolean;
  data?: AttendanceStats;
  message?: string;
}> {
  try {
    const sheets = await getSheetsClient();

    // First, get student info from Student sheet
    const studentResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Student!A2:P",
    });

    const studentRows = studentResponse.data.values || [];
    const student = studentRows.find((row) => row[5] === email); // email is in column F (index 5)

    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    const studentId = student[0];
    const enrollmentNumber = student[1];

    // Get all attendance records for this student
    const attendanceResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${STUDENT_ATTENDANCE_SHEET_NAME}!A2:P`,
    });

    const rows = attendanceResponse.data.values || [];
    const attendanceRecords = rows
      .map(rowToAttendance)
      .filter(
        (record) =>
          record.studentId === studentId ||
          record.enrollmentNumber === enrollmentNumber
      );

    // Calculate subject-wise attendance
    const subjectMap = new Map<string, { present: number; absent: number }>();

    attendanceRecords.forEach((record) => {
      const subject = record.subject;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { present: 0, absent: 0 });
      }

      const subjectData = subjectMap.get(subject)!;
      // Trim and compare case-insensitively
      const status = record.status.trim().toLowerCase();
      if (status === "present") {
        subjectData.present++;
      } else if (status === "absent") {
        subjectData.absent++;
      }
    });

    // Convert to array and calculate percentages
    const subjectWise: SubjectAttendance[] = Array.from(
      subjectMap.entries()
    ).map(([subject, data]) => {
      const total = data.present + data.absent;
      const percentage = total > 0 ? (data.present / total) * 100 : 0;
      return {
        subject,
        present: data.present,
        absent: data.absent,
        total,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    // Sort by subject name
    subjectWise.sort((a, b) => a.subject.localeCompare(b.subject));

    // Calculate overall stats
    const totalClasses = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(
      (r) => r.status.trim().toLowerCase() === "present"
    ).length;
    const totalAbsent = totalClasses - totalPresent;
    const overallPercentage =
      totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    // Get recent attendance (last 10 records)
    const recentAttendance = attendanceRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((record) => ({
        date: record.date,
        subject: record.subject,
        status: record.status.trim(),
        facultyName: record.facultyName,
      }));

    return {
      success: true,
      data: {
        overallPercentage: Math.round(overallPercentage * 100) / 100,
        totalClasses,
        totalPresent,
        totalAbsent,
        subjectWise,
        recentAttendance,
      },
    };
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch attendance",
    };
  }
}
