"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const EXAM_SCORES_SHEET_NAME = "Exam_Scores";

interface ExamScore {
  scoreId: string;
  studentId: string;
  enrollmentNumber: string;
  studentName: string;
  course: string;
  branch: string;
  currentYear: string;
  currentSemester: string;
  subjectCode: string;
  subjectName: string;
  examType: string;
  maxMarks: number;
  marksObtained: number;
  remarks: string;
  facultyId: string;
  facultyName: string;
  enteredDate: string;
  updatedDate: string;
  status: string;
  academicYear: string;
}

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  examType: string;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  remarks: string;
  facultyName: string;
  enteredDate: string;
}

interface ExamResults {
  examTypes: string[];
  results: {
    [examType: string]: SubjectResult[];
  };
  overallStats: {
    totalSubjects: number;
    averagePercentage: number;
  };
}

export type StudentExamResults = ExamResults;

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

function rowToExamScore(row: string[]): ExamScore {
  return {
    scoreId: row[0] || "",
    studentId: row[1] || "",
    enrollmentNumber: row[2] || "",
    studentName: row[3] || "",
    course: row[4] || "",
    branch: row[5] || "",
    currentYear: row[6] || "",
    currentSemester: row[7] || "",
    subjectCode: row[8] || "",
    subjectName: row[9] || "",
    examType: row[10] || "",
    maxMarks: parseFloat(row[11]) || 0,
    marksObtained: parseFloat(row[12]) || 0,
    remarks: row[13] || "",
    facultyId: row[14] || "",
    facultyName: row[15] || "",
    enteredDate: row[16] || "",
    updatedDate: row[17] || "",
    status: row[18] || "",
    academicYear: row[19] || "",
  };
}

export async function getStudentExamScores(email: string): Promise<{
  success: boolean;
  data?: ExamResults;
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

    // Get all exam scores for this student
    const scoresResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${EXAM_SCORES_SHEET_NAME}!A2:T`,
    });

    const rows = scoresResponse.data.values || [];
    const examScores = rows
      .map(rowToExamScore)
      .filter(
        (score) =>
          score.studentId === studentId ||
          score.enrollmentNumber === enrollmentNumber
      );

    // Group by exam type
    const examTypesSet = new Set<string>();
    const results: { [examType: string]: SubjectResult[] } = {};

    examScores.forEach((score) => {
      examTypesSet.add(score.examType);

      if (!results[score.examType]) {
        results[score.examType] = [];
      }

      const percentage = score.maxMarks > 0 
        ? (score.marksObtained / score.maxMarks) * 100 
        : 0;

      results[score.examType].push({
        subjectCode: score.subjectCode,
        subjectName: score.subjectName,
        examType: score.examType,
        maxMarks: score.maxMarks,
        marksObtained: score.marksObtained,
        percentage: Math.round(percentage * 100) / 100,
        remarks: score.remarks,
        facultyName: score.facultyName,
        enteredDate: score.enteredDate,
      });
    });

    // Sort exam types
    const examTypes = Array.from(examTypesSet).sort();

    // Calculate overall stats
    const totalSubjects = examScores.length;
    const totalPercentage = examScores.reduce((sum, score) => {
      const percentage = score.maxMarks > 0 
        ? (score.marksObtained / score.maxMarks) * 100 
        : 0;
      return sum + percentage;
    }, 0);
    const averagePercentage = totalSubjects > 0 
      ? Math.round((totalPercentage / totalSubjects) * 100) / 100 
      : 0;

    return {
      success: true,
      data: {
        examTypes,
        results,
        overallStats: {
          totalSubjects,
          averagePercentage,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching student exam scores:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch exam scores",
    };
  }
}
