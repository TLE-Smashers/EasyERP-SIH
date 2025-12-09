/**
 * Google Sheets Integration for Faculty Leave Management
 * Handles CRUD operations for leave requests in Google Sheets
 */

"use server";

import { google } from "googleapis";
import { LeaveRequest, LeaveStatus, LeaveType, LeaveDuration, LeaveBalance } from "@/types/leave";

const LEAVE_SHEET_ID = process.env.NEXT_PUBLIC_LEAVE_SHEET_ID || process.env.GOOGLE_SHEETS_ID;
const LEAVE_SHEET_NAME = "LeaveRequests";
const BALANCE_SHEET_NAME = "LeaveBalance";

// Column mapping for Leave Requests sheet (A to V = 22 columns)
const LEAVE_COLUMNS = {
    ID: 0,                    // A
    FACULTY_ID: 1,            // B
    FACULTY_NAME: 2,          // C
    EMPLOYEE_ID: 3,           // D
    DEPARTMENT: 4,            // E
    LEAVE_TYPE: 5,            // F
    START_DATE: 6,            // G
    END_DATE: 7,              // H
    DURATION: 8,              // I
    TOTAL_DAYS: 9,            // J
    REASON: 10,               // K
    STATUS: 11,               // L
    APPLIED_ON: 12,           // M
    APPROVED_BY: 13,          // N
    APPROVED_ON: 14,          // O
    REJECTION_REASON: 15,     // P
    SUPPORTING_DOCUMENT: 16,  // Q
    TIMESTAMP: 17,            // R
};

// Column mapping for Leave Balance sheet (A to O = 15 columns)
const BALANCE_COLUMNS = {
    FACULTY_ID: 0,            // A
    EMPLOYEE_ID: 1,           // B
    ACADEMIC_YEAR: 2,         // C
    CASUAL_ALLOCATED: 3,      // D
    CASUAL_USED: 4,           // E
    CASUAL_REMAINING: 5,      // F
    SICK_ALLOCATED: 6,        // G
    SICK_USED: 7,             // H
    SICK_REMAINING: 8,        // I
    EARNED_ALLOCATED: 9,      // J
    EARNED_USED: 10,          // K
    EARNED_REMAINING: 11,     // L
    TOTAL_ALLOCATED: 12,      // M
    TOTAL_USED: 13,           // N
    TOTAL_REMAINING: 14,      // O
    LAST_UPDATED: 15,         // P
};

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        throw new Error("Google Sheets credentials are not configured. Please check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return sheets;
}

/**
 * Transform sheet row to LeaveRequest object
 */
function transformRowToLeaveRequest(row: any[], rowIndex: number): LeaveRequest {
    return {
        id: row[LEAVE_COLUMNS.ID] || "",
        facultyId: row[LEAVE_COLUMNS.FACULTY_ID] || "",
        facultyName: row[LEAVE_COLUMNS.FACULTY_NAME] || "",
        employeeId: row[LEAVE_COLUMNS.EMPLOYEE_ID] || "",
        department: row[LEAVE_COLUMNS.DEPARTMENT] || "",
        leaveType: (row[LEAVE_COLUMNS.LEAVE_TYPE] || "casual") as LeaveType,
        startDate: row[LEAVE_COLUMNS.START_DATE] || "",
        endDate: row[LEAVE_COLUMNS.END_DATE] || "",
        duration: (row[LEAVE_COLUMNS.DURATION] || "full_day") as LeaveDuration,
        totalDays: parseFloat(row[LEAVE_COLUMNS.TOTAL_DAYS] || "0"),
        reason: row[LEAVE_COLUMNS.REASON] || "",
        status: (row[LEAVE_COLUMNS.STATUS] || "pending") as LeaveStatus,
        appliedOn: row[LEAVE_COLUMNS.APPLIED_ON] || "",
        approvedBy: row[LEAVE_COLUMNS.APPROVED_BY] || undefined,
        approvedOn: row[LEAVE_COLUMNS.APPROVED_ON] || undefined,
        rejectionReason: row[LEAVE_COLUMNS.REJECTION_REASON] || undefined,
        supportingDocument: row[LEAVE_COLUMNS.SUPPORTING_DOCUMENT] || undefined,
        timestamp: row[LEAVE_COLUMNS.TIMESTAMP] || "",
        rowNumber: rowIndex + 2, // +2 because sheets are 1-indexed and row 1 is header
    };
}

/**
 * Transform LeaveRequest object to sheet row
 */
