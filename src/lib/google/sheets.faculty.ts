/**
 * Faculty Google Sheets Integration - Simplified Version
 * Matches the actual Faculty sheet structure (14 fields)
 */

import { google } from "googleapis";
import type { Faculty } from "@/types/faculty";
import type { FacultyFormValues } from "@/components/faculty/FacultyForm";

// Environment variable for Sheet ID
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || "";
const SHEET_NAME = "Faculty";
const RANGE = `${SHEET_NAME}!A:R`;

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentials) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
    }

    if (!SPREADSHEET_ID) {
        throw new Error("GOOGLE_SHEETS_ID environment variable is not set");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(credentials),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

/**
 * Column mapping for Faculty Sheet (18 columns)
 * Headers: facultyId, fullName, email, mobileNumber, gender, dateOfBirth, photoUrl,
 * designation, branch, joiningDate, assignedSubjects, assignedClasses, accessRole, status,
 * createdBy, createdDate, updatedBy, updatedDate
 */
const COLUMN_MAP = {
    facultyId: 0,        // A
    fullName: 1,         // B
    email: 2,            // C
    mobileNumber: 3,     // D
    gender: 4,           // E
    dateOfBirth: 5,      // F
    photoUrl: 6,         // G
    designation: 7,      // H
    branch: 8,           // I (Department)
    joiningDate: 9,      // J
    assignedSubjects: 10, // K
    assignedClasses: 11,  // L
    accessRole: 12,      // M
    status: 13,          // N
    createdBy: 14,       // O
    createdDate: 15,     // P
    updatedBy: 16,       // Q
    updatedDate: 17,     // R
};

/**
 * Transform sheet row to Faculty object
 */
function transformRowToFaculty(row: any[], rowIndex: number): Faculty {
    const gender = (row[COLUMN_MAP.gender] || "male").toString().toLowerCase();
    const genderValue = gender === "female" ? "female" : gender === "other" ? "other" : "male";

    return {
        id: row[COLUMN_MAP.facultyId] || `FAC${Date.now()}`,
        facultyId: row[COLUMN_MAP.facultyId] || `FAC${Date.now()}`,
        fullName: row[COLUMN_MAP.fullName] || "",
        email: row[COLUMN_MAP.email] || "",
        mobileNumber: row[COLUMN_MAP.mobileNumber] || "",
        gender: genderValue,
        dateOfBirth: row[COLUMN_MAP.dateOfBirth] || "",
        photoUrl: row[COLUMN_MAP.photoUrl] || "",
        designation: row[COLUMN_MAP.designation] || "",
        branch: row[COLUMN_MAP.branch] || "",
        joiningDate: row[COLUMN_MAP.joiningDate] || "",
        assignedSubjects: row[COLUMN_MAP.assignedSubjects] || "",
        assignedClasses: row[COLUMN_MAP.assignedClasses] || "",
        accessRole: row[COLUMN_MAP.accessRole] || "faculty",
        status: row[COLUMN_MAP.status] || "active",
        rowIndex,
    };
}

/**
 * Transform Faculty data to sheet row (18 columns)
 */
function transformFacultyToRow(faculty: FacultyFormValues, isNew: boolean = false): any[] {
    const row = new Array(18).fill("");
    const now = new Date().toISOString();

    row[COLUMN_MAP.facultyId] = faculty.facultyId || "";
    row[COLUMN_MAP.fullName] = faculty.fullName || "";
    row[COLUMN_MAP.email] = faculty.email || "";
    row[COLUMN_MAP.mobileNumber] = faculty.mobileNumber || "";
    row[COLUMN_MAP.gender] = faculty.gender || "male";
    row[COLUMN_MAP.dateOfBirth] = faculty.dateOfBirth || "";
    row[COLUMN_MAP.photoUrl] = faculty.photoUrl || "";
    row[COLUMN_MAP.designation] = faculty.designation || "";
    row[COLUMN_MAP.branch] = faculty.branch || "";
    row[COLUMN_MAP.joiningDate] = faculty.joiningDate || "";
    row[COLUMN_MAP.assignedSubjects] = faculty.assignedSubjects || "";
    row[COLUMN_MAP.assignedClasses] = faculty.assignedClasses || "";
    row[COLUMN_MAP.accessRole] = faculty.accessRole || "faculty";
    row[COLUMN_MAP.status] = faculty.status || "active";

    if (isNew) {
        row[COLUMN_MAP.createdBy] = "admin";
        row[COLUMN_MAP.createdDate] = now;
    }
    row[COLUMN_MAP.updatedBy] = "admin";
    row[COLUMN_MAP.updatedDate] = now;

    return row;
}

/**
 * Get all faculty members from Google Sheets
 */
export async function getAllFaculty(): Promise<Faculty[]> {
    try {
        if (!SPREADSHEET_ID) {
            console.error('[FACULTY SHEETS] GOOGLE_SHEETS_ID is not set in environment');
            throw new Error('GOOGLE_SHEETS_ID environment variable is required');
        }

        const sheets = await getSheetsClient();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return [];
        }

        // Skip header row (index 0)
        return rows.slice(1).map((row, index) => transformRowToFaculty(row, index + 2));
    } catch (error) {
        console.error("Error fetching faculty from Google Sheets:", error);
        throw new Error("Failed to fetch faculty data: " + (error as Error).message);
    }
}

