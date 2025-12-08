/**
 * Leave Management Type Definitions
 * Handles faculty leave requests and approval workflow
 */

// Leave Types
export type LeaveType =
    | "casual"          // Casual Leave
    | "sick"            // Sick Leave
    | "earned"          // Earned Leave
    | "maternity"       // Maternity Leave
    | "paternity"       // Paternity Leave
    | "compensatory"    // Compensatory Leave
    | "unpaid"          // Leave Without Pay
    | "other";          // Other

// Leave Status
export type LeaveStatus =
    | "pending"         // Waiting for approval
    | "approved"        // Approved by authority
    | "rejected"        // Rejected by authority
    | "cancelled";      // Cancelled by faculty

// Leave Duration Type
export type LeaveDuration =
    | "full_day"        // Full day leave
    | "half_day_first"  // First half (morning)
    | "half_day_second"; // Second half (afternoon)

/**
 * Leave Request Interface
 */
export interface LeaveRequest {
    id: string;
    facultyId: string;
    facultyName: string;
    employeeId: string;
    department: string;

    // Leave Details
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    duration: LeaveDuration;
    totalDays: number;
    reason: string;

    // Approval Workflow
    status: LeaveStatus;
    appliedOn: string;
    approvedBy?: string;
    approvedOn?: string;
    rejectionReason?: string;

    // Supporting Documents
    supportingDocument?: string; // URL to uploaded document (medical certificate, etc.)

    // Metadata
    timestamp: string;
    rowNumber?: number;
}

/**
 * Leave Balance Interface
 */
export interface LeaveBalance {
    facultyId: string;
    employeeId: string;
    academicYear: string;

    // Leave Allocations
    casualLeave: {
        allocated: number;
        used: number;
        remaining: number;
    };
    sickLeave: {
        allocated: number;
        used: number;
        remaining: number;
    };
    earnedLeave: {
        allocated: number;
        used: number;
        remaining: number;
    };

    // Total Summary
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;

    lastUpdated: string;
}

/**
 * Leave Statistics (for dashboard)
 */
export interface LeaveStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;

    // By Type
    typeWise: {
        type: LeaveType;
        count: number;
    }[];

    // By Month
    monthWise: {
        month: string;
        count: number;
    }[];
}

/**
 * Leave Calendar Event
 */
export interface LeaveCalendarEvent {
    id: string;
    facultyName: string;
    department: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    status: LeaveStatus;
}

/**
 * Leave Form Data
 */
export interface LeaveFormData {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    duration: LeaveDuration;
    reason: string;
    supportingDocument?: string;
}

/**
 * Leave Approval Action
 */
export interface LeaveApprovalAction {
    leaveId: string;
    action: "approve" | "reject";
    remarks?: string;
    approvedBy: string;
}
