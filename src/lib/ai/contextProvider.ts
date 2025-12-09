/**
 * Context Provider for AI Chatbot
 * Fetches relevant data from Google Sheets based on user role and query intent
 */

import { google } from 'googleapis';
import type { UserRole } from '@/types/auth';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

interface ContextData {
  role: UserRole;
  userId: string;
  userName: string;
  data: Record<string, unknown>;
  summary: string;
}

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch student-specific context
 */
async function getStudentContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  // Helper function to safely fetch sheet data
  const fetchSheet = async (sheetName: string, filterField: string) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      
      const rows = response.data.values || [];
      if (rows.length > 1) {
        const headers = rows[0] as string[];
        const dataRows = rows.slice(1).filter((row: unknown[]) => {
          const rowData = row as string[];
          return rowData[headers.indexOf(filterField)] === userId || 
                 rowData[headers.indexOf('email')] === userId ||
                 rowData[headers.indexOf('studentEmail')] === userId;
        });
        return dataRows;
      }
      return [];
    } catch (err) {
      console.warn(`Sheet ${sheetName} not found or empty:`, err);
      return [];
    }
  };
  
  try {
    // Fetch all student data with proper error handling
    data.attendance = await fetchSheet('FacultyAttendance', 'studentId');
    data.marks = await fetchSheet('Marks', 'studentId');
    data.library = await fetchSheet('Library_Issues', 'studentId');
    data.fees = await fetchSheet('Payments', 'studentId');
    data.hostel = await fetchSheet('HostelAllocation', 'studentId');
    
  } catch (error) {
    console.error('Error fetching student context:', error);
  }
  
  // Generate summary
  const summary = generateStudentSummary(data, userName);
  
  return {
    role: 'student',
    userId,
    userName,
    data,
    summary,
  };
}

/**
 * Fetch faculty-specific context
 */
async function getFacultyContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  // Helper to safely fetch sheets
  const fetchSheet = async (sheetName: string) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      console.warn(`Sheet ${sheetName} not found:`, err);
      return [];
    }
  };
  
  try {
    // Fetch ALL attendance records (full context for faculty)
    data.allAttendance = await fetchSheet('FacultyAttendance');
    
    // Fetch faculty's own attendance records
    const attendanceRows = data.allAttendance as unknown[][];
    if (attendanceRows.length > 1) {
      const headers = attendanceRows[0] as string[];
      const facultyAttendance = attendanceRows.slice(1).filter((row: unknown[]) => {
        const rowData = row as string[];
        return rowData[headers.indexOf('facultyId')] === userId ||
               rowData[headers.indexOf('markedBy')] === userId;
      });
      data.myAttendance = facultyAttendance;
    }
    
    // Fetch ALL marks (full context)
    data.allMarks = await fetchSheet('Marks');
    
    // Fetch faculty's uploaded marks
    const marksRows = data.allMarks as unknown[][];
    if (marksRows.length > 1) {
      const headers = marksRows[0] as string[];
      const facultyMarks = marksRows.slice(1).filter((row: unknown[]) => {
        const rowData = row as string[];
        return rowData[headers.indexOf('facultyId')] === userId ||
               rowData[headers.indexOf('uploadedBy')] === userId;
      });
      data.myMarks = facultyMarks;
    }
    
    // Fetch ALL students info (full context)
    data.students = await fetchSheet('Students');
    
    // Fetch faculty list for reference
    data.faculty = await fetchSheet('Faculty');
    
    // Fetch leave requests (if exists)
    data.leaveRequests = await fetchSheet('LeaveRequests');
    
    // Fetch timetable/schedule (if exists)
    data.timetable = await fetchSheet('Timetable');
    
  } catch (error) {
    console.error('Error fetching faculty context:', error);
  }
  
  const summary = generateFacultySummary(data, userName);
  
  return {
    role: 'faculty',
    userId,
    userName,
    data,
    summary,
  };
}

/**
 * Fetch admission officer context
 */
