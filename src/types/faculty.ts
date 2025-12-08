/**
 * Faculty Module Type Definitions
 * Defines data structures for faculty management and portal
 */

// Faculty Status Enum
export type FacultyStatus =
    | "active"      // Currently working
    | "on_leave"    // On leave
    | "inactive";   // Not currently working

// Faculty Designation Enum
export type FacultyDesignation =
    | "professor"
    | "associate_professor"
    | "assistant_professor"
    | "lecturer"
    | "guest_faculty"
    | "lab_assistant";

// Faculty Employment Type
export type EmploymentType =
    | "permanent"
    | "contract"
    | "visiting"
    | "part_time";

// Qualification Level
export type QualificationLevel =
    | "phd"
    | "mtech"
    | "msc"
    | "btech"
    | "bsc"
    | "other";

/**
 * Personal Information
 */
export interface FacultyPersonalDetails {
    fullName: string;
    email: string;
    mobileNumber: string;
    alternateContact?: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other";
    address: string;
    city: string;
    state: string;
    pincode: string;
    emergencyContact: string;
    emergencyContactName: string;
    bloodGroup?: string;
}

/**
 * Academic & Professional Information
 */
export interface FacultyProfessionalDetails {
    employeeId: string;
    designation: FacultyDesignation;
    department: string;
    employmentType: EmploymentType;
    dateOfJoining: string;
    highestQualification: QualificationLevel;
    specialization: string;
    experience: number; // Years of experience
    previousInstitution?: string;
}

/**
 * Educational Qualifications
 */
export interface FacultyQualification {
    degree: string;
    institution: string;
    university: string;
    yearOfPassing: string;
    percentage: string;
    specialization: string;
}

/**
 * Document Links (Google Drive URLs)
 */
export interface FacultyDocumentLinks {
    photo?: string;
    resume?: string;
    idProof?: string; // Aadhar card
    addressProof?: string;
    degreeCertificates?: string;
    experienceCertificates?: string;
    joiningLetter?: string;
    bankDetails?: string;
}

/**
 * Teaching Assignment
 */
export interface TeachingAssignment {
    courseCode: string;
    courseName: string;
    class: string;
    semester: string;
    academicYear: string;
    section?: string;
    totalStudents?: number;
}

/**
 * Faculty Class Schedule
 */
export interface ClassSchedule {
    day: string;
    timeSlot: string;
    courseCode: string;
    courseName: string;
    room: string;
    class: string;
    section?: string;
}

/**
 * Faculty Research/Publications
 */
export interface FacultyResearch {
    publicationTitle: string;
    type: "journal" | "conference" | "book" | "patent" | "other";
    publicationDate: string;
    publisher?: string;
    coAuthors?: string;
    link?: string;
}

/**
 * Simplified Faculty Data (matching actual Google Sheets structure)
 */
export interface Faculty {
    id: string;
    facultyId: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    gender: "male" | "female" | "other";
    dateOfBirth: string;
    photoUrl: string;
    designation: string;
    branch: string; // Department
    joiningDate: string;
    assignedSubjects: string;
    assignedClasses: string;
    accessRole: string;
    status: "active" | "inactive" | "on_leave";
    rowIndex?: number; // Row number in sheet for updates
}

/**
 * Legacy interfaces kept for backward compatibility with existing code
 */
export interface FacultyFormData {
    personalDetails: FacultyPersonalDetails;
    professionalDetails: FacultyProfessionalDetails;
    qualifications: FacultyQualification[];
    documentLinks: FacultyDocumentLinks;
    status: FacultyStatus;
    notes?: string;
}

/**
 * Faculty Statistics (for dashboard)
 */
export interface FacultyStats {
    totalFaculty: number;
    activeCount: number;
    onLeaveCount: number;
    departmentWise: {
        department: string;
        count: number;
    }[];
    designationWise: {
        designation: FacultyDesignation;
        count: number;
    }[];
}

/**
 * Faculty Attendance Record
 */
export interface FacultyAttendance {
    date: string;
    status: "present" | "absent" | "on_leave" | "half_day";
    remarks?: string;
}

/**
 * API Response Type
 */
export interface FacultyApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}