function transformLeaveRequestToRow(leave: Partial<LeaveRequest>): any[] {
    const row = new Array(Object.keys(LEAVE_COLUMNS).length).fill("");

    row[LEAVE_COLUMNS.ID] = leave.id || "";
    row[LEAVE_COLUMNS.FACULTY_ID] = leave.facultyId || "";
    row[LEAVE_COLUMNS.FACULTY_NAME] = leave.facultyName || "";
    row[LEAVE_COLUMNS.EMPLOYEE_ID] = leave.employeeId || "";
    row[LEAVE_COLUMNS.DEPARTMENT] = leave.department || "";
    row[LEAVE_COLUMNS.LEAVE_TYPE] = leave.leaveType || "";
    row[LEAVE_COLUMNS.START_DATE] = leave.startDate || "";
    row[LEAVE_COLUMNS.END_DATE] = leave.endDate || "";
    row[LEAVE_COLUMNS.DURATION] = leave.duration || "";
    row[LEAVE_COLUMNS.TOTAL_DAYS] = leave.totalDays?.toString() || "";
    row[LEAVE_COLUMNS.REASON] = leave.reason || "";
    row[LEAVE_COLUMNS.STATUS] = leave.status || "";
    row[LEAVE_COLUMNS.APPLIED_ON] = leave.appliedOn || "";
    row[LEAVE_COLUMNS.APPROVED_BY] = leave.approvedBy || "";
    row[LEAVE_COLUMNS.APPROVED_ON] = leave.approvedOn || "";
    row[LEAVE_COLUMNS.REJECTION_REASON] = leave.rejectionReason || "";
    row[LEAVE_COLUMNS.SUPPORTING_DOCUMENT] = leave.supportingDocument || "";
    row[LEAVE_COLUMNS.TIMESTAMP] = leave.timestamp || new Date().toISOString();

    return row;
}

/**
 * Fetch all leave requests
 */
export async function fetchAllLeaveRequests(): Promise<LeaveRequest[]> {
    try {
        if (!LEAVE_SHEET_ID) {
            console.error("LEAVE_SHEET_ID is not configured");
            return [];
        }

        const sheets = await getSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: LEAVE_SHEET_ID,
            range: `${LEAVE_SHEET_NAME}!A2:R`, // Skip header row
        });

        const rows = response.data.values || [];
        return rows.map((row, index) => transformRowToLeaveRequest(row, index));
    } catch (error: any) {
        console.error("Error fetching leave requests:", error);
        if (error.message?.includes("Unable to parse range")) {
            console.error("Sheet 'LeaveRequests' does not exist. Please run setup script.");
        }
        return [];
    }
}

/**
 * Fetch leave requests by faculty ID
 */
export async function fetchLeaveRequestsByFaculty(facultyId: string): Promise<LeaveRequest[]> {
    const allRequests = await fetchAllLeaveRequests();
    return allRequests.filter(req => req.facultyId === facultyId);
}

/**
 * Fetch leave request by ID
 */
export async function fetchLeaveRequestById(leaveId: string): Promise<LeaveRequest | null> {
    const allRequests = await fetchAllLeaveRequests();
    return allRequests.find(req => req.id === leaveId) || null;
}

/**
 * Add new leave request
 */
export async function addLeaveRequest(leave: Partial<LeaveRequest>): Promise<void> {
    try {
        if (!LEAVE_SHEET_ID) {
            console.error("LEAVE_SHEET_ID is not configured");
            throw new Error("Leave management is not configured. Please contact administrator.");
        }

        const sheets = await getSheetsClient();

        // Generate unique ID
        const newLeave = {
            ...leave,
            id: `LV${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: "pending" as LeaveStatus,
        };

        const row = transformLeaveRequestToRow(newLeave);

        console.log("Adding leave request to sheet:", LEAVE_SHEET_ID);
        console.log("Leave data:", newLeave);

        await sheets.spreadsheets.values.append({
            spreadsheetId: LEAVE_SHEET_ID,
            range: `${LEAVE_SHEET_NAME}!A:R`,
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });

        console.log("Leave request added successfully");
    } catch (error: any) {
        console.error("Error adding leave request:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            status: error.status,
        });
        throw new Error(error.message || "Failed to add leave request");
    }
}

/**
 * Update leave request status (approve/reject)
 */
export async function updateLeaveStatus(
    leaveId: string,
    status: LeaveStatus,
    approvedBy?: string,
    rejectionReason?: string
): Promise<void> {
    try {
        const leave = await fetchLeaveRequestById(leaveId);
        if (!leave || !leave.rowNumber) {
            throw new Error("Leave request not found");
        }

        const sheets = await getSheetsClient();
        const updates: any = {
            status,
        };

        if (status === "approved") {
            updates.approvedBy = approvedBy;
            updates.approvedOn = new Date().toISOString();
        } else if (status === "rejected") {
            updates.rejectionReason = rejectionReason;
            updates.approvedBy = approvedBy;
        }

        const updatedLeave = { ...leave, ...updates };
        const row = transformLeaveRequestToRow(updatedLeave);

        await sheets.spreadsheets.values.update({
            spreadsheetId: LEAVE_SHEET_ID,
            range: `${LEAVE_SHEET_NAME}!A${leave.rowNumber}:R${leave.rowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });
    } catch (error) {
        console.error("Error updating leave status:", error);
        throw new Error("Failed to update leave status");
    }
}

