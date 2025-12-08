/**
 * Google Sheets Integration for Student Table
 * Reads directly from the Student sheet
 */

"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const STUDENT_SHEET_NAME = "Student";

/**
 * Student interface for the Student sheet
 */
export interface StudentRecord {
  id: string;
  enrollmentNumber: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  category: string;
  course: string;
  branch: string;
  admissionYear: string;
  admissionDate: string;
  currentYear: number;
  currentSemester: number;
  guardianName: string;
  photoUrl: string;
}

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
 * Fetch all students from Student sheet
 */
export async function fetchStudentsFromSheet(): Promise<StudentRecord[]> {
  try {
    console.log("Attempting to fetch students from Student sheet...");
    console.log("Spreadsheet ID:", SPREADSHEET_ID);
    console.log("Sheet Name:", STUDENT_SHEET_NAME);
    
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${STUDENT_SHEET_NAME}!A2:P`, // A-P columns (16 columns)
    });

    const rows = response.data.values || [];
    console.log(`Fetched ${rows.length} rows from Student sheet`);
    
    if (rows.length === 0) {
      console.warn("No data found in Student sheet");
      return [];
    }
    
    const students: StudentRecord[] = rows
      .map((row): StudentRecord | null => {
        // Skip rows with empty ID
        if (!row[0]) return null;

        return {
          id: row[0] || "",
          enrollmentNumber: row[1] || "",
          fullName: row[2] || "",
          gender: row[3] || "",
          dateOfBirth: row[4] || "",
          email: row[5] || "",
          mobileNumber: row[6] || "",
          category: row[7] || "",
          course: row[8] || "",
          branch: row[9] || "",
          admissionYear: row[10] || "",
          admissionDate: row[11] || "",
          currentYear: parseInt(row[12]) || 1,
          currentSemester: parseInt(row[13]) || 1,
          guardianName: row[14] || "",
          photoUrl: row[15] || "",
        };
      })
      .filter((student): student is StudentRecord => student !== null);

    console.log(`Processed ${students.length} valid students`);
    return students;
  } catch (error) {
    console.error("Error fetching students from sheet:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Fetch students filtered by branch
 */
export async function fetchStudentsByBranch(
  branch: string,
  year?: string
): Promise<StudentRecord[]> {
  try {
    console.log(`Fetching students for branch: ${branch}, year: ${year || 'all'}`);
    let students = await fetchStudentsFromSheet();
    console.log(`Total students fetched: ${students.length}`);

    // Filter by branch
    students = students.filter((student) => student.branch === branch);
    console.log(`Students in branch ${branch}: ${students.length}`);

    // Filter by year if provided
    if (year) {
      students = students.filter((student) => student.currentYear.toString() === year);
      console.log(`Students in year ${year}: ${students.length}`);
    }

    return students;
  } catch (error) {
    console.error("Error fetching students by branch:", error);
    throw error;
  }
}

/**
 * Get unique years and sections for a branch
 */
export async function getFiltersForBranch(branch: string) {
  try {
    const students = await fetchStudentsFromSheet();

    // Filter by branch
    const branchStudents = students.filter(
      (student) => student.branch === branch
    );

    // Get unique years
    const years = Array.from(
      new Set(branchStudents.map((s) => s.currentYear.toString()))
    ).sort();

    // Note: No sections in this sheet structure
    const sections: string[] = [];

    return { years, sections };
  } catch (error) {
    console.error("Error fetching filters:", error);
    throw new Error("Failed to fetch filters");
  }
}
