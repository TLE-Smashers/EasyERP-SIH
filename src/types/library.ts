/**
 * Library Module Type Definitions
 * Defines data structures for the library management system
 */

// Book Status
export type BookStatus = 'available' | 'issued' | 'maintenance' | 'lost';

// Constants for Book Status
export const BOOK_STATUS = {
  AVAILABLE: 'available' as const,
  ISSUED: 'issued' as const,
  MAINTENANCE: 'maintenance' as const,
  LOST: 'lost' as const,
};

// Request Status
export type RequestStatus = 
  | 'pending'           // Request submitted, waiting for approval
  | 'approved'          // Code generated, waiting for student to collect
  | 'rejected'          // Request denied
  | 'completed'         // Book issued successfully
  | 'expired';          // Code expired (not collected in time)

// Issue Status
export type IssueStatus = 
  | 'issued'            // Book currently with student
  | 'returned'          // Book returned on time
  | 'overdue'           // Book not returned by due date
  | 'lost';             // Book reported as lost

// Book Categories
export type BookCategory = 
  | 'Fiction'
  | 'Non-Fiction'
  | 'Reference'
  | 'Textbook'
  | 'Research'
  | 'Journal'
  | 'Magazine'
  | 'Other';

// Constants for Book Categories  
export const BOOK_CATEGORIES: BookCategory[] = [
  'Fiction',
  'Non-Fiction',
  'Reference',
  'Textbook',
  'Research',
  'Journal',
  'Magazine',
  'Other',
];

// Constants for Request Status
export const REQUEST_STATUS = {
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  COMPLETED: 'completed' as const,
  EXPIRED: 'expired' as const,
};

// Constants for Issue Status
export const ISSUE_STATUS = {
  ISSUED: 'issued' as const,
  RETURNED: 'returned' as const,
  OVERDUE: 'overdue' as const,
  LOST: 'lost' as const,
};

/**
 * Book Information
 */
export interface Book {
  // Book Identification
  bookId: string;                    // BOOK-001
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: string;
  edition: string;
  
  // Classification
  category: BookCategory;
  subject: string;
  language: string;
  
  // Physical Details
  rackNumber: string;
  totalCopies: number;
  availableCopies: number;
  
  // Metadata
  addedDate: string;
  addedBy: string;
  lastUpdated?: string;
  updatedBy?: string;
  
  // Additional Info
  description?: string;
  coverImageUrl?: string;
  
  // Row reference for updates
  rowNumber?: number;
}

/**
 * Book Request (Student requests a book)
 */
export interface BookRequest {
  // Request Identification
  requestId: string;                 // REQ-001
  requestDate: string;
  
  // Book Details (Snapshot)
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  
  // Student Details (from admission/student database)
  studentId: string;                 // STU-001 or APP-001
  studentName: string;
  email: string;
  rollNumber?: string;
  course: string;
  branch: string;
  year: string;
  mobile: string;
  
  // Request Status
  status: RequestStatus;
  
  // Code Generation (when approved)
  issueCode?: string;                // 6-digit code: 123456
  codeGeneratedDate?: string;
  codeExpiryDate?: string;           // 24 hours to collect
  
  // Processing
  processedBy?: string;              // Librarian who approved/rejected
  processedDate?: string;
  rejectionReason?: string;
  
  // Completion
  completedDate?: string;            // When book was issued
  
  // Row reference
  rowNumber?: number;
}

/**
 * Issued Book (Active book loans)
 */
export interface IssuedBook {
  // Issue Identification
  issueId: string;                   // ISS-001
  requestId: string;                 // Link to original request
  
  // Book Details (Snapshot)
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  isbn: string;
  
  // Student Details (Snapshot)
  studentId: string;
  studentName: string;
  email: string;
  rollNumber?: string;
  course: string;
  branch: string;
  year: string;
  mobile: string;
  
  // Issue Details
  issueDate: string;
  dueDate: string;                   // issueDate + 15 days
  returnDate?: string;
  
  // Status
  status: IssueStatus;
  
  // Fine Calculation
  daysOverdue: number;
  fineAmount: number;                // ₹5 per day after due date
  finePaid: boolean;
  finePaymentDate?: string;
  finePaymentReference?: string;
  
  // Processing
  issuedBy: string;                  // Librarian who issued
  returnedBy?: string;               // Librarian who processed return
  
  // Notes
  issueNotes?: string;
  returnNotes?: string;
  condition?: 'good' | 'fair' | 'damaged' | 'lost';
  
  // Row reference
  rowNumber?: number;
}

/**
 * Notify Me Request (When book is not available)
 */
export interface NotifyRequest {
  notifyId: string;                  // NOT-001
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  email: string;
  requestDate: string;
  notified: boolean;
  notifiedDate?: string;
  rowNumber?: number;
}

/**
 * Library Statistics
 */
export interface LibraryStats {
  // Books
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  
  // Requests
  pendingRequests: number;
  approvedRequests: number;
  todayRequests: number;
  
  // Issues
  activeIssues: number;
  overdueIssues: number;
  returnedToday: number;
  
  // Fines
  totalFineAmount: number;
  unpaidFineAmount: number;
  
  // Categories
  byCategory: Record<BookCategory, number>;
}

/**
 * Library Receipt Data
 */
export interface LibraryReceipt {
  issueId: string;
  receiptDate: string;
  
  // Student Info
  studentName: string;
  rollNumber?: string;
  course: string;
  branch: string;
  email: string;
  mobile: string;
  
  // Book Info
  bookTitle: string;
  bookAuthor: string;
  isbn: string;
  bookId: string;
  
  // Issue Details
  issueDate: string;
  dueDate: string;
  issuedBy: string;
  
  // Institution Info
  institutionName: string;
  libraryName: string;
}

/**
 * API Response Type
 */
export interface LibraryApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Book Update Data
 */
export interface BookUpdateData {
  isbn?: string;
  title?: string;
  author?: string;
  publisher?: string;
  publicationYear?: string;
  edition?: string;
  category?: BookCategory;
  subject?: string;
  language?: string;
  rackNumber?: string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  coverImageUrl?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

/**
 * Request Update Data
 */
export interface RequestUpdateData {
  status?: RequestStatus;
  issueCode?: string;
  codeGeneratedDate?: string;
  codeExpiryDate?: string;
  processedBy?: string;
  processedDate?: string;
  rejectionReason?: string;
  completedDate?: string;
}

/**
 * Issue Update Data
 */
export interface IssueUpdateData {
  returnDate?: string;
  status?: IssueStatus;
  daysOverdue?: number;
  fineAmount?: number;
  finePaid?: boolean;
  finePaymentDate?: string;
  finePaymentReference?: string;
  returnedBy?: string;
  returnNotes?: string;
  condition?: 'good' | 'fair' | 'damaged' | 'lost';
}

/**
 * Book Filters
 */
export interface BookFilters {
  category?: BookCategory;
  subject?: string;
  language?: string;
  available?: boolean;
  searchQuery?: string;          // Search by title, author, ISBN
}

/**
 * Request Filters
 */
export interface RequestFilters {
  status?: RequestStatus;
  studentId?: string;
  bookId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;          // Search by student name, book title
}

/**
 * Issue Filters
 */
export interface IssueFilters {
  status?: IssueStatus;
  studentId?: string;
  bookId?: string;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;          // Search by student name, book title
}
