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
  
  try {
    // Fetch attendance records managed by faculty
    const attendanceResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Attendance!A:Z',
    });
    
    const attendanceRows = attendanceResponse.data.values || [];
    if (attendanceRows.length > 1) {
      const headers = attendanceRows[0];
      const facultyAttendance = attendanceRows.slice(1).filter(row => 
        row[headers.indexOf('facultyId')] === userId ||
        row[headers.indexOf('markedBy')] === userId
      );
      data.attendance = facultyAttendance;
    }
    
    // Fetch marks uploaded by faculty
    const marksResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Marks!A:Z',
    });
    
    const marksRows = marksResponse.data.values || [];
    if (marksRows.length > 1) {
      const headers = marksRows[0];
      const facultyMarks = marksRows.slice(1).filter(row => 
        row[headers.indexOf('facultyId')] === userId ||
        row[headers.indexOf('uploadedBy')] === userId
      );
      data.marks = facultyMarks;
    }
    
    // Fetch students info
    const studentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Students!A:Z',
    });
    
    data.students = studentsResponse.data.values || [];
    
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
  
  try {
    const admissionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Admissions!A:Z',
    });
    
    data.admissions = admissionsResponse.data.values || [];
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
  
  try {
    // Fetch all books
    const booksResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Library_Books!A:Z',
    });
    
    data.books = booksResponse.data.values || [];
    
    // Fetch all issues
    const issuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Library_Issues!A:Z',
    });
    
    data.issues = issuesResponse.data.values || [];
    
    // Fetch requests
    const requestsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Library_Requests!A:Z',
    });
    
    data.requests = requestsResponse.data.values || [];
    
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
  
  try {
    const paymentsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Payments!A:Z',
    });
    
    data.payments = paymentsResponse.data.values || [];
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
  let summary = `Hello ${userName} (Faculty), here's your dashboard summary:\n\n`;
  
  if (Array.isArray(data.attendance) && data.attendance.length > 0) {
    summary += `Attendance: ${data.attendance.length} records managed\n`;
  }
  
  if (Array.isArray(data.marks) && data.marks.length > 0) {
    summary += `Marks: ${data.marks.length} assessments uploaded\n`;
  }
  
  return summary;
}

function generateAdmissionSummary(data: Record<string, unknown>, userName: string): string {
  const admissions = Array.isArray(data.admissions) ? data.admissions : [];
  const total = admissions.length > 1 ? admissions.length - 1 : 0;
  
  return `Hello ${userName} (Admission Officer), you have ${total} applications to manage.`;
}

function generateLibrarianSummary(data: Record<string, unknown>, userName: string): string {
  const books = Array.isArray(data.books) ? data.books : [];
  const issues = Array.isArray(data.issues) ? data.issues : [];
  const requests = Array.isArray(data.requests) ? data.requests : [];
  
  return `Hello ${userName} (Librarian), Library Status: ${books.length - 1 || 0} books, ${issues.length - 1 || 0} active issues, ${requests.length - 1 || 0} pending requests.`;
}

function generateAccountantSummary(data: Record<string, unknown>, userName: string): string {
  const payments = Array.isArray(data.payments) ? data.payments : [];
  
  return `Hello ${userName} (Accountant), you have ${payments.length - 1 || 0} payment records.`;
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