/**
 * Get faculty by ID from Google Sheets
 */
export async function getFacultyById(facultyId: string): Promise<Faculty | null> {
    try {
        const allFaculty = await getAllFaculty();
        const found = allFaculty.find(f => f.facultyId === facultyId);
        return found || null;
    } catch (error) {
        console.error(`Error fetching faculty ${facultyId}:`, error);
        throw new Error("Failed to fetch faculty");
    }
}

/**
 * Check for duplicate faculty by name, email, and mobile number combination
 */
export async function checkDuplicateFaculty(
    fullName: string,
    email: string,
    mobileNumber: string,
    excludeFacultyId?: string
): Promise<Faculty | null> {
    try {
        const allFaculty = await getAllFaculty();

        const duplicate = allFaculty.find((faculty) => {
            // Skip if this is the same faculty being updated
            if (excludeFacultyId && faculty.facultyId === excludeFacultyId) {
                return false;
            }

            // Check if all three fields match
            const nameMatch = faculty.fullName.toLowerCase().trim() === fullName.toLowerCase().trim();
            const emailMatch = faculty.email.toLowerCase().trim() === email.toLowerCase().trim();
            const mobileMatch = faculty.mobileNumber.trim() === mobileNumber.trim();

            return nameMatch && emailMatch && mobileMatch;
        });

        return duplicate || null;
    } catch (error) {
        console.error("Error checking duplicate faculty:", error);
        throw new Error("Failed to check duplicate faculty");
    }
}

/**
 * Add new faculty to Google Sheets
 */
export async function addFacultyToSheet(facultyData: FacultyFormValues): Promise<Faculty> {
    try {
        const sheets = await getSheetsClient();

        // Transform faculty data to row format (mark as new)
        const row = transformFacultyToRow(facultyData, true);

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [row],
            },
        });

        // Return the created faculty object with proper types
        return {
            id: facultyData.facultyId,
            facultyId: facultyData.facultyId,
            fullName: facultyData.fullName,
            email: facultyData.email,
            mobileNumber: facultyData.mobileNumber,
            gender: facultyData.gender,
            dateOfBirth: facultyData.dateOfBirth,
            photoUrl: facultyData.photoUrl || "",
            designation: facultyData.designation,
            branch: facultyData.branch,
            joiningDate: facultyData.joiningDate,
            assignedSubjects: facultyData.assignedSubjects || "",
            assignedClasses: facultyData.assignedClasses || "",
            accessRole: facultyData.accessRole || "faculty",
            status: (facultyData.status || "active") as "active" | "inactive" | "on_leave",
            rowIndex: -1, // Will be set when fetching
        };
    } catch (error) {
        console.error("Error adding faculty to Google Sheets:", error);
        throw new Error("Failed to add faculty");
    }
}

/**
 * Update existing faculty in Google Sheets
 */
export async function updateFacultyInSheet(
    facultyId: string,
    updates: Partial<FacultyFormValues>
): Promise<Faculty> {
    try {
        const sheets = await getSheetsClient();

        // Find the faculty to get rowIndex
        const existingFaculty = await getFacultyById(facultyId);
        if (!existingFaculty) {
            throw new Error("Faculty not found");
        }

        // Merge updates with existing data
        const updatedFaculty = { ...existingFaculty, ...updates };
        const row = transformFacultyToRow(updatedFaculty as FacultyFormValues, false);

        // Update the specific row
        const updateRange = `${SHEET_NAME}!A${existingFaculty.rowIndex}:R${existingFaculty.rowIndex}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [row],
            },
        });

        return {
            ...updatedFaculty,
            status: updatedFaculty.status as "active" | "inactive" | "on_leave",
        };
    } catch (error) {
        console.error(`Error updating faculty ${facultyId}:`, error);
        throw new Error("Failed to update faculty");
    }
}

/**
 * Delete faculty from Google Sheets (soft delete - mark as inactive)
 */
export async function deleteFacultyFromSheet(facultyId: string): Promise<void> {
    try {
        await updateFacultyInSheet(facultyId, { status: "inactive" as const });
    } catch (error) {
        console.error(`Error deleting faculty ${facultyId}:`, error);
        throw new Error("Failed to delete faculty");
    }
}

/**
 * Add faculty to Users sheet for authentication
 */
export async function addFacultyToUsersSheet(
    facultyData: FacultyFormValues,
    hashedPassword: string
): Promise<void> {
    try {
        const sheets = await getSheetsClient();

        // Users sheet structure: timestamp, email, password, role, name, branch, status
        const userRow = [
            new Date().toISOString(),
            facultyData.email,
            hashedPassword,
            facultyData.accessRole,
            facultyData.fullName,
            facultyData.branch,
            facultyData.status,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Users!A:G",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [userRow],
            },
        });
    } catch (error) {
        console.error("Error adding faculty to Users sheet:", error);
        throw new Error("Failed to add faculty user");
    }
}
