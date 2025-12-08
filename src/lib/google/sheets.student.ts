/**
 * Google Sheets Integration for Student Management
 * Handles CRUD operations for students in Google Sheets
 * Pulls data from Admissions sheet for completed applications
 */

"use server";

import { google } from "googleapis";
import type { Student, StudentFormData } from "@/types/student";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const ADMISSIONS_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Admissions";

/**
 * Column indices for Admissions sheet (0-indexed)
 */
const ADMISSION_COLUMN_INDEX = {
  timestamp: 0,
  fullName: 1,
  email: 2,
  mobileNumber: 3,
  dateOfBirth: 4,
  address: 5,
  guardianName: 6,
  guardianContact: 7,
  school10th: 8,
  board10th: 9,
  marks10th: 10,
  yearOfPassing10th: 11,
  school12th: 12,
  board12th: 13,
  marks12th: 14,
  yearOfPassing12th: 15,
  course: 16,
  branch: 17,
  marksheet10th: 18,
  marksheet12th: 19,
  entranceExamMarksheet: 20,
  allotmentLetter: 21,
  transferCertificate: 22,
  characterCertificate: 23,
  domicileCertificate: 24,
  casteCertificate: 25,
  idProof: 26,
  photo: 27,
  gapCertificate: 28,
  applicationStatus: 29,
  documentsVerified: 30,
  verifiedBy: 31,
  verifiedDate: 32,
  locked: 33,
  lockedBy: 34,
  lockedDate: 35,
  finalRemarks: 36,
} as const;

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
 * Calculate current year and semester based on admission date
 */
function calculateYearAndSemester(admissionDate: string): { year: number; semester: number } {
  try {
    const admission = new Date(admissionDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - admission.getFullYear()) * 12 + (now.getMonth() - admission.getMonth());
    
    // Assuming 6 months per semester
    const totalSemesters = Math.floor(monthsDiff / 6) + 1;
    const year = Math.min(Math.ceil(totalSemesters / 2), 4);
    const semester = Math.min(totalSemesters, 8);
    
    return { year, semester };
  } catch {
    return { year: 1, semester: 1 };
  }
}

/**
 * Generate batch string from admission date
 */
function generateBatch(admissionDate: string): string {
  try {
    const year = new Date(admissionDate).getFullYear();
    return `${year}-${year + 4}`;
  } catch {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 4}`;
  }
}

/**
 * Transform admission row to Student object
 */
function transformAdmissionToStudent(row: any[], rowIndex: number): Student | null {
  const get = (field: keyof typeof ADMISSION_COLUMN_INDEX) => row[ADMISSION_COLUMN_INDEX[field]] || "";
  
  // Only include completed admissions
  const status = get('applicationStatus').toLowerCase();
  if (status !== 'completed' && status !== 'paid') {
    return null;
  }

  const admissionDate = get('timestamp');
  const { year, semester } = calculateYearAndSemester(admissionDate);
  const batch = generateBatch(admissionDate);

  return {
    id: `APP-${rowIndex}`,
    personalInfo: {
      fullName: get('fullName'),
      email: get('email'),
      mobileNumber: get('mobileNumber'),
      dateOfBirth: get('dateOfBirth'),
      address: get('address'),
      guardianName: get('guardianName'),
      guardianContact: get('guardianContact'),
    },
    academicInfo: {
      studentId: `STU-${rowIndex.toString().padStart(4, '0')}`,
      rollNumber: undefined, // Can be assigned later
      course: get('course'),
      branch: get('branch'),
      year: year,
      semester: semester,
      batch: batch,
      section: undefined,
      admissionDate: admissionDate,
    },
    status: "active",
    createdAt: admissionDate,
    updatedAt: undefined,
    rowNumber: rowIndex + 1, // +1 for 1-indexed row numbers
  };
}

/**
 * Fetch all students from Admissions sheet (completed applications only)
 */
export async function fetchAllStudents(): Promise<Student[]> {
  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ADMISSIONS_SHEET_NAME}!A2:AK`, // Skip header row
    });

    const rows = response.data.values || [];
    const students: Student[] = [];

    rows.forEach((row, index) => {
      const student = transformAdmissionToStudent(row, index + 2); // +2 for header and 1-indexed
      if (student) {
        students.push(student);
      }
    });

    return students;
  } catch (error) {
    console.error("Error fetching students from admissions:", error);
    throw new Error("Failed to fetch students");
  }
}

/**
 * Fetch student by ID
 */
export async function fetchStudentById(id: string): Promise<Student | null> {
  const allStudents = await fetchAllStudents();
  return allStudents.find(student => student.id === id) || null;
}

/**
 * Get unique branches from all students
 */
export async function getUniqueBranches(): Promise<string[]> {
  const students = await fetchAllStudents();
  const branches = [...new Set(students.map(s => s.academicInfo.branch))];
  return branches.filter(Boolean).sort();
}

/**
 * Get unique years from all students
 */
export async function getUniqueYears(): Promise<number[]> {
  const students = await fetchAllStudents();
  const years = [...new Set(students.map(s => s.academicInfo.year))];
  return years.filter(Boolean).sort();
}

