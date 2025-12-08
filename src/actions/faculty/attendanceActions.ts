/**
 * Server Actions for Attendance Management
 * Handles faculty attendance operations
 */

"use server";

import { revalidatePath } from "next/cache";
import {
    fetchAllAttendance,
    fetchAttendanceByFaculty,
    fetchAttendanceByDate,
    markAttendance,
    markBulkAttendance,
    updateAttendance,
    getMonthlyAttendanceSummary,
    getAttendanceStats,
} from "@/lib/google/sheets.attendance";
import { FacultyAttendanceRecord, AttendanceFormData } from "@/types/attendance";

/**
 * Get all attendance records
 */
export async function getAllAttendance() {
    try {
        const records = await fetchAllAttendance();
        return {
            success: true,
            data: records,
            message: "Attendance records fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch attendance records",
        };
    }
}

/**
 * Get attendance for specific faculty
 */
export async function getFacultyAttendance(
    facultyId: string,
    startDate?: string,
    endDate?: string
) {
    try {
        const records = await fetchAttendanceByFaculty(facultyId, startDate, endDate);
        return {
            success: true,
            data: records,
            message: "Faculty attendance fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch faculty attendance",
        };
    }
}

/**
 * Get attendance for specific date
 */
export async function getAttendanceByDate(date: string) {
    try {
        const records = await fetchAttendanceByDate(date);
        return {
            success: true,
            data: records,
            message: "Attendance for date fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch attendance for date",
        };
    }
}

/**
 * Mark attendance for a faculty member
 */
export async function recordAttendance(
    facultyId: string,
    facultyName: string,
    employeeId: string,
    department: string,
    formData: AttendanceFormData,
    markedBy: string
) {
    try {
        const attendance: Partial<FacultyAttendanceRecord> = {
            facultyId,
            facultyName,
            employeeId,
            department,
            date: formData.date,
            status: formData.status,
            checkInTime: formData.checkInTime,
            checkOutTime: formData.checkOutTime,
            remarks: formData.remarks,
            markedBy,
            method: "manual",
        };

        // Calculate if late (assuming 9:00 AM is the standard time)
        if (formData.checkInTime) {
            const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
            const standardTime = new Date("2000-01-01T09:00:00");

            if (checkIn > standardTime) {
                const diffMinutes = Math.floor((checkIn.getTime() - standardTime.getTime()) / (1000 * 60));
                attendance.isLate = true;
                attendance.lateByMinutes = diffMinutes;
            }
        }

        // Calculate total hours if both times provided
        if (formData.checkInTime && formData.checkOutTime) {
            const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
            const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`);
            const diffHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            attendance.totalHours = Math.round(diffHours * 100) / 100;
        }

        await markAttendance(attendance);
        revalidatePath("/dashboard/faculty/attendance-manage");
        revalidatePath("/dashboard/faculty/my-attendance");

        return {
            success: true,
            message: "Attendance marked successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to mark attendance",
        };
    }
}

/**
 * Mark bulk attendance
 */
export async function recordBulkAttendance(
    entries: Array<{
        facultyId: string;
        facultyName: string;
        employeeId: string;
        department: string;
        status: string;
        checkInTime?: string;
        checkOutTime?: string;
        remarks?: string;
    }>,
    date: string,
    markedBy: string
) {
    try {
        const attendanceRecords = entries.map(entry => ({
            facultyId: entry.facultyId,
            facultyName: entry.facultyName,
            employeeId: entry.employeeId,
            department: entry.department,
            date,
            status: entry.status as any,
            checkInTime: entry.checkInTime,
            checkOutTime: entry.checkOutTime,
            remarks: entry.remarks,
            markedBy,
            method: "manual" as any,
        }));

        const results = await markBulkAttendance(attendanceRecords);
        revalidatePath("/dashboard/faculty/attendance-manage");

        return {
            success: results.failed === 0,
            message: `Marked ${results.success} records successfully. ${results.failed} failed.`,
            data: results,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to mark bulk attendance",
        };
    }
}

/**
 * Update attendance record
 */
export async function updateAttendanceRecord(
    attendanceId: string,
    updates: Partial<FacultyAttendanceRecord>
) {
    try {
        await updateAttendance(attendanceId, updates);
        revalidatePath("/dashboard/faculty/attendance-manage");
        revalidatePath("/dashboard/faculty/my-attendance");

        return {
            success: true,
            message: "Attendance updated successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to update attendance",
        };
    }
}

/**
 * Get monthly attendance summary
 */
export async function getMonthlyAttendance(
    facultyId: string,
    month: string
) {
    try {
        const summary = await getMonthlyAttendanceSummary(facultyId, month);

        if (!summary) {
            return {
                success: false,
                message: "No attendance records found for this month",
            };
        }

        return {
            success: true,
            data: summary,
            message: "Monthly attendance summary fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch monthly attendance summary",
        };
    }
}

/**
 * Get attendance statistics for a date
 */
export async function getDailyAttendanceStats(date: string) {
    try {
        const stats = await getAttendanceStats(date);
        return {
            success: true,
            data: stats,
            message: "Attendance statistics fetched successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Failed to fetch attendance statistics",
        };
    }
}
