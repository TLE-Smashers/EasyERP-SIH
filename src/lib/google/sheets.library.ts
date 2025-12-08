/**
 * Google Sheets - Library Module Helper
 * Handles all Sheet operations for library management system
 */

import { google } from "googleapis";
import {
  Book,
  BookRequest,
  IssuedBook,
  NotifyRequest,
  BookUpdateData,
  RequestUpdateData,
  IssueUpdateData,
  BookCategory,
  RequestStatus,
  IssueStatus,
} from "@/types/library";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const BOOKS_SHEET_NAME = "Library_Books";
const REQUESTS_SHEET_NAME = "Library_Requests";
const ISSUES_SHEET_NAME = "Library_Issues";
const NOTIFY_SHEET_NAME = "Library_Notify";

/**
 * Column Mappings for Books Sheet
 */
const BOOKS_COLUMN_MAP = {
  bookId: 'A',
  isbn: 'B',
  title: 'C',
  author: 'D',
  publisher: 'E',
  publicationYear: 'F',
  edition: 'G',
  category: 'H',
  subject: 'I',
  language: 'J',
  rackNumber: 'K',
  totalCopies: 'L',
  availableCopies: 'M',
  addedDate: 'N',
  addedBy: 'O',
  lastUpdated: 'P',
  updatedBy: 'Q',
  description: 'R',
  coverImageUrl: 'S',
} as const;

const BOOKS_COLUMN_INDEX = {
  bookId: 0,
  isbn: 1,
  title: 2,
  author: 3,
  publisher: 4,
  publicationYear: 5,
  edition: 6,
  category: 7,
  subject: 8,
  language: 9,
  rackNumber: 10,
  totalCopies: 11,
  availableCopies: 12,
  addedDate: 13,
  addedBy: 14,
  lastUpdated: 15,
  updatedBy: 16,
  description: 17,
  coverImageUrl: 18,
} as const;

/**
 * Column Mappings for Requests Sheet
 */
const REQUESTS_COLUMN_MAP = {
  requestId: 'A',
  requestDate: 'B',
  bookId: 'C',
  bookTitle: 'D',
  bookAuthor: 'E',
  studentId: 'F',
  studentName: 'G',
  email: 'H',
  rollNumber: 'I',
  course: 'J',
  branch: 'K',
  year: 'L',
  mobile: 'M',
  status: 'N',
  issueCode: 'O',
  codeGeneratedDate: 'P',
  codeExpiryDate: 'Q',
  processedBy: 'R',
  processedDate: 'S',
  rejectionReason: 'T',
  completedDate: 'U',
} as const;

const REQUESTS_COLUMN_INDEX = {
  requestId: 0,
  requestDate: 1,
  bookId: 2,
  bookTitle: 3,
  bookAuthor: 4,
  studentId: 5,
  studentName: 6,
  email: 7,
  rollNumber: 8,
  course: 9,
  branch: 10,
  year: 11,
  mobile: 12,
  status: 13,
  issueCode: 14,
  codeGeneratedDate: 15,
  codeExpiryDate: 16,
  processedBy: 17,
  processedDate: 18,
  rejectionReason: 19,
  completedDate: 20,
} as const;

/**
 * Column Mappings for Issues Sheet
 */
const ISSUES_COLUMN_MAP = {
  issueId: 'A',
  requestId: 'B',
  bookId: 'C',
  bookTitle: 'D',
  bookAuthor: 'E',
  isbn: 'F',
  studentId: 'G',
  studentName: 'H',
  email: 'I',
  rollNumber: 'J',
  course: 'K',
  branch: 'L',
  year: 'M',
  mobile: 'N',
  issueDate: 'O',
  dueDate: 'P',
  returnDate: 'Q',
  status: 'R',
  daysOverdue: 'S',
  fineAmount: 'T',
  finePaid: 'U',
  finePaymentDate: 'V',
  finePaymentReference: 'W',
  issuedBy: 'X',
  returnedBy: 'Y',
  issueNotes: 'Z',
  returnNotes: 'AA',
  condition: 'AB',
} as const;

