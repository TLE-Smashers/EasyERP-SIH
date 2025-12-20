/**
 * Auto-Approval Server Actions
 * Intelligent automated approval system
 */

'use server';

import { fetchPendingApprovals, fetchTodaysAttendance, updateAttendanceByRow } from '@/lib/google/sheets.attendance';
import { AttendanceFlag, FacultyAttendanceRecord } from '@/types/attendance';

/**
 * Auto-approve attendance based on intelligent rules
 * Minimizes human intervention
 */
export async function autoApproveAttendance(): Promise<{
  autoApproved: number;
  needsReview: number;
  details: { approved: string[]; needsReview: string[] };
}> {
  try {
    const pendingRecords = await fetchPendingApprovals();
    
    const approved: string[] = [];
    const needsReview: string[] = [];
    
    for (const record of pendingRecords) {
      const decision = shouldAutoApprove(record);
      
      if (decision.approve) {
        // Auto-approve
        await updateAttendanceByRow(record.rowNumber!, {
          requiresApproval: false,
          approvedBy: 'system_auto',
          approvedAt: new Date().toISOString(),
          remarks: decision.reason,
        });
        approved.push(record.facultyName);
      } else {
        // Needs human review
        needsReview.push(record.facultyName);
      }
    }
    
    console.log(`[Auto-Approve] Approved: ${approved.length}, Needs Review: ${needsReview.length}`);
    
    return {
      autoApproved: approved.length,
      needsReview: needsReview.length,
      details: { approved, needsReview },
    };
  } catch (error) {
    console.error('[Auto-Approve] Error:', error);
    return {
      autoApproved: 0,
      needsReview: 0,
      details: { approved: [], needsReview: [] },
    };
  }
}

/**
 * Intelligent decision engine for auto-approval
 * Rules-based system to minimize human intervention
 */
function shouldAutoApprove(record: FacultyAttendanceRecord): {
  approve: boolean;
  reason: string;
} {
  const flags = record.flags || [];
  
  // Rule 1: No flags = Auto-approve
  if (flags.length === 0) {
    return { approve: true, reason: 'No anomalies detected' };
  }
  
  // Rule 2: Only "low_gps_accuracy" flag = Auto-approve
  // (Common in buildings, not suspicious)
  if (flags.length === 1 && flags[0] === 'low_gps_accuracy') {
    return { approve: true, reason: 'Minor GPS accuracy issue (common indoors)' };
  }
  
  // Rule 3: Device changed but first time = Auto-approve with warning
  // (Faculty might have new phone)
  if (flags.length === 1 && flags[0] === 'different_device') {
    return { 
      approve: true, 
      reason: 'New device detected - auto-approved (device will be registered)' 
    };
  }
  
  // Rule 4: Outside time window by < 5 minutes = Auto-approve
  // (Clock sync issues, minor delays)
  if (flags.includes('outside_time_window') && record.lateByMinutes && record.lateByMinutes < 5) {
    return { approve: true, reason: 'Slightly outside time window (< 5 min) - acceptable' };
  }
  
  // Rule 5: Multiple minor flags (not suspicious) = Auto-approve
  const minorFlags = ['low_gps_accuracy', 'different_device'];
  const allMinor = flags.every(flag => minorFlags.includes(flag));
  if (allMinor && flags.length <= 2) {
    return { approve: true, reason: 'Only minor flags present - auto-approved' };
  }
  
  // Rule 6: Critical flags = Needs review
  const criticalFlags: AttendanceFlag[] = [
    'outside_geofence',
    'suspicious_location',
    'duplicate_attempt',
  ];
  
  const hasCritical = flags.some(flag => criticalFlags.includes(flag));
  if (hasCritical) {
    return { approve: false, reason: 'Critical security flag - requires manual review' };
  }
  
  // Default: Auto-approve if not critical
  return { approve: true, reason: 'No critical issues found' };
}

/**
 * Get attendance statistics for dashboard
 */
export async function getAttendanceStats(date: string): Promise<{
  total: number;
  present: number;
  late: number;
  absent: number;
  pendingApproval: number;
  averageCheckInTime: string;
}> {
  try {
    const records = await fetchTodaysAttendance(date);
    const pending = await fetchPendingApprovals();
    
    const present = records.filter((r: FacultyAttendanceRecord) => r.status === 'present').length;
    const late = records.filter((r: FacultyAttendanceRecord) => r.status === 'late').length;
    const absent = records.filter((r: FacultyAttendanceRecord) => r.status === 'absent').length;
    
    // Calculate average check-in time
    const checkedIn = records.filter((r: FacultyAttendanceRecord) => r.checkInTime);
    let avgTime = '';
    if (checkedIn.length > 0) {
      const totalMinutes = checkedIn.reduce((sum: number, r: FacultyAttendanceRecord) => {
        const time = new Date(r.checkInTime!);
        return sum + time.getHours() * 60 + time.getMinutes();
      }, 0);
      const avgMinutes = Math.floor(totalMinutes / checkedIn.length);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      avgTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return {
      total: records.length,
      present,
      late,
      absent,
      pendingApproval: pending.length,
      averageCheckInTime: avgTime,
    };
  } catch (error) {
    console.error('[Stats] Error:', error);
    return {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      pendingApproval: 0,
      averageCheckInTime: '',
    };
  }
}

/**
 * Manual approve by admin
 */
export async function manualApprove(
  attendanceId: string,
  rowNumber: number,
  adminId: string,
  remarks?: string
): Promise<{ success: boolean; message: string }> {
  try {
    await updateAttendanceByRow(rowNumber, {
      requiresApproval: false,
      approvedBy: adminId,
      approvedAt: new Date().toISOString(),
      remarks: remarks || 'Manually approved by admin',
    });
    
    return { success: true, message: 'Attendance approved successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to approve' };
  }
}

/**
 * Manual reject by admin
 */
export async function manualReject(
  attendanceId: string,
  rowNumber: number,
  adminId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    await updateAttendanceByRow(rowNumber, {
      status: 'absent',
      requiresApproval: false,
      approvedBy: adminId,
      approvedAt: new Date().toISOString(),
      remarks: `Rejected: ${reason}`,
    });
    
    return { success: true, message: 'Attendance rejected' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to reject' };
  }
}

/**
 * Bulk approve all pending records (for testing/quick approval)
 */
export async function bulkApproveAll(adminId: string): Promise<{
  success: boolean;
  approved: number;
  message: string;
}> {
  try {
    const pendingRecords = await fetchPendingApprovals();
    
    let approved = 0;
    for (const record of pendingRecords) {
      try {
        await updateAttendanceByRow(record.rowNumber!, {
          requiresApproval: false,
          approvedBy: adminId,
          approvedAt: new Date().toISOString(),
          remarks: 'Bulk approved by admin',
        });
        approved++;
      } catch (error) {
        console.error(`Failed to approve record ${record.id}:`, error);
      }
    }
    
    return {
      success: true,
      approved,
      message: `Successfully approved ${approved} of ${pendingRecords.length} records`,
    };
  } catch (error: any) {
    return {
      success: false,
      approved: 0,
      message: error.message || 'Failed to bulk approve',
    };
  }
}

/**
 * Get pending approvals list for admin dashboard
 */
export async function getPendingApprovals(): Promise<{
  success: boolean;
  data: FacultyAttendanceRecord[];
  count: number;
}> {
  try {
    const records = await fetchPendingApprovals();
    return {
      success: true,
      data: records,
      count: records.length,
    };
  } catch (error) {
    console.error('[Pending Approvals] Error:', error);
    return {
      success: false,
      data: [],
      count: 0,
    };
  }
}
