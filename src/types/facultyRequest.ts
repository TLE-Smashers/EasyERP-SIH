/**
 * Faculty Request Types - Cross-Institution Faculty Consultation
 * Students can request faculty from any institution for lectures/consultations
 */

/**
 * Faculty Request
 */
export interface FacultyRequest {
  requestId: string;
  studentEmail: string;
  studentName: string;
  studentInstitutionId: string;
  studentInstitutionName: string;
  facultyEmail: string;
  facultyName: string;
  facultyInstitutionId: string;
  facultyInstitutionName: string;
  subject: string;
  topic: string;
  description: string;
  preferredDate?: string; // ISO date string - set by faculty
  preferredTime?: string; // e.g., "14:00" - set by faculty
  duration?: string; // e.g., "60" (minutes) - set by faculty
  status: RequestStatus;
  meetLink?: string; // Google Meet link
  createdAt: string;
  updatedAt?: string;
  responseMessage?: string;
  unreadCount: number; // Unread messages for the current user
  rowNumber?: number;
}

export enum RequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Chat Message for Faculty Request
 */
export interface FacultyRequestMessage {
  messageId: string;
  requestId: string;
  senderEmail: string;
  senderName: string;
  senderType: "student" | "faculty";
  message: string;
  timestamp: string;
  read: boolean;
  rowNumber?: number;
}

/**
 * Faculty Profile (for discovery)
 */
export interface FacultyProfile {
  email: string;
  name: string;
  institutionId: string;
  institutionName: string;
  department?: string;
  specialization?: string;
  designation?: string;
  available: boolean;
  rating?: number;
  totalSessions?: number;
}
