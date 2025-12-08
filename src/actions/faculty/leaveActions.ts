/**
 * Server Actions for Leave Management
 * Handles leave request operations
 */

"use server";

import { revalidatePath } from "next/cache";
import {
    fetchAllLeaveRequests,
    fetchLeaveRequestsByFaculty,
    fetchLeaveRequestById,
    addLeaveRequest,
    updateLeaveStatus,
    cancelLeaveRequest,
    fetchLeaveBalance,
    initializeLeaveBalance,
} from "@/lib/google/sheets.leave";
import { LeaveRequest, LeaveStatus, LeaveFormData } from "@/types/leave";

/**
 * Get all leave requests
 */
export async function getLeaveRequests() {
    try {
        const requests = await fetchAllLeaveRequests();
        return {
            success: true,
            data: requests,
            message: "Leave requests fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch leave requests",
        };
    }
}

/**
 * Get leave requests for a specific faculty
 */
export async function getFacultyLeaveRequests(facultyId: string) {
    try {
        const requests = await fetchLeaveRequestsByFaculty(facultyId);
        return {
            success: true,
            data: requests,
            message: "Faculty leave requests fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch faculty leave requests",
        };
    }
}

/**
 * Get single leave request by ID
 */
export async function getLeaveRequest(leaveId: string) {
    try {
        const request = await fetchLeaveRequestById(leaveId);
        if (!request) {
            return {
                success: false,
                message: "Leave request not found",
            };
        }
        return {
            success: true,
            data: request,
            message: "Leave request fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch leave request",
        };
    }
}

/**
 * Submit new leave request
 */
export async function submitLeaveRequest(
    facultyId: string,
    facultyName: string,
    employeeId: string,
    department: string,
    formData: LeaveFormData
) {
    try {
        // Calculate total days based on start and end date
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Adjust for half day
        const totalDays = formData.duration.includes("half_day") ? 0.5 : diffDays;

        const leaveRequest: Partial<LeaveRequest> = {
            facultyId,
            facultyName,
            employeeId,
            department,
            leaveType: formData.leaveType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            duration: formData.duration,
            totalDays,
            reason: formData.reason,
            supportingDocument: formData.supportingDocument,
            appliedOn: new Date().toISOString(),
            status: "pending",
        };

        await addLeaveRequest(leaveRequest);
        revalidatePath("/dashboard/faculty/leave");
        revalidatePath("/dashboard/faculty/leave/manage");

        return {
            success: true,
            message: "Leave request submitted successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to submit leave request",
        };
    }
}

/**
 * Approve leave request
 */
export async function approveLeaveRequest(
    leaveId: string,
    approvedBy: string
) {
    try {
        await updateLeaveStatus(leaveId, "approved", approvedBy);
        revalidatePath("/dashboard/faculty/leave/manage");
        revalidatePath("/dashboard/faculty/leave");

        return {
            success: true,
            message: "Leave request approved successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to approve leave request",
        };
    }
}

/**
 * Reject leave request
 */
export async function rejectLeaveRequest(
    leaveId: string,
    approvedBy: string,
    rejectionReason: string
) {
    try {
        await updateLeaveStatus(leaveId, "rejected", approvedBy, rejectionReason);
        revalidatePath("/dashboard/faculty/leave/manage");
        revalidatePath("/dashboard/faculty/leave");

        return {
            success: true,
            message: "Leave request rejected",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to reject leave request",
        };
    }
}

/**
 * Cancel leave request (by faculty)
 */
export async function cancelLeave(leaveId: string) {
    try {
        await cancelLeaveRequest(leaveId);
        revalidatePath("/dashboard/faculty/leave");

        return {
            success: true,
            message: "Leave request cancelled successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to cancel leave request",
        };
    }
}

/**
 * Get leave balance for faculty
 */
export async function getFacultyLeaveBalance(
    facultyId: string,
    academicYear: string
) {
    try {
        const balance = await fetchLeaveBalance(facultyId, academicYear);

        if (!balance) {
            return {
                success: false,
                message: "Leave balance not found",
            };
        }

        return {
            success: true,
            data: balance,
            message: "Leave balance fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch leave balance",
        };
    }
}

/**
 * Initialize leave balance for new faculty
 */
export async function createLeaveBalance(
    facultyId: string,
    employeeId: string,
    academicYear: string
) {
    try {
        await initializeLeaveBalance(facultyId, employeeId, academicYear);
        revalidatePath("/dashboard/faculty/leave");

        return {
            success: true,
            message: "Leave balance initialized successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to initialize leave balance",
        };
    }
}
