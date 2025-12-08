/**
 * Attendance Management Type Definitions
 * Handles faculty daily attendance tracking
 */

// Attendance Status
export type AttendanceStatus =
    | "present"         // Present
    | "absent"          // Absent
    | "on_leave"        // On approved leave
    | "half_day"        // Half day present
    | "late"            // Late arrival
    | "work_from_home"; // Working from home

// Attendance Marking Method
export type AttendanceMethod =
    | "manual"          // Manually marked by admin
    | "biometric"       // Biometric system
    | "self"            // Self-marked by faculty
    | "system";         // System-generated

/**
 * Faculty Attendance Record
 */
export interface FacultyAttendanceRecord {
    id: string;
    facultyId: string;
    facultyName: string;
    employeeId: string;
    department: string;

    // Attendance Details
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;

    // Additional Info
    remarks?: string;
    markedBy: string;
    method: AttendanceMethod;

    // Late Entry
    isLate?: boolean;
    lateByMinutes?: number;

    // Metadata
    timestamp: string;
    rowNumber?: number;
}

/**
 * Monthly Attendance Summary
 */
export interface MonthlyAttendanceSummary {
    facultyId: string;
    employeeId: string;
    facultyName: string;
    department: string;
    month: string; // YYYY-MM format

    // Counts
    totalWorkingDays: number;
    presentDays: number;
    absentDays: number;
    leaveDays: number;
    halfDays: number;
    lateDays: number;
    wfhDays: number;

    // Percentage
    attendancePercentage: number;

    // Details
    records: FacultyAttendanceRecord[];
}

/**
 * Attendance Statistics
 */
export interface AttendanceStats {
    totalFaculty: number;
    presentToday: number;
    absentToday: number;
    onLeaveToday: number;
    lateToday: number;

    // Department-wise
    departmentWise: {
        department: string;
        present: number;
        total: number;
        percentage: number;
    }[];

    // Trend (last 7 days)
    weeklyTrend: {
        date: string;
        present: number;
        absent: number;
        onLeave: number;
    }[];
}

/**
 * Bulk Attendance Entry
 */
export interface BulkAttendanceEntry {
    date: string;
    entries: {
        facultyId: string;
        status: AttendanceStatus;
        checkInTime?: string;
        checkOutTime?: string;
        remarks?: string;
    }[];
    markedBy: string;
}

/**
 * Attendance Report Filter
 */
export interface AttendanceReportFilter {
    startDate: string;
    endDate: string;
    department?: string;
    status?: AttendanceStatus;
    facultyId?: string;
}

/**
 * Attendance Form Data
 */
export interface AttendanceFormData {
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
}