/**
 * Cancel leave request
 */
export async function cancelLeaveRequest(leaveId: string): Promise<void> {
    await updateLeaveStatus(leaveId, "cancelled");
}

/**
 * Fetch leave balance for faculty
 */
/**
 * Fetch leave balance for faculty with real-time calculation
 */
export async function fetchLeaveBalance(facultyId: string, academicYear: string): Promise<LeaveBalance | null> {
    try {
        if (!LEAVE_SHEET_ID) {
            console.error("LEAVE_SHEET_ID is not configured");
            return null;
        }

        const sheets = await getSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: LEAVE_SHEET_ID,
            range: `${BALANCE_SHEET_NAME}!A2:P`,
        });

        const rows = response.data.values || [];
        const balanceRow = rows.find(row =>
            row[BALANCE_COLUMNS.FACULTY_ID] === facultyId &&
            row[BALANCE_COLUMNS.ACADEMIC_YEAR] === academicYear
        );

        if (!balanceRow) return null;

        // Fetch all approved leaves for this faculty
        const allLeaves = await fetchAllLeaveRequests();
        const approvedLeaves = allLeaves.filter(
            leave => leave.facultyId === facultyId && leave.status === "approved"
        );

        // Calculate used leaves by type
        const casualUsed = approvedLeaves
            .filter(leave => leave.leaveType === "casual")
            .reduce((sum, leave) => sum + leave.totalDays, 0);

        const sickUsed = approvedLeaves
            .filter(leave => leave.leaveType === "sick")
            .reduce((sum, leave) => sum + leave.totalDays, 0);

        // All other leave types (earned, maternity, paternity, compensatory, unpaid, other) count as earned leave
        const earnedUsed = approvedLeaves
            .filter(leave => leave.leaveType !== "casual" && leave.leaveType !== "sick")
            .reduce((sum, leave) => sum + leave.totalDays, 0);

        const casualAllocated = parseFloat(balanceRow[BALANCE_COLUMNS.CASUAL_ALLOCATED] || "0");
        const sickAllocated = parseFloat(balanceRow[BALANCE_COLUMNS.SICK_ALLOCATED] || "0");
        const earnedAllocated = parseFloat(balanceRow[BALANCE_COLUMNS.EARNED_ALLOCATED] || "0");

        const totalAllocated = casualAllocated + sickAllocated + earnedAllocated;
        const totalUsed = casualUsed + sickUsed + earnedUsed;
        const totalRemaining = totalAllocated - totalUsed;

        return {
            facultyId: balanceRow[BALANCE_COLUMNS.FACULTY_ID],
            employeeId: balanceRow[BALANCE_COLUMNS.EMPLOYEE_ID],
            academicYear: balanceRow[BALANCE_COLUMNS.ACADEMIC_YEAR],
            casualLeave: {
                allocated: casualAllocated,
                used: casualUsed,
                remaining: casualAllocated - casualUsed,
            },
            sickLeave: {
                allocated: sickAllocated,
                used: sickUsed,
                remaining: sickAllocated - sickUsed,
            },
            earnedLeave: {
                allocated: earnedAllocated,
                used: earnedUsed,
                remaining: earnedAllocated - earnedUsed,
            },
            totalAllocated,
            totalUsed,
            totalRemaining,
            lastUpdated: new Date().toISOString(),
        };
    } catch (error: any) {
        console.error("Error fetching leave balance:", error);
        if (error.message?.includes("Unable to parse range")) {
            console.error("Sheet 'LeaveBalance' may not exist or has incorrect structure. Please run setup script.");
        }
        return null;
    }
}

/**
 * Initialize leave balance for new faculty
 */
export async function initializeLeaveBalance(
    facultyId: string,
    employeeId: string,
    academicYear: string
): Promise<void> {
    try {
        const sheets = await getSheetsClient();

        // Default allocations (can be customized)
        const casualAllocated = 12;
        const sickAllocated = 12;
        const earnedAllocated = 15;
        const totalAllocated = casualAllocated + sickAllocated + earnedAllocated;

        const row = [
            facultyId,
            employeeId,
            academicYear,
            casualAllocated,
            0,
            casualAllocated,
            sickAllocated,
            0,
            sickAllocated,
            earnedAllocated,
            0,
            earnedAllocated,
            totalAllocated,
            0,
            totalAllocated,
            new Date().toISOString(),
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: LEAVE_SHEET_ID,
            range: `${BALANCE_SHEET_NAME}!A:P`,
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });
    } catch (error) {
        console.error("Error initializing leave balance:", error);
        throw new Error("Failed to initialize leave balance");
    }
}
