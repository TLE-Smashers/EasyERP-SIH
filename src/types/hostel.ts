/**
 * Hostel Module Type Definitions
 * Defines data structures for the hostel application and allocation process
 */

// Hostel Gender Enum
export type HostelGender = "male" | "female";

// Hostel Application Status
export type HostelApplicationStatus =
  | "pending"            // Application received, not processed
  | "allocated"          // Room allocated, awaiting payment
  | "confirmed"          // Payment done, room confirmed
  | "rejected"           // Application rejected
  | "deallocated";       // Room deallocated

/**
 * Hostel Application Form Data
 */
export interface HostelApplicationForm {
  timestamp: string; // Submission time
  studentId: string; // From admission
  fullName: string;
  email: string;
  contactNumber: string;
  gender: HostelGender;
  category: string;
  entrancePercentage: number;
}

/**
 * Hostel Application (with status and allocation)
 */
export interface HostelApplication extends HostelApplicationForm {
  status: HostelApplicationStatus;
  roomNumber?: string; // Assigned room, if any
  allocationTimestamp?: string;
  paymentConfirmed?: boolean;
  currentYear?: number;
  session?: string;
}

/**
 * Room Allocation Info
 */
export interface HostelRoom {
  hostel: HostelGender; // Hostel type
  roomNumber: string; // e.g., 'G-101', 'B-205'
  occupants: string[]; // List of studentIds
  maxOccupancy: number; // Always 2
}

/**
 * API Response Type
 */
export interface HostelApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
