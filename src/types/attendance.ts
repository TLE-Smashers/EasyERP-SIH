/**
 * Attendance Management Type Definitions
 * Handles faculty daily attendance tracking with Photo + GPS
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
    | "photo_gps"       // Photo + GPS capture (NEW)
    | "system";         // System-generated

// GPS Coordinates
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number;
  timestamp: number;
}

// Device Information
export interface DeviceInfo {
  fingerprint: string; // Unique device ID
  userAgent: string;
  platform: string;
  browser: string;
  isMobile: boolean;
  screenResolution: string;
  timezone: string;
}

// Campus Geo-Fence Configuration
export interface GeoFenceConfig {
  id: string;
  name: string; // e.g., "Main Campus", "Admin Block"
  centerLat: number;
  centerLng: number;
  radiusMeters: number; // Allowed radius (e.g., 100m)
  isActive: boolean;
}

// Attendance Flags (for anomaly detection)
export type AttendanceFlag = 
  | 'outside_geofence'
  | 'different_device'
  | 'outside_time_window'
  | 'low_gps_accuracy'
  | 'suspicious_location'
  | 'duplicate_attempt'
  | 'manual_override';

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

    // Photo + GPS Data (NEW)
    checkInPhoto?: string; // Base64 or URL
    checkInGPS?: GPSCoordinates;
    checkInDevice?: DeviceInfo;
    checkInGeoFence?: string; // Which geo-fence was used
    
    checkOutPhoto?: string;
    checkOutGPS?: GPSCoordinates;
    checkOutDevice?: DeviceInfo;
    checkOutGeoFence?: string;
    
    // Verification (NEW)
    isWithinGeoFence?: boolean;
    isSameDevice?: boolean;
    flags?: AttendanceFlag[];

    // Additional Info
    remarks?: string;
    markedBy: string;
    method: AttendanceMethod;

    // Late Entry
    isLate?: boolean;
    lateByMinutes?: number;

    // Admin approval (NEW)
    requiresApproval?: boolean;
    approvedBy?: string;
    approvedAt?: string;

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
