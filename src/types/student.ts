/**
 * Student Module Type Definitions
 * Defines data structures for student management
 */

export type StudentStatus = 
  | "active"      // Currently enrolled
  | "inactive"    // Temporarily inactive
  | "graduated"   // Completed course
  | "dropped";    // Dropped out

/**
 * Student Personal Information
 */
export interface StudentPersonalInfo {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianContact: string;
}

/**
 * Student Academic Information
 */
export interface StudentAcademicInfo {
  studentId: string;        // Unique student ID (e.g., STU-2024-001)
  rollNumber?: string;      // Roll number if assigned
  course: string;           // e.g., B.Tech
  branch: string;           // e.g., CSE, ECE, ME
  year: number;             // Current year (1, 2, 3, 4)
  semester: number;         // Current semester
  batch: string;            // e.g., 2024-2028
  section?: string;         // Section A, B, C
  admissionDate: string;    // Date of admission
}

/**
 * Complete Student Data
 */
export interface Student {
  id: string;                           // Document/Sheet ID
  personalInfo: StudentPersonalInfo;
  academicInfo: StudentAcademicInfo;
  status: StudentStatus;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  rowNumber?: number;                   // For Google Sheets operations
}

/**
 * Student Form Data (for creation/update)
 */
export interface StudentFormData {
  personalInfo: StudentPersonalInfo;
  academicInfo: Omit<StudentAcademicInfo, 'studentId'>;
  status: StudentStatus;
}

/**
 * Student Filter Options
 */
export interface StudentFilters {
  search?: string;
  branch?: string;
  year?: number;
  status?: StudentStatus;
}

/**
 * Student Statistics
 */
export interface StudentStats {
  total: number;
  active: number;
  byBranch: {
    branch: string;
    count: number;
  }[];
  byYear: {
    year: number;
    count: number;
  }[];
}