async function getAdmissionContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  // Helper to safely fetch sheets
  const fetchSheet = async (sheetName: string) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      console.warn(`Sheet ${sheetName} not found:`, err);
      return [];
    }
  };
  
  try {
    // Fetch ALL admissions (full context)
    data.admissions = await fetchSheet('Admissions');
    
    // Fetch ALL students (for admitted students)
    data.students = await fetchSheet('Students');
    
    // Fetch admission applications (if exists)
    data.applications = await fetchSheet('AdmissionApplications');
    
    // Fetch admission documents (if exists)
    data.documents = await fetchSheet('AdmissionDocuments');
    
    // Fetch admission payments (if exists)
    data.admissionPayments = await fetchSheet('AdmissionPayments');
    
    // Fetch course/branch details
    data.courses = await fetchSheet('Courses');
    
    // Fetch admission criteria/cutoffs (if exists)
    data.criteria = await fetchSheet('AdmissionCriteria');
    
  } catch (error) {
    console.error('Error fetching admission context:', error);
  }
  
  const summary = generateAdmissionSummary(data, userName);
  
  return {
    role: 'admission',
    userId,
    userName,
    data,
    summary,
  };
}

/**
 * Fetch librarian context
 */
async function getLibrarianContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  // Helper to safely fetch sheets
  const fetchSheet = async (sheetName: string) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      console.warn(`Sheet ${sheetName} not found:`, err);
      return [];
    }
  };
  
  try {
    // Fetch ALL library books (full catalog)
    data.books = await fetchSheet('Library_Books');
    
    // Fetch ALL book issues (full context)
    data.issues = await fetchSheet('Library_Issues');
    
    // Fetch ALL library requests (full context)
    data.requests = await fetchSheet('Library_Requests');
    
    // Fetch library resources/e-books (if exists)
    data.resources = await fetchSheet('LibraryResources');
    
    // Fetch students for reference
    data.students = await fetchSheet('Students');
    
    // Fetch faculty for reference
    data.faculty = await fetchSheet('Faculty');
    
    // Fetch library members (if exists)
    data.members = await fetchSheet('LibraryMembers');
    
    // Fetch library fines (if exists)
    data.fines = await fetchSheet('LibraryFines');
    
  } catch (error) {
    console.error('Error fetching librarian context:', error);
  }
  
  const summary = generateLibrarianSummary(data, userName);
  
  return {
    role: 'librarian',
    userId,
    userName,
    data,
    summary,
  };
}

/**
 * Fetch accountant context
 */
async function getAccountantContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  // Helper to safely fetch sheets
  const fetchSheet = async (sheetName: string) => {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`,
      });
      return response.data.values || [];
    } catch (err) {
      console.warn(`Sheet ${sheetName} not found:`, err);
      return [];
    }
  };
  
  try {
    // Fetch ALL payments (full context)
    data.payments = await fetchSheet('Payments');
    
    // Fetch ALL students (for fee tracking)
    data.students = await fetchSheet('Students');
    
    // Fetch admission payments
    data.admissionPayments = await fetchSheet('AdmissionPayments');
    
    // Fetch fee structure (if exists)
    data.feeStructure = await fetchSheet('FeeStructure');
    
    // Fetch hostel fees (if exists)
    data.hostelFees = await fetchSheet('HostelFees');
    
    // Fetch library fines (if exists)
    data.libraryFines = await fetchSheet('LibraryFines');
    
    // Fetch pending dues (if exists)
    data.pendingDues = await fetchSheet('PendingDues');
    
    // Fetch scholarships (if exists)
    data.scholarships = await fetchSheet('Scholarships');
    
    // Fetch refunds (if exists)
    data.refunds = await fetchSheet('Refunds');
    
  } catch (error) {
    console.error('Error fetching accountant context:', error);
  }
  
  const summary = generateAccountantSummary(data, userName);
  
  return {
    role: 'accountant',
    userId,
    userName,
    data,
    summary,
  };
}

/**
 * Main function to get context based on role
 */
export async function getContextForUser(
  role: UserRole,
  userId: string,
  userName: string
): Promise<ContextData> {
  console.log(`Fetching context for ${role} user: ${userName} (${userId})`);
  
  try {
    switch (role) {
      case 'student':
        return await getStudentContext(userId, userName);
      case 'faculty':
        return await getFacultyContext(userId, userName);
      case 'admission':
        return await getAdmissionContext(userId, userName);
      case 'librarian':
        return await getLibrarianContext(userId, userName);
      case 'accountant':
        return await getAccountantContext(userId, userName);
      case 'admin':
        // Admin gets comprehensive view - fetch all contexts
        return await getAdminContext(userId, userName);
      default:
        console.warn(`Unknown role: ${role}, using default context`);
        return {
          role,
          userId,
          userName,
          data: {},
          summary: `Hello ${userName}, I'm here to help you with ERP queries.`,
        };
    }
  } catch (error) {
    console.error(`Error fetching context for ${role}:`, error);
    // Return fallback context instead of throwing
    return {
      role,
      userId,
      userName,
      data: {},
      summary: `Hello ${userName}, I'm having trouble accessing your data right now, but I can still help with general questions.`,
    };
  }
}

