/**
 * Google Sheets Integration for Exam Scores
 * Handles marks entry and retrieval
 */

"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = "Exam_Scores";

/**
 * Exam Score interface
 */
export interface ExamScore {
  scoreId: string;
  studentId: string;
  enrollmentNumber: string;
  studentName: string;
  course: string;
  branch: string;
  currentYear: number;
  currentSemester: number;
  subjectCode: string;
  subjectName: string;
  examType: "Mid-1" | "Mid-2" | "End-Sem" | "Practical";
  maxMarks: number;
  marksObtained: number;
  remarks: string;
  facultyId: string;
  facultyName: string;
  enteredDate: string;
  updatedDate: string;
  status: "Draft" | "Published";
  academicYear: string;
}

export interface ExamScoreInput {
  studentId: string;
  enrollmentNumber: string;
  studentName: string;
  course: string;
  branch: string;
  currentYear: number;
  currentSemester: number;
  subjectCode: string;
  subjectName: string;
  examType: "Mid-1" | "Mid-2" | "End-Sem" | "Practical";
  maxMarks: number;
  marksObtained: number;
  remarks?: string;
  facultyId: string;
  facultyName: string;
  academicYear: string;
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
 * Save exam scores (bulk insert)
 */
export async function saveExamScores(scores: ExamScoreInput[]): Promise<{ success: boolean; message: string }> {
  try {
    const sheets = await getSheetsClient();
    const timestamp = new Date().toISOString();

    // Prepare rows for insertion - ensure data starts from column A (index 0)
    const rows = scores.map((score) => {
      const scoreId = `SCR${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      return [
        scoreId,                    // Column A (0)
        score.studentId,            // Column B (1)
        score.enrollmentNumber,     // Column C (2)
        score.studentName,          // Column D (3)
        score.course,               // Column E (4)
        score.branch,               // Column F (5)
        score.currentYear,          // Column G (6)
        score.currentSemester,      // Column H (7)
        score.subjectCode,          // Column I (8)
        score.subjectName,          // Column J (9)
        score.examType,             // Column K (10)
        score.maxMarks,             // Column L (11)
        score.marksObtained,        // Column M (12)
        score.remarks || "",        // Column N (13)
        score.facultyId,            // Column O (14)
        score.facultyName,          // Column P (15)
        timestamp,                  // Column Q (16)
        timestamp,                  // Column R (17)
        "Published",                // Column S (18)
        score.academicYear,         // Column T (19)
      ];
    });

    // Get the next empty row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    });
    
    const existingRows = response.data.values || [];
    const nextRow = existingRows.length + 1; // +1 because sheets are 1-indexed

    // Use update instead of append to ensure data goes to column A
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${nextRow}:T${nextRow + rows.length - 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    return {
      success: true,
      message: `Successfully saved ${scores.length} exam score(s)`,
    };
  } catch (error) {
    console.error("[saveExamScores] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save exam scores",
    };
  }
}

/**
 * Fetch exam scores with filters
 */
export async function fetchExamScores(filters?: {
  branch?: string;
  year?: number;
  semester?: number;
  examType?: string;
  academicYear?: string;
}): Promise<ExamScore[]> {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:T`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Skip header row
    const dataRows = rows.slice(1);

    let scores: ExamScore[] = dataRows.map((row) => ({
      scoreId: row[0] || "",
      studentId: row[1] || "",
      enrollmentNumber: row[2] || "",
      studentName: row[3] || "",
      course: row[4] || "",
      branch: row[5] || "",
      currentYear: parseInt(row[6]) || 0,
      currentSemester: parseInt(row[7]) || 0,
      subjectCode: row[8] || "",
      subjectName: row[9] || "",
      examType: (row[10] || "Mid-1") as "Mid-1" | "Mid-2" | "End-Sem" | "Practical",
      maxMarks: parseInt(row[11]) || 0,
      marksObtained: parseFloat(row[12]) || 0,
      remarks: row[13] || "",
      facultyId: row[14] || "",
      facultyName: row[15] || "",
      enteredDate: row[16] || "",
      updatedDate: row[17] || "",
      status: (row[18] || "Published") as "Draft" | "Published",
      academicYear: row[19] || "",
    }));

    // Apply filters
    if (filters) {
      if (filters.branch) {
        scores = scores.filter((s) => s.branch === filters.branch);
      }
      if (filters.year) {
        scores = scores.filter((s) => s.currentYear === filters.year);
      }
      if (filters.semester) {
        scores = scores.filter((s) => s.currentSemester === filters.semester);
      }
      if (filters.examType) {
        scores = scores.filter((s) => s.examType === filters.examType);
      }
      if (filters.academicYear) {
        scores = scores.filter((s) => s.academicYear === filters.academicYear);
      }
    }

    return scores;
  } catch (error) {
    console.error("[fetchExamScores] Error:", error);
    return [];
  }
}

/**
 * Check if scores already exist for given criteria
 */
export async function checkExistingScores(
  branch: string,
  year: number,
  semester: number,
  examType: string,
  subjectCode: string,
  academicYear: string
): Promise<boolean> {
  try {
    const scores = await fetchExamScores({
      branch,
      year,
      semester,
      examType,
      academicYear,
    });

    return scores.some((s) => s.subjectCode === subjectCode);
  } catch (error) {
    console.error("[checkExistingScores] Error:", error);
    return false;
  }
}
