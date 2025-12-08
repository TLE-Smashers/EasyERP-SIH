/**
 * Google Sheets Integration for Faculty Attendance Management
 * Handles CRUD operations for attendance records in Google Sheets
 */

"use server";

import { google } from "googleapis";
import {
    FacultyAttendanceRecord,
    AttendanceStatus,
    AttendanceMethod,
    MonthlyAttendanceSummary
} from "@/types/attendance";

const ATTENDANCE_SHEET_ID = process.env.NEXT_PUBLIC_ATTENDANCE_SHEET_ID;
const ATTENDANCE_SHEET_NAME = "FacultyAttendance";

// Column mapping for Attendance sheet (A to Q = 17 columns)
const ATTENDANCE_COLUMNS = {
    ID: 0,                    // A
    FACULTY_ID: 1,            // B
    FACULTY_NAME: 2,          // C
    EMPLOYEE_ID: 3,           // D
    DEPARTMENT: 4,            // E
    DATE: 5,                  // F
    STATUS: 6,                // G
    CHECK_IN_TIME: 7,         // H
    CHECK_OUT_TIME: 8,        // I
    TOTAL_HOURS: 9,           // J
    REMARKS: 10,              // K
    MARKED_BY: 11,            // L
    METHOD: 12,               // M
    IS_LATE: 13,              // N
    LATE_BY_MINUTES: 14,      // O
    TIMESTAMP: 15,            // P
};

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return sheets;
}

/**
 * Transform sheet row to FacultyAttendanceRecord object
 */
function transformRowToAttendance(row: any[], rowIndex: number): FacultyAttendanceRecord {
    return {
        id: row[ATTENDANCE_COLUMNS.ID] || "",
        facultyId: row[ATTENDANCE_COLUMNS.FACULTY_ID] || "",
        facultyName: row[ATTENDANCE_COLUMNS.FACULTY_NAME] || "",
        employeeId: row[ATTENDANCE_COLUMNS.EMPLOYEE_ID] || "",
        department: row[ATTENDANCE_COLUMNS.DEPARTMENT] || "",
        date: row[ATTENDANCE_COLUMNS.DATE] || "",
        status: (row[ATTENDANCE_COLUMNS.STATUS] || "present") as AttendanceStatus,
        checkInTime: row[ATTENDANCE_COLUMNS.CHECK_IN_TIME] || undefined,
        checkOutTime: row[ATTENDANCE_COLUMNS.CHECK_OUT_TIME] || undefined,
        totalHours: row[ATTENDANCE_COLUMNS.TOTAL_HOURS] ? parseFloat(row[ATTENDANCE_COLUMNS.TOTAL_HOURS]) : undefined,
        remarks: row[ATTENDANCE_COLUMNS.REMARKS] || undefined,
        markedBy: row[ATTENDANCE_COLUMNS.MARKED_BY] || "",
        method: (row[ATTENDANCE_COLUMNS.METHOD] || "manual") as AttendanceMethod,
        isLate: row[ATTENDANCE_COLUMNS.IS_LATE] === "TRUE",
        lateByMinutes: row[ATTENDANCE_COLUMNS.LATE_BY_MINUTES] ? parseInt(row[ATTENDANCE_COLUMNS.LATE_BY_MINUTES]) : undefined,
        timestamp: row[ATTENDANCE_COLUMNS.TIMESTAMP] || "",
        rowNumber: rowIndex + 2,
    };
}

/**
 * Transform FacultyAttendanceRecord object to sheet row
 */
function transformAttendanceToRow(attendance: Partial<FacultyAttendanceRecord>): any[] {
    const row = new Array(Object.keys(ATTENDANCE_COLUMNS).length).fill("");

    row[ATTENDANCE_COLUMNS.ID] = attendance.id || "";
    row[ATTENDANCE_COLUMNS.FACULTY_ID] = attendance.facultyId || "";
    row[ATTENDANCE_COLUMNS.FACULTY_NAME] = attendance.facultyName || "";
    row[ATTENDANCE_COLUMNS.EMPLOYEE_ID] = attendance.employeeId || "";
    row[ATTENDANCE_COLUMNS.DEPARTMENT] = attendance.department || "";
    row[ATTENDANCE_COLUMNS.DATE] = attendance.date || "";
    row[ATTENDANCE_COLUMNS.STATUS] = attendance.status || "";
    row[ATTENDANCE_COLUMNS.CHECK_IN_TIME] = attendance.checkInTime || "";
    row[ATTENDANCE_COLUMNS.CHECK_OUT_TIME] = attendance.checkOutTime || "";
    row[ATTENDANCE_COLUMNS.TOTAL_HOURS] = attendance.totalHours?.toString() || "";
    row[ATTENDANCE_COLUMNS.REMARKS] = attendance.remarks || "";
    row[ATTENDANCE_COLUMNS.MARKED_BY] = attendance.markedBy || "";
    row[ATTENDANCE_COLUMNS.METHOD] = attendance.method || "";
    row[ATTENDANCE_COLUMNS.IS_LATE] = attendance.isLate ? "TRUE" : "FALSE";
    row[ATTENDANCE_COLUMNS.LATE_BY_MINUTES] = attendance.lateByMinutes?.toString() || "";
    row[ATTENDANCE_COLUMNS.TIMESTAMP] = attendance.timestamp || new Date().toISOString();

    return row;
}

/**
 * Fetch all attendance records
 */