const ISSUES_COLUMN_INDEX = {
  issueId: 0,
  requestId: 1,
  bookId: 2,
  bookTitle: 3,
  bookAuthor: 4,
  isbn: 5,
  studentId: 6,
  studentName: 7,
  email: 8,
  rollNumber: 9,
  course: 10,
  branch: 11,
  year: 12,
  mobile: 13,
  issueDate: 14,
  dueDate: 15,
  returnDate: 16,
  status: 17,
  daysOverdue: 18,
  fineAmount: 19,
  finePaid: 20,
  finePaymentDate: 21,
  finePaymentReference: 22,
  issuedBy: 23,
  returnedBy: 24,
  issueNotes: 25,
  returnNotes: 26,
  condition: 27,
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

// ============================================================================
// BOOKS OPERATIONS
// ============================================================================

/**
 * Parse row data into Book object
 */
function parseBookFromRow(row: any[], rowNumber: number): Book {
  const get = (field: keyof typeof BOOKS_COLUMN_INDEX) => row[BOOKS_COLUMN_INDEX[field]] || "";
  const getNum = (field: keyof typeof BOOKS_COLUMN_INDEX) => {
    const val = row[BOOKS_COLUMN_INDEX[field]];
    return val ? parseInt(val) : 0;
  };

  return {
    bookId: get('bookId'),
    isbn: get('isbn'),
    title: get('title'),
    author: get('author'),
    publisher: get('publisher'),
    publicationYear: get('publicationYear'),
    edition: get('edition'),
    category: get('category') as BookCategory,
    subject: get('subject'),
    language: get('language'),
    rackNumber: get('rackNumber'),
    totalCopies: getNum('totalCopies'),
    availableCopies: getNum('availableCopies'),
    addedDate: get('addedDate'),
    addedBy: get('addedBy'),
    lastUpdated: get('lastUpdated') || undefined,
    updatedBy: get('updatedBy') || undefined,
    description: get('description') || undefined,
    coverImageUrl: get('coverImageUrl') || undefined,
    rowNumber,
  };
}

/**
 * Fetch all books
 */
export async function fetchAllBooks(): Promise<Book[]> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BOOKS_SHEET_NAME}!A2:S`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => parseBookFromRow(row, index + 2));
  } catch (error) {
    console.error("Error fetching books:", error);
    throw new Error("Failed to fetch books from Google Sheets");
  }
}

/**
 * Fetch book by ID
 */
export async function fetchBookById(bookId: string): Promise<Book | null> {
  const books = await fetchAllBooks();
  return books.find(book => book.bookId === bookId) || null;
}

/**
 * Add new book
 */
export async function addBook(book: Omit<Book, 'bookId' | 'rowNumber'>): Promise<string> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Generate book ID
    const allBooks = await fetchAllBooks();
    const bookId = `BOOK-${String(allBooks.length + 1).padStart(3, '0')}`;

    const row = [
      bookId,
      book.isbn,
      book.title,
      book.author,
      book.publisher,
      book.publicationYear,
      book.edition,
      book.category,
      book.subject,
      book.language,
      book.rackNumber,
      book.totalCopies.toString(),
      book.availableCopies.toString(),
      book.addedDate,
      book.addedBy,
      book.lastUpdated || '',
      book.updatedBy || '',
      book.description || '',
      book.coverImageUrl || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BOOKS_SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return bookId;
  } catch (error) {
    console.error("Error adding book:", error);
    throw new Error("Failed to add book to Google Sheets");
  }
}

/**
 * Update book
 */
export async function updateBook(rowNumber: number, updates: BookUpdateData): Promise<void> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const updateRequests: any[] = [];

    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined && field in BOOKS_COLUMN_MAP) {
        const column = BOOKS_COLUMN_MAP[field as keyof typeof BOOKS_COLUMN_MAP];
        updateRequests.push({
          range: `${BOOKS_SHEET_NAME}!${column}${rowNumber}`,
          values: [[value]],
        });
      }
    }

    if (updateRequests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updateRequests,
        },
      });
    }
  } catch (error) {
    console.error("Error updating book:", error);
    throw new Error("Failed to update book in Google Sheets");
  }
}

/**
 * Delete book (soft delete by setting availableCopies to 0)
 */
export async function deleteBook(rowNumber: number): Promise<void> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Delete the row by using batchUpdate with deleteDimension
    // rowNumber is 1-based (e.g., row 2 for first data row)
    // Google Sheets API uses 0-based index, so subtract 1
    const sheetId = await getSheetIdByName(BOOKS_SHEET_NAME, sheets, SPREADSHEET_ID!);
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1, // Convert to 0-based index
                endIndex: rowNumber, // endIndex is exclusive
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    throw new Error("Failed to delete book from Google Sheets");
  }
}

/**
 * Helper function to get sheet ID by name
 */
async function getSheetIdByName(sheetName: string, sheets: any, spreadsheetId: string): Promise<number> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    
    const sheet = response.data.sheets?.find(
      (s: any) => s.properties?.title === sheetName
    );
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    return sheet.properties.sheetId;
  } catch (error) {
    console.error("Error getting sheet ID:", error);
    throw new Error("Failed to get sheet ID");
  }
}

// ============================================================================
// REQUESTS OPERATIONS
// ============================================================================

/**
 * Parse row data into BookRequest object
 */
function parseRequestFromRow(row: any[], rowNumber: number): BookRequest {
  const get = (field: keyof typeof REQUESTS_COLUMN_INDEX) => row[REQUESTS_COLUMN_INDEX[field]] || "";

  return {
    requestId: get('requestId'),
    requestDate: get('requestDate'),
    bookId: get('bookId'),
    bookTitle: get('bookTitle'),
    bookAuthor: get('bookAuthor'),
    studentId: get('studentId'),
    studentName: get('studentName'),
    email: get('email'),
    rollNumber: get('rollNumber') || undefined,
    course: get('course'),
    branch: get('branch'),
    year: get('year'),
    mobile: get('mobile'),
    status: get('status') as RequestStatus,
    issueCode: get('issueCode') || undefined,
    codeGeneratedDate: get('codeGeneratedDate') || undefined,
    codeExpiryDate: get('codeExpiryDate') || undefined,
    processedBy: get('processedBy') || undefined,
    processedDate: get('processedDate') || undefined,
    rejectionReason: get('rejectionReason') || undefined,
    completedDate: get('completedDate') || undefined,
    rowNumber,
  };
}

/**
 * Fetch all requests
 */
export async function fetchAllRequests(): Promise<BookRequest[]> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${REQUESTS_SHEET_NAME}!A2:U`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => parseRequestFromRow(row, index + 2));
  } catch (error) {
    console.error("Error fetching requests:", error);
    throw new Error("Failed to fetch requests from Google Sheets");
  }
}