/**
 * Admin context (comprehensive)
 */
async function getAdminContext(userId: string, userName: string): Promise<ContextData> {
  const sheets = await getSheetsClient();
  const data: Record<string, unknown> = {};
  
  try {
    // Fetch summary data from all sheets
    const [students, faculty, admissions, payments] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Faculty!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Admissions!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Payments!A:Z' }),
    ]);
    
    data.students = students.data.values || [];
    data.faculty = faculty.data.values || [];
    data.admissions = admissions.data.values || [];
    data.payments = payments.data.values || [];
  } catch (error) {
    console.error('Error fetching admin context:', error);
  }
  
  const summary = `Hello ${userName} (Admin), you have access to all system data and can query about students, faculty, admissions, payments, library, hostel, and more.`;
  
  return {
    role: 'admin',
    userId,
    userName,
    data,
    summary,
  };
}

// Summary generators
function generateStudentSummary(data: Record<string, unknown>, userName: string): string {
  let summary = `Hello ${userName}, here's your current status:\n\n`;
  
  if (Array.isArray(data.attendance) && data.attendance.length > 0) {
    summary += `Attendance Records: ${data.attendance.length} entries found\n`;
  }
  
  if (Array.isArray(data.marks) && data.marks.length > 0) {
    summary += `Marks: ${data.marks.length} assessments recorded\n`;
  }
  
  if (Array.isArray(data.library) && data.library.length > 0) {
    summary += `Library: ${data.library.length} books currently issued\n`;
  }
  
  if (Array.isArray(data.fees) && data.fees.length > 0) {
    summary += `Fee Records: ${data.fees.length} payment transactions\n`;
  }
  
  if (Array.isArray(data.hostel) && data.hostel.length > 0) {
    summary += `Hostel: Room allocated\n`;
  }
  
  return summary;
}

function generateFacultySummary(data: Record<string, unknown>, userName: string): string {
  let summary = `Hello ${userName} (Faculty), you have access to comprehensive faculty module data:\n\n`;
  
  const allAttendance = Array.isArray(data.allAttendance) ? data.allAttendance : [];
  const allMarks = Array.isArray(data.allMarks) ? data.allMarks : [];
  const students = Array.isArray(data.students) ? data.students : [];
  const myAttendance = Array.isArray(data.myAttendance) ? data.myAttendance : [];
  const myMarks = Array.isArray(data.myMarks) ? data.myMarks : [];
  
  summary += `- Full Attendance Database: ${allAttendance.length > 1 ? allAttendance.length - 1 : 0} total records\n`;
  summary += `- Your Attendance Records: ${myAttendance.length} records\n`;
  summary += `- Full Marks Database: ${allMarks.length > 1 ? allMarks.length - 1 : 0} total records\n`;
  summary += `- Your Uploaded Marks: ${myMarks.length} assessments\n`;
  summary += `- All Students: ${students.length > 1 ? students.length - 1 : 0} students\n`;
  summary += `\nYou can query about any student's attendance, marks, performance, or generate reports.`;
  
  return summary;
}