export async function fetchAllAttendance(): Promise<FacultyAttendanceRecord[]> {
    try {
        const sheets = await getSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ATTENDANCE_SHEET_ID,
            range: `${ATTENDANCE_SHEET_NAME}!A2:P`,
        });

        const rows = response.data.values || [];
        return rows.map((row, index) => transformRowToAttendance(row, index));
    } catch (error) {
        console.error("Error fetching attendance:", error);
        throw new Error("Failed to fetch attendance records");
    }
}

/**
 * Fetch attendance by faculty ID
 */
export async function fetchAttendanceByFaculty(
    facultyId: string,
    startDate?: string,
    endDate?: string
): Promise<FacultyAttendanceRecord[]> {
    const allRecords = await fetchAllAttendance();
    let filtered = allRecords.filter(record => record.facultyId === facultyId);

    if (startDate) {
        filtered = filtered.filter(record => record.date >= startDate);
    }
    if (endDate) {
        filtered = filtered.filter(record => record.date <= endDate);
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Fetch attendance by date
 */
export async function fetchAttendanceByDate(date: string): Promise<FacultyAttendanceRecord[]> {
    const allRecords = await fetchAllAttendance();
    return allRecords.filter(record => record.date === date);
}

/**
 * Check if attendance exists for faculty on date
 */
export async function checkAttendanceExists(facultyId: string, date: string): Promise<boolean> {
    const records = await fetchAttendanceByDate(date);
    return records.some(record => record.facultyId === facultyId);
}

/**
 * Mark attendance for a faculty member
 */
export async function markAttendance(attendance: Partial<FacultyAttendanceRecord>): Promise<void> {
    try {
        const sheets = await getSheetsClient();

        // Check if attendance already exists
        const exists = await checkAttendanceExists(attendance.facultyId!, attendance.date!);
        if (exists) {
            throw new Error("Attendance already marked for this date");
        }

        const newAttendance = {
            ...attendance,
            id: `ATT${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        const row = transformAttendanceToRow(newAttendance);

        await sheets.spreadsheets.values.append({
            spreadsheetId: ATTENDANCE_SHEET_ID,
            range: `${ATTENDANCE_SHEET_NAME}!A:P`,
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });
    } catch (error) {
        console.error("Error marking attendance:", error);
        throw error;
    }
}

/**
 * Mark bulk attendance
 */
export async function markBulkAttendance(
    entries: Partial<FacultyAttendanceRecord>[]
): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
    };

    for (const entry of entries) {
        try {
            await markAttendance(entry);
            results.success++;
        } catch (error: any) {
            results.failed++;
            results.errors.push(`${entry.facultyName}: ${error.message}`);
        }
    }

    return results;
}

/**
 * Update attendance record
 */
export async function updateAttendance(
    attendanceId: string,
    updates: Partial<FacultyAttendanceRecord>
): Promise<void> {
    try {
        const allRecords = await fetchAllAttendance();
        const record = allRecords.find(r => r.id === attendanceId);

        if (!record || !record.rowNumber) {
            throw new Error("Attendance record not found");
        }

        const sheets = await getSheetsClient();
        const updatedRecord = { ...record, ...updates };
        const row = transformAttendanceToRow(updatedRecord);

        await sheets.spreadsheets.values.update({
            spreadsheetId: ATTENDANCE_SHEET_ID,
            range: `${ATTENDANCE_SHEET_NAME}!A${record.rowNumber}:P${record.rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });
    } catch (error) {
        console.error("Error updating attendance:", error);
        throw new Error("Failed to update attendance record");
    }
}

/**
 * Get monthly attendance summary for faculty
 */
export async function getMonthlyAttendanceSummary(
    facultyId: string,
    month: string // YYYY-MM format
): Promise<MonthlyAttendanceSummary | null> {
    try {
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;

        const records = await fetchAttendanceByFaculty(facultyId, startDate, endDate);

        if (records.length === 0) return null;

        const faculty = records[0];

        // Count different statuses
        const presentDays = records.filter(r => r.status === "present").length;
        const absentDays = records.filter(r => r.status === "absent").length;
        const leaveDays = records.filter(r => r.status === "on_leave").length;
        const halfDays = records.filter(r => r.status === "half_day").length;
        const lateDays = records.filter(r => r.isLate).length;
        const wfhDays = records.filter(r => r.status === "work_from_home").length;

        // Calculate working days (assuming 26 working days per month)
        const totalWorkingDays = 26;
        const attendancePercentage = (presentDays / totalWorkingDays) * 100;

        return {
            facultyId: faculty.facultyId,
            employeeId: faculty.employeeId,
            facultyName: faculty.facultyName,
            department: faculty.department,
            month,
            totalWorkingDays,
            presentDays,
            absentDays,
            leaveDays,
            halfDays,
            lateDays,
            wfhDays,
            attendancePercentage: Math.round(attendancePercentage * 100) / 100,
            records,
        };
    } catch (error) {
        console.error("Error getting monthly summary:", error);
        throw new Error("Failed to get monthly attendance summary");
    }
}

/**
 * Get attendance statistics for a date
 */
export async function getAttendanceStats(date: string) {
    try {
        const records = await fetchAttendanceByDate(date);

        const stats = {
            totalMarked: records.length,
            present: records.filter(r => r.status === "present").length,
            absent: records.filter(r => r.status === "absent").length,
            onLeave: records.filter(r => r.status === "on_leave").length,
            halfDay: records.filter(r => r.status === "half_day").length,
            late: records.filter(r => r.isLate).length,
            wfh: records.filter(r => r.status === "work_from_home").length,
        };

        return stats;
    } catch (error) {
        console.error("Error getting attendance stats:", error);
        throw new Error("Failed to get attendance statistics");
    }
}