/**
 * Fetch request by ID
 */
export async function fetchRequestById(requestId: string): Promise<BookRequest | null> {
  const requests = await fetchAllRequests();
  return requests.find(req => req.requestId === requestId) || null;
}

/**
 * Add new request
 */
export async function addRequest(request: Omit<BookRequest, 'requestId' | 'rowNumber'>): Promise<string> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Generate request ID
    const allRequests = await fetchAllRequests();
    const requestId = `REQ-${String(allRequests.length + 1).padStart(4, '0')}`;

    const row = [
      requestId,
      request.requestDate,
      request.bookId,
      request.bookTitle,
      request.bookAuthor,
      request.studentId,
      request.studentName,
      request.email,
      request.rollNumber || '',
      request.course,
      request.branch,
      request.year,
      request.mobile,
      request.status,
      request.issueCode || '',
      request.codeGeneratedDate || '',
      request.codeExpiryDate || '',
      request.processedBy || '',
      request.processedDate || '',
      request.rejectionReason || '',
      request.completedDate || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${REQUESTS_SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return requestId;
  } catch (error) {
    console.error("Error adding request:", error);
    throw new Error("Failed to add request to Google Sheets");
  }
}

/**
 * Update request
 */
export async function updateRequest(rowNumber: number, updates: RequestUpdateData): Promise<void> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const updateRequests: any[] = [];

    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined && field in REQUESTS_COLUMN_MAP) {
        const column = REQUESTS_COLUMN_MAP[field as keyof typeof REQUESTS_COLUMN_MAP];
        updateRequests.push({
          range: `${REQUESTS_SHEET_NAME}!${column}${rowNumber}`,
          values: [[value]],
        });
      }
    }

    if (updateRequests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updateRequests,
        },
      });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    throw new Error("Failed to update request in Google Sheets");
  }
}

// ============================================================================
// ISSUES OPERATIONS
// ============================================================================

/**
 * Parse row data into IssuedBook object
 */
function parseIssueFromRow(row: any[], rowNumber: number): IssuedBook {
  const get = (field: keyof typeof ISSUES_COLUMN_INDEX) => row[ISSUES_COLUMN_INDEX[field]] || "";
  const getNum = (field: keyof typeof ISSUES_COLUMN_INDEX) => {
    const val = row[ISSUES_COLUMN_INDEX[field]];
    return val ? parseFloat(val) : 0;
  };
  const getBool = (field: keyof typeof ISSUES_COLUMN_INDEX) => {
    const val = row[ISSUES_COLUMN_INDEX[field]];
    return val === "TRUE" || val === true;
  };

  return {
    issueId: get('issueId'),
    requestId: get('requestId'),
    bookId: get('bookId'),
    bookTitle: get('bookTitle'),
    bookAuthor: get('bookAuthor'),
    isbn: get('isbn'),
    studentId: get('studentId'),
    studentName: get('studentName'),
    email: get('email'),
    rollNumber: get('rollNumber') || undefined,
    course: get('course'),
    branch: get('branch'),
    year: get('year'),
    mobile: get('mobile'),
    issueDate: get('issueDate'),
    dueDate: get('dueDate'),
    returnDate: get('returnDate') || undefined,
    status: get('status') as IssueStatus,
    daysOverdue: getNum('daysOverdue'),
    fineAmount: getNum('fineAmount'),
    finePaid: getBool('finePaid'),
    finePaymentDate: get('finePaymentDate') || undefined,
    finePaymentReference: get('finePaymentReference') || undefined,
    issuedBy: get('issuedBy'),
    returnedBy: get('returnedBy') || undefined,
    issueNotes: get('issueNotes') || undefined,
    returnNotes: get('returnNotes') || undefined,
    condition: (get('condition') as any) || undefined,
    rowNumber,
  };
}

