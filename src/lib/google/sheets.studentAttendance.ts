/**
 * Google Sheets Integration for Student Attendance
 * Handles student attendance marking by faculty
 */

"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const STUDENT_ATTENDANCE_SHEET_NAME = "Student_Attendance";

/**
 * Column mapping for StudentAttendance sheet
 * attendanceId, date, studentId, enrollmentNumber, studentName, branch, 
 * currentYear, currentSemester, status, facultyId, facultyName, subject, 
 * remarks, markedAt, updatedAt, academicYear
 */
const COLUMN_INDEX = {
  attendanceId: 0,        // A
  date: 1,                // B
  studentId: 2,           // C
  enrollmentNumber: 3,    // D
  studentName: 4,         // E
  branch: 5,              // F
  currentYear: 6,         // G
  currentSemester: 7,     // H
  status: 8,              // I - present/absent
  facultyId: 9,           // J
  facultyName: 10,        // K
  subject: 11,            // L
  remarks: 12,            // M
  markedAt: 13,           // N
  updatedAt: 14,          // O
  academicYear: 15,       // P
} as const;

/**
 * Get authenticated Google Sheets client
 */
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

export interface StudentAttendanceRecord {
  attendanceId: string;
  date: string;
  studentId: string;
  enrollmentNumber: string;
  studentName: string;
  branch: string;
  currentYear: string;
  currentSemester: string;
  status: "present" | "absent";
  facultyId: string;
  facultyName: string;
  subject: string;
  remarks?: string;
  markedAt: string;
  updatedAt?: string;
  academicYear?: string;
}

/**
 * Transform row to StudentAttendanceRecord
 */
function rowToAttendanceRecord(row: string[]): StudentAttendanceRecord {
  return {
    attendanceId: row[COLUMN_INDEX.attendanceId] || "",
    date: row[COLUMN_INDEX.date] || "",
    studentId: row[COLUMN_INDEX.studentId] || "",
    enrollmentNumber: row[COLUMN_INDEX.enrollmentNumber] || "",
    studentName: row[COLUMN_INDEX.studentName] || "",
    branch: row[COLUMN_INDEX.branch] || "",
    currentYear: row[COLUMN_INDEX.currentYear] || "",
    currentSemester: row[COLUMN_INDEX.currentSemester] || "",
    status: (row[COLUMN_INDEX.status] || "absent") as "present" | "absent",
    facultyId: row[COLUMN_INDEX.facultyId] || "",
    facultyName: row[COLUMN_INDEX.facultyName] || "",
    subject: row[COLUMN_INDEX.subject] || "",
    remarks: row[COLUMN_INDEX.remarks] || "",
    markedAt: row[COLUMN_INDEX.markedAt] || "",
    updatedAt: row[COLUMN_INDEX.updatedAt] || "",
    academicYear: row[COLUMN_INDEX.academicYear] || "",
  };
}

/**
 * Transform StudentAttendanceRecord to row
 */
function attendanceRecordToRow(record: StudentAttendanceRecord): string[] {
  const row = new Array(16).fill("");
  row[COLUMN_INDEX.attendanceId] = record.attendanceId;
  row[COLUMN_INDEX.date] = record.date;
  row[COLUMN_INDEX.studentId] = record.studentId;
  row[COLUMN_INDEX.enrollmentNumber] = record.enrollmentNumber;
  row[COLUMN_INDEX.studentName] = record.studentName;
  row[COLUMN_INDEX.branch] = record.branch;
  row[COLUMN_INDEX.currentYear] = record.currentYear;
  row[COLUMN_INDEX.currentSemester] = record.currentSemester;
  row[COLUMN_INDEX.status] = record.status;
  row[COLUMN_INDEX.facultyId] = record.facultyId;
  row[COLUMN_INDEX.facultyName] = record.facultyName;
  row[COLUMN_INDEX.subject] = record.subject;
  row[COLUMN_INDEX.remarks] = record.remarks || "";
  row[COLUMN_INDEX.markedAt] = record.markedAt;
  row[COLUMN_INDEX.updatedAt] = record.updatedAt || new Date().toISOString();
  row[COLUMN_INDEX.academicYear] = record.academicYear || new Date().getFullYear().toString();
  return row;
}

/**
 * Mark attendance for multiple students
 */
export async function markStudentAttendance(
  records: Omit<StudentAttendanceRecord, "attendanceId" | "markedAt">[]
): Promise<void> {
  const sheets = await getSheetsClient();

  // Generate attendance records with IDs and timestamps
  const timestamp = new Date().toISOString();
  const attendanceRecords: StudentAttendanceRecord[] = records.map((record, index) => ({
    ...record,
    attendanceId: `ATT-${Date.now()}-${index}`,
    markedAt: timestamp,
  }));

  // Convert to rows
  const rows = attendanceRecords.map(attendanceRecordToRow);

  // Append to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${STUDENT_ATTENDANCE_SHEET_NAME}!A:P`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });
}

/**
 * Get attendance for a specific date and class
 */
export async function getAttendanceByDateAndClass(
  date: string,
  branch: string,
  year: string,
  section?: string
): Promise<StudentAttendanceRecord[]> {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${STUDENT_ATTENDANCE_SHEET_NAME}!A2:P`,
  });

  const rows = response.data.values || [];

  return rows
    .map(rowToAttendanceRecord)
    .filter((record) => {
      if (record.date !== date) return false;
      if (record.branch !== branch) return false;
      if (record.currentYear !== year) return false;
      // No section filtering since we removed it
      return true;
      return true;
    });
}

/**
 * Get attendance statistics for a student
 */
export async function getStudentAttendanceStats(
  studentId: string,
  startDate?: string,
  endDate?: string
) {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${STUDENT_ATTENDANCE_SHEET_NAME}!A2:P`,
  });

  const rows = response.data.values || [];
  let records = rows.map(rowToAttendanceRecord).filter((r) => r.studentId === studentId);

  // Filter by date range if provided
  if (startDate) {
    records = records.filter((r) => r.date >= startDate);
  }
  if (endDate) {
    records = records.filter((r) => r.date <= endDate);
  }

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const percentage = total > 0 ? (present / total) * 100 : 0;

  return {
    total,
    present,
    absent,
    percentage: Math.round(percentage * 100) / 100,
  };
}
