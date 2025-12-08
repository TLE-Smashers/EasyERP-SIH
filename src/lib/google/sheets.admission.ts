/**
 * Google Sheets - Admission Module Helper
 * Handles all Sheet operations for admission applications using camelCase column names
 */

import { google } from "googleapis";
import { Application, ApplicationUpdateData } from "@/types/admission";
import { cache } from "@/lib/cache/simple-cache";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Admissions";

/**
 * Column name mapping (camelCase)
 * Maps field names to column letters for Google Sheets API
 */
const COLUMN_MAP = {
  // Metadata
  timestamp: 'A',
  
  // Personal Details
  fullName: 'B',
  email: 'C',
  mobileNumber: 'D',
  dateOfBirth: 'E',
  address: 'F',
  guardianName: 'G',
  guardianContact: 'H',
  
  // Academic Details - 10th
  school10th: 'I',
  board10th: 'J',
  marks10th: 'K',
  yearOfPassing10th: 'L',
  
  // Academic Details - 12th
  school12th: 'M',
  board12th: 'N',
  marks12th: 'O',
  yearOfPassing12th: 'P',
  
  // Course Selection
  course: 'Q',
  branch: 'R',
  
  // Document Links
  marksheet10th: 'S',
  marksheet12th: 'T',
  entranceExamMarksheet: 'U',
  allotmentLetter: 'V',
  transferCertificate: 'W',
  characterCertificate: 'X',
  domicileCertificate: 'Y',
  casteCertificate: 'Z',
  idProof: 'AA',
  photo: 'AB',
  gapCertificate: 'AC',
  
  // Application Status & Verification
  applicationStatus: 'AD',
  documentsVerified: 'AE',
  verifiedBy: 'AF',
  verifiedDate: 'AG',
  
  // Lock Status
  locked: 'AH',
  lockedBy: 'AI',
  lockedDate: 'AJ',
  
  // Completion
  finalRemarks: 'AK',
} as const;

/**
 * Column indices for array-based parsing (0-indexed)
 */
const COLUMN_INDEX = {
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
 * Get Google Sheets Auth Client
 */
function getAuthClient() {
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

  return auth;
}

/**
 * Parse row data into Application object using column indices
 */
function parseApplicationFromRow(row: any[], rowNumber: number): Application {
  const get = (field: keyof typeof COLUMN_INDEX) => row[COLUMN_INDEX[field]] || "";
  const getBool = (field: keyof typeof COLUMN_INDEX) => {
    const val = row[COLUMN_INDEX[field]];
    return val === "TRUE" || val === true;
  };

  return {
    id: `APP-${rowNumber}`,
    timestamp: get('timestamp'),
    rowNumber,
    
    personalDetails: {
      fullName: get('fullName'),
      email: get('email'),
      mobileNumber: get('mobileNumber'),
      dateOfBirth: get('dateOfBirth'),
      address: get('address'),
      guardianName: get('guardianName'),
      guardianContact: get('guardianContact'),
    },
    
    academicDetails: {
      school10th: get('school10th'),
      board10th: get('board10th'),
      marks10th: get('marks10th'),
      yearOfPassing10th: get('yearOfPassing10th'),
      school12th: get('school12th'),
      board12th: get('board12th'),
      marks12th: get('marks12th'),
      yearOfPassing12th: get('yearOfPassing12th'),
      course: get('course'),
      branch: get('branch'),
    },
    
    documentLinks: {
      marksheet10th: get('marksheet10th') || undefined,
      marksheet12th: get('marksheet12th') || undefined,
      entranceExamMarksheet: get('entranceExamMarksheet') || undefined,
      allotmentLetter: get('allotmentLetter') || undefined,
      transferCertificate: get('transferCertificate') || undefined,
      characterCertificate: get('characterCertificate') || undefined,
      domicile: get('domicileCertificate') || undefined,
      casteCertificate: get('casteCertificate') || undefined,
      idProof: get('idProof') || undefined,
      photo: get('photo') || undefined,
      gapCertificate: get('gapCertificate') || undefined,
    },
    
    applicationStatus: (get('applicationStatus') || "pending") as any,
    
    documentsVerified: getBool('documentsVerified'),
    verifiedBy: get('verifiedBy') || undefined,
    verificationDate: get('verifiedDate') || undefined,
    verificationNotes: undefined,
    
    completionDetails: {
      finalRemarks: get('finalRemarks') || undefined,
    },
    
    locked: getBool('locked'),
    lockedBy: get('lockedBy') || undefined,
    lockedDate: get('lockedDate') || undefined,
  };
}

/**
 * Fetch all applications from Google Sheet
 * Uses simple in-memory cache to prevent redundant API calls
 */
export async function fetchAllApplications(): Promise<Application[]> {
  const CACHE_KEY = 'admission_applications';
  const CACHE_TTL = 60000; // 60 seconds

  // Try to get from cache first
  const cachedData = cache.get<Application[]>(CACHE_KEY);
  if (cachedData) {
    console.log('✅ Using cached admission data');
    return cachedData;
  }

  // If not in cache, fetch from Google Sheets
  try {
    console.log('📡 Fetching from Google Sheets API');
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:AK`, // Skip header row, read up to column AK (37 columns)
    });

    const rows = response.data.values || [];
    const applications = rows.map((row, index) => parseApplicationFromRow(row, index + 2));
    
    // Store in cache
    cache.set(CACHE_KEY, applications, CACHE_TTL);
    console.log(`✅ Cached ${applications.length} applications`);
    
    return applications;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
}

/**
 * Fetch single application by row number
 */
export async function fetchApplicationByRow(rowNumber: number): Promise<Application | null> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error("SPREADSHEET_ID is not configured");
    }
    
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowNumber}:AK${rowNumber}`, // Read up to column AK
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log(`No data found for row ${rowNumber}`);
      return null;
    }
    
    return parseApplicationFromRow(rows[0], rowNumber);
  } catch (error: any) {
    console.error("Error fetching application from row:", rowNumber);
    console.error("Spreadsheet ID:", SPREADSHEET_ID);
    console.error("Sheet Name:", SHEET_NAME);
    console.error("Error details:", error.message || error);
    throw error;
  }
}