/**
 * Fetch all issued books
 */
export async function fetchAllIssues(): Promise<IssuedBook[]> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ISSUES_SHEET_NAME}!A2:AB`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => parseIssueFromRow(row, index + 2));
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw new Error("Failed to fetch issues from Google Sheets");
  }
}

/**
 * Fetch issue by ID
 */
export async function fetchIssueById(issueId: string): Promise<IssuedBook | null> {
  const issues = await fetchAllIssues();
  return issues.find(issue => issue.issueId === issueId) || null;
}

/**
 * Add new issue
 */
export async function addIssue(issue: Omit<IssuedBook, 'issueId' | 'rowNumber'>): Promise<string> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Generate issue ID
    const allIssues = await fetchAllIssues();
    const issueId = `ISS-${String(allIssues.length + 1).padStart(4, '0')}`;

    const row = [
      issueId,
      issue.requestId,
      issue.bookId,
      issue.bookTitle,
      issue.bookAuthor,
      issue.isbn,
      issue.studentId,
      issue.studentName,
      issue.email,
      issue.rollNumber || '',
      issue.course,
      issue.branch,
      issue.year,
      issue.mobile,
      issue.issueDate,
      issue.dueDate,
      issue.returnDate || '',
      issue.status,
      issue.daysOverdue.toString(),
      issue.fineAmount.toString(),
      issue.finePaid.toString(),
      issue.finePaymentDate || '',
      issue.finePaymentReference || '',
      issue.issuedBy,
      issue.returnedBy || '',
      issue.issueNotes || '',
      issue.returnNotes || '',
      issue.condition || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ISSUES_SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return issueId;
  } catch (error) {
    console.error("Error adding issue:", error);
    throw new Error("Failed to add issue to Google Sheets");
  }
}

/**
 * Update issue
 */
export async function updateIssue(rowNumber: number, updates: IssueUpdateData): Promise<void> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const updateRequests: any[] = [];

    for (const [field, value] of Object.entries(updates)) {
      if (value !== undefined && field in ISSUES_COLUMN_MAP) {
        const column = ISSUES_COLUMN_MAP[field as keyof typeof ISSUES_COLUMN_MAP];
        updateRequests.push({
          range: `${ISSUES_SHEET_NAME}!${column}${rowNumber}`,
          values: [[value]],
        });
      }
    }

    if (updateRequests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updateRequests,
        },
      });
    }
  } catch (error) {
    console.error("Error updating issue:", error);
    throw new Error("Failed to update issue in Google Sheets");
  }
}

// ============================================================================
// NOTIFY OPERATIONS
// ============================================================================

/**
 * Add notify request
 */
export async function addNotifyRequest(notify: Omit<NotifyRequest, 'notifyId' | 'rowNumber'>): Promise<string> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Generate notify ID
    const notifyId = `NOT-${Date.now()}`;

    const row = [
      notifyId,
      notify.bookId,
      notify.bookTitle,
      notify.studentId,
      notify.studentName,
      notify.email,
      notify.requestDate,
      notify.notified.toString(),
      notify.notifiedDate || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTIFY_SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return notifyId;
  } catch (error) {
    console.error("Error adding notify request:", error);
    throw new Error("Failed to add notify request to Google Sheets");
  }
}

/**
 * Fetch pending notify requests for a book
 */
export async function fetchPendingNotifyRequests(bookId: string): Promise<NotifyRequest[]> {
  try {
    const auth = await getAuthClient().getClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTIFY_SHEET_NAME}!A2:I`,
    });

    const rows = response.data.values || [];
    const notifyRequests = rows
      .map((row, index) => ({
        notifyId: row[0] || '',
        bookId: row[1] || '',
        bookTitle: row[2] || '',
        studentId: row[3] || '',
        studentName: row[4] || '',
        email: row[5] || '',
        requestDate: row[6] || '',
        notified: row[7] === 'TRUE' || row[7] === true,
        notifiedDate: row[8] || undefined,
        rowNumber: index + 2,
      }))
      .filter(req => req.bookId === bookId && !req.notified);

    return notifyRequests;
  } catch (error) {
    console.error("Error fetching notify requests:", error);
    return [];
  }
}