function generateAdmissionSummary(data: Record<string, unknown>, userName: string): string {
  const admissions = Array.isArray(data.admissions) ? data.admissions : [];
  const students = Array.isArray(data.students) ? data.students : [];
  const applications = Array.isArray(data.applications) ? data.applications : [];
  
  let summary = `Hello ${userName} (Admission Officer), you have access to comprehensive admission data:\n\n`;
  summary += `- Total Admissions: ${admissions.length > 1 ? admissions.length - 1 : 0} records\n`;
  summary += `- Total Students: ${students.length > 1 ? students.length - 1 : 0} students\n`;
  
  if (applications.length > 1) {
    summary += `- Applications: ${applications.length - 1} applications\n`;
  }
  
  summary += `\nYou can query about admissions, applications, student details, or generate reports.`;
  
  return summary;
}

function generateLibrarianSummary(data: Record<string, unknown>, userName: string): string {
  const books = Array.isArray(data.books) ? data.books : [];
  const issues = Array.isArray(data.issues) ? data.issues : [];
  const requests = Array.isArray(data.requests) ? data.requests : [];
  const resources = Array.isArray(data.resources) ? data.resources : [];
  const students = Array.isArray(data.students) ? data.students : [];
  
  let summary = `Hello ${userName} (Librarian), you have access to complete library system data:\n\n`;
  summary += `- Total Books: ${books.length > 1 ? books.length - 1 : 0} books in catalog\n`;
  summary += `- Active Issues: ${issues.length > 1 ? issues.length - 1 : 0} book issues\n`;
  summary += `- Pending Requests: ${requests.length > 1 ? requests.length - 1 : 0} requests\n`;
  
  if (resources.length > 1) {
    summary += `- E-Resources: ${resources.length - 1} digital resources\n`;
  }
  
  summary += `- Registered Users: ${students.length > 1 ? students.length - 1 : 0} members\n`;
  summary += `\nYou can query about book availability, overdue books, issue/return history, or generate reports.`;
  
  return summary;
}

function generateAccountantSummary(data: Record<string, unknown>, userName: string): string {
  const payments = Array.isArray(data.payments) ? data.payments : [];
  const students = Array.isArray(data.students) ? data.students : [];
  const admissionPayments = Array.isArray(data.admissionPayments) ? data.admissionPayments : [];
  const scholarships = Array.isArray(data.scholarships) ? data.scholarships : [];
  
  let summary = `Hello ${userName} (Accountant), you have access to complete financial data:\n\n`;
  summary += `- Total Payment Records: ${payments.length > 1 ? payments.length - 1 : 0} transactions\n`;
  summary += `- Total Students: ${students.length > 1 ? students.length - 1 : 0} students\n`;
  
  if (admissionPayments.length > 1) {
    summary += `- Admission Payments: ${admissionPayments.length - 1} records\n`;
  }
  
  if (scholarships.length > 1) {
    summary += `- Scholarships: ${scholarships.length - 1} records\n`;
  }
  
  summary += `\nYou can query about fee status, pending dues, payment history, collections, or generate financial reports.`;
  
  return summary;
}

/**
 * Format context data for AI prompt
 */
export function formatContextForAI(contextData: ContextData): string {
  let prompt = `You are an AI assistant for an Educational ERP System.\n\n`;
  prompt += `User Information:\n`;
  prompt += `- Name: ${contextData.userName}\n`;
  prompt += `- Role: ${contextData.role}\n`;
  prompt += `- User ID: ${contextData.userId}\n\n`;
  prompt += `${contextData.summary}\n\n`;
  prompt += `Available Data:\n`;
  prompt += JSON.stringify(contextData.data, null, 2);
  prompt += `\n\nInstructions:\n`;
  prompt += `- Answer questions accurately based on the provided data only\n`;
  prompt += `- Be concise and helpful\n`;
  prompt += `- Format numbers and dates clearly\n`;
  prompt += `- If data is not available, politely inform the user\n`;
  prompt += `- Use appropriate formatting (lists, tables when needed)\n`;
  
  return prompt;
}