/**
 * Fetch application by ID (extracts row number from ID)
 */
export async function fetchApplicationById(id: string): Promise<Application | null> {
  // Handle undefined or null id
  if (!id || typeof id !== 'string') {
    console.error('Invalid application ID:', id);
    return null;
  }
  
  // Extract row number from ID (format: APP-2, APP-10, etc.)
  const rowNumber = parseInt(id.replace("APP-", ""));
  
  if (isNaN(rowNumber) || rowNumber < 2) {
    console.error('Invalid row number extracted from ID:', id);
    return null;
  }
  
  return fetchApplicationByRow(rowNumber);
}

/**
 * Update application data using column name mapping
 */
export async function updateApplication(
  rowNumber: number,
  data: ApplicationUpdateData
): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const updates: any[] = [];

    // Helper function to add update using column name
    const addUpdate = (field: keyof typeof COLUMN_MAP, value: any) => {
      const column = COLUMN_MAP[field];
      updates.push({ range: `${SHEET_NAME}!${column}${rowNumber}`, values: [[value]] });
    };

    // Personal Details
    if (data.personalDetails) {
      const pd = data.personalDetails;
      if (pd.fullName !== undefined) addUpdate('fullName', pd.fullName);
      if (pd.email !== undefined) addUpdate('email', pd.email);
      if (pd.mobileNumber !== undefined) addUpdate('mobileNumber', pd.mobileNumber);
      if (pd.dateOfBirth !== undefined) addUpdate('dateOfBirth', pd.dateOfBirth);
      if (pd.address !== undefined) addUpdate('address', pd.address);
      if (pd.guardianName !== undefined) addUpdate('guardianName', pd.guardianName);
      if (pd.guardianContact !== undefined) addUpdate('guardianContact', pd.guardianContact);
    }

    // Academic Details
    if (data.academicDetails) {
      const ad = data.academicDetails;
      if (ad.school10th !== undefined) addUpdate('school10th', ad.school10th);
      if (ad.board10th !== undefined) addUpdate('board10th', ad.board10th);
      if (ad.marks10th !== undefined) addUpdate('marks10th', ad.marks10th);
      if (ad.yearOfPassing10th !== undefined) addUpdate('yearOfPassing10th', ad.yearOfPassing10th);
      if (ad.school12th !== undefined) addUpdate('school12th', ad.school12th);
      if (ad.board12th !== undefined) addUpdate('board12th', ad.board12th);
      if (ad.marks12th !== undefined) addUpdate('marks12th', ad.marks12th);
      if (ad.yearOfPassing12th !== undefined) addUpdate('yearOfPassing12th', ad.yearOfPassing12th);
      if (ad.course !== undefined) addUpdate('course', ad.course);
      if (ad.branch !== undefined) addUpdate('branch', ad.branch);
    }

    // Application Status
    if (data.applicationStatus !== undefined) {
      addUpdate('applicationStatus', data.applicationStatus);
    }

    // Document Verification
    if (data.documentsVerified !== undefined) {
      addUpdate('documentsVerified', data.documentsVerified ? "TRUE" : "FALSE");
    }

    if (data.verifiedBy !== undefined) {
      addUpdate('verifiedBy', data.verifiedBy);
    }

    if (data.verificationDate !== undefined) {
      addUpdate('verifiedDate', data.verificationDate);
    }

    // Lock Status
    if (data.locked !== undefined) {
      addUpdate('locked', data.locked ? "TRUE" : "FALSE");
    }

    if (data.lockedBy !== undefined) {
      addUpdate('lockedBy', data.lockedBy);
    }

    if (data.lockedDate !== undefined) {
      addUpdate('lockedDate', data.lockedDate);
    }

    // Completion Details
    if (data.completionDetails) {
      const cd = data.completionDetails;
      if (cd.finalRemarks !== undefined) addUpdate('finalRemarks', cd.finalRemarks);
    }

    if (updates.length === 0) return;

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: "RAW",
      },
    });

    // Clear cache after update
    cache.clear('admission_applications');
    console.log('🗑️ Cache cleared after update');
  } catch (error) {
    console.error("Error updating application:", error);
    throw error;
  }
}
