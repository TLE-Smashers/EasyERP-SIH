/**
 * Admission Module Type Definitions
 * Defines data structures for the admission process
 */

// Application Status Enum
export type ApplicationStatus = 
  | "pending"              // Initial submission
  | "documents_verified"   // Documents approved
  | "payment_pending"      // Waiting for payment
  | "paid"                 // Payment completed
  | "completed"            // Admission completed and locked
  | "rejected";            // Application rejected

/**
 * Personal Information
 */
export interface PersonalDetails {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianContact: string;
}

/**
 * Academic Information
 */
export interface AcademicDetails {
  // 10th Standard
  school10th: string;
  board10th: string;
  marks10th: string;
  yearOfPassing10th: string;
  
  // 12th Standard
  school12th: string;
  board12th: string;
  marks12th: string;
  yearOfPassing12th: string;
  
  // Course Selection
  course: string;
  branch: string;
}

/**
 * Document Links (Google Drive URLs)
 */
export interface DocumentLinks {
  marksheet10th?: string;
  marksheet12th?: string;
  entranceExamMarksheet?: string;
  allotmentLetter?: string;
  transferCertificate?: string;
  characterCertificate?: string;
  casteCertificate?: string;
  domicile?: string;
  idProof?: string; // Aadhar card
  photo?: string;
  gapCertificate?: string;
}

/**
 * Final remarks for completed admissions
 */
export interface CompletionDetails {
  finalRemarks?: string;
}

/**
 * Complete Application Data
 */
export interface Application {
  // Metadata
  id: string;
  timestamp: string;
  
  // Application Data
  personalDetails: PersonalDetails;
  academicDetails: AcademicDetails;
  documentLinks: DocumentLinks;
  
  // Status & Progress
  applicationStatus: ApplicationStatus;
  
  // Document Verification
  documentsVerified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  verificationNotes?: string;
  
  // Completion
  completionDetails?: CompletionDetails;
  
  // Lock Status
  locked: boolean;
  lockedBy?: string;
  lockedDate?: string;
  
  // Row Number (for Sheet operations)
  rowNumber?: number;
}

/**
 * Application Form Data (for updates)
 */
export interface ApplicationUpdateData {
  personalDetails?: Partial<PersonalDetails>;
  academicDetails?: Partial<AcademicDetails>;
  documentLinks?: Partial<DocumentLinks>;
  applicationStatus?: ApplicationStatus;
  documentsVerified?: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  verificationNotes?: string;
  completionDetails?: Partial<CompletionDetails>;
  locked?: boolean;
  lockedBy?: string;
  lockedDate?: string;
  paymentStatus?: 'paid' | 'unpaid';
}

/**
 * API Response Type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Application Statistics
 */
export interface ApplicationStats {
  total: number;
  pending: number;
  documentsVerified: number;
  completed: number;
  rejected: number;
}
