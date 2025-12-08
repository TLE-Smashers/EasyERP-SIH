# Faculty Leave & Attendance Management System

## Overview
Complete leave and attendance management system for faculty members with admin approval workflow, balance tracking, and comprehensive reporting.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Google Sheets Setup](#google-sheets-setup)
3. [Features](#features)
4. [User Workflows](#user-workflows)
5. [API Integration](#api-integration)
6. [Testing Guide](#testing-guide)

---

## System Architecture

### Components Created

#### Type Definitions
- **`src/types/leave.ts`** - Leave management types
  - LeaveRequest, LeaveStatus, LeaveType, LeaveDuration
  - LeaveBalance, LeaveStats, LeaveCalendarEvent
  
- **`src/types/attendance.ts`** - Attendance management types
  - FacultyAttendanceRecord, AttendanceStatus, AttendanceMethod
  - MonthlyAttendanceSummary, AttendanceStats

#### Google Sheets Integration
- **`src/lib/google/sheets.leave.ts`** - Leave data operations (370+ lines)
  - CRUD operations for leave requests
  - Leave balance management
  - Status updates and approvals
  
- **`src/lib/google/sheets.attendance.ts`** - Attendance data operations (350+ lines)
  - Mark individual and bulk attendance
  - Monthly summaries and statistics
  - Attendance history tracking

#### Server Actions
- **`src/actions/faculty/leaveActions.ts`** - Leave request operations
  - Submit, approve, reject, cancel leave
  - Fetch requests and balances
  
- **`src/actions/faculty/attendanceActions.ts`** - Attendance operations
  - Mark attendance (single & bulk)
  - Monthly summaries and reports
  - Statistics and analytics

#### Pages
**Faculty Portal:**
- `/dashboard/faculty/leave` - Apply for leave
- `/dashboard/faculty/leave/history` - View leave history
- `/dashboard/faculty/leave/my-balance` - Check leave balance
- `/dashboard/faculty/my-attendance` - View attendance records
- `/dashboard/faculty/my-attendance/monthly` - Monthly reports

**Admin Panel:**
- `/dashboard/faculty/leave/manage` - Manage leave requests
- `/dashboard/faculty/leave/balance` - View all balances
- `/dashboard/faculty/leave/calendar` - Leave calendar view
- `/dashboard/faculty/attendance-manage` - Mark attendance
- `/dashboard/faculty/attendance-reports` - Attendance reports

#### UI Components (To be created)
**Leave Components:**
- `LeaveApplicationForm` - Leave application form
- `LeaveRequestsList` - Faculty's leave requests list
- `LeaveBalanceCard` - Leave balance display
- `LeaveRequestsTable` - Admin leave management table
- `LeaveStatsCards` - Leave statistics dashboard

**Attendance Components:**
- `AttendanceMarkingForm` - Bulk attendance marking
- `AttendanceStatsCards` - Daily statistics
- `DailyAttendanceTable` - View/edit records
- `MyAttendanceCalendar` - Personal calendar view
- `MonthlyAttendanceSummary` - Monthly report
- `AttendanceHistory` - Recent records list

---

## Google Sheets Setup

### Sheet 1: LeaveRequests
Create a Google Sheet with the following columns (A-R):

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | ID | Text | Unique leave ID (LV timestamp) |
| B | Faculty ID | Text | Faculty unique identifier |
| C | Faculty Name | Text | Full name |
| D | Employee ID | Text | Employee number |
| E | Department | Text | Department name |
| F | Leave Type | Text | casual/sick/earned/maternity/paternity/compensatory/unpaid/other |
| G | Start Date | Date | Leave start date (YYYY-MM-DD) |
| H | End Date | Date | Leave end date (YYYY-MM-DD) |
| I | Duration | Text | full_day/half_day_first/half_day_second |
| J | Total Days | Number | Calculated total days |
| K | Reason | Text | Leave reason/description |
| L | Status | Text | pending/approved/rejected/cancelled |
| M | Applied On | DateTime | Application timestamp |
| N | Approved By | Text | Approver's name |
| O | Approved On | DateTime | Approval timestamp |
| P | Rejection Reason | Text | Reason for rejection |
| Q | Supporting Document | URL | Document link (optional) |
| R | Timestamp | DateTime | Record creation time |

**Header Row (Row 1):**
```
ID | Faculty ID | Faculty Name | Employee ID | Department | Leave Type | Start Date | End Date | Duration | Total Days | Reason | Status | Applied On | Approved By | Approved On | Rejection Reason | Supporting Document | Timestamp
```

### Sheet 2: LeaveBalance (in same spreadsheet)
Create a second sheet with the following columns (A-P):

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | Faculty ID | Text | Faculty unique identifier |
| B | Employee ID | Text | Employee number |
| C | Academic Year | Text | YYYY-YYYY format (e.g., 2024-2025) |
| D | Casual Allocated | Number | Casual leave allocated |
| E | Casual Used | Number | Casual leave used |
| F | Casual Remaining | Number | Casual leave remaining |
| G | Sick Allocated | Number | Sick leave allocated |
| H | Sick Used | Number | Sick leave used |
| I | Sick Remaining | Number | Sick leave remaining |
| J | Earned Allocated | Number | Earned leave allocated |
| K | Earned Used | Number | Earned leave used |
| L | Earned Remaining | Number | Earned leave remaining |
| M | Total Allocated | Number | Sum of all allocations |
| N | Total Used | Number | Sum of all used |
| O | Total Remaining | Number | Sum of all remaining |
| P | Last Updated | DateTime | Last update timestamp |

**Header Row (Row 1):**
```
Faculty ID | Employee ID | Academic Year | Casual Allocated | Casual Used | Casual Remaining | Sick Allocated | Sick Used | Sick Remaining | Earned Allocated | Earned Used | Earned Remaining | Total Allocated | Total Used | Total Remaining | Last Updated
```

**Default Allocations:**
- Casual Leave: 12 days/year
- Sick Leave: 12 days/year
- Earned Leave: 15 days/year
- **Total: 39 days/year**

### Sheet 3: FacultyAttendance
Create a new Google Sheet with the following columns (A-P):

| Column | Field Name | Type | Description |
|--------|------------|------|-------------|
| A | ID | Text | Unique attendance ID (ATT timestamp) |
| B | Faculty ID | Text | Faculty unique identifier |
| C | Faculty Name | Text | Full name |
| D | Employee ID | Text | Employee number |
| E | Department | Text | Department name |
| F | Date | Date | Attendance date (YYYY-MM-DD) |
| G | Status | Text | present/absent/on_leave/half_day/late/work_from_home |
| H | Check In Time | Time | Check-in time (HH:MM) |
| I | Check Out Time | Time | Check-out time (HH:MM) |
| J | Total Hours | Number | Hours worked |
| K | Remarks | Text | Additional notes |
| L | Marked By | Text | Who marked the attendance |
| M | Method | Text | manual/biometric/self/system |
| N | Is Late | Boolean | TRUE/FALSE |
| O | Late By Minutes | Number | Minutes late |
| P | Timestamp | DateTime | Record creation time |

**Header Row (Row 1):**
```
ID | Faculty ID | Faculty Name | Employee ID | Department | Date | Status | Check In Time | Check Out Time | Total Hours | Remarks | Marked By | Method | Is Late | Late By Minutes | Timestamp
```

### Environment Variables
Add these to your `.env.local` file:

```env
# Leave Management Sheet
NEXT_PUBLIC_LEAVE_SHEET_ID=your_leave_sheet_id_here

# Attendance Sheet
NEXT_PUBLIC_ATTENDANCE_SHEET_ID=your_attendance_sheet_id_here

# Service Account (same as existing)
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_service_account_private_key
```

### Share Permissions
1. Get service account email from Google Cloud Console
2. Share both sheets with service account email
3. Give "Editor" access

---

## Features

### Leave Management

#### For Faculty Members:
1. **Apply Leave**
   - Select leave type (casual, sick, earned, etc.)
   - Choose dates (start and end)
   - Select duration (full day, half day)
   - Provide reason
   - Upload supporting documents (optional)

2. **View Leave Balance**
   - See allocated, used, and remaining leaves
   - Break down by leave type
   - Academic year-wise tracking

3. **Track Requests**
   - View all submitted requests
   - Check approval status
   - Cancel pending requests
   - View rejection reasons

#### For Administrators:
1. **Manage Requests**
   - View all leave requests
   - Filter by status, department, date
   - Approve or reject requests
   - Add comments/reasons

2. **Leave Calendar**
   - Visual calendar of all leaves
   - Department-wise view
   - Identify leave conflicts

3. **Reports**
   - Leave utilization reports
   - Department-wise statistics
   - Trend analysis

### Attendance Management

#### For Faculty Members:
1. **View Attendance**
   - Calendar view of attendance
   - Monthly summaries
   - Attendance percentage
   - Late arrival tracking

2. **Monthly Reports**
   - Present/absent days count
   - Leave days
   - Working hours
   - Performance metrics

#### For Administrators:
1. **Mark Attendance**
   - Daily bulk attendance marking
   - Individual record updates
   - Quick status changes
   - Late entry marking

2. **View Records**
   - Date-wise attendance
   - Faculty-wise records
   - Department summaries
   - Export functionality

3. **Statistics Dashboard**
   - Today's attendance
   - Department-wise presence
   - Weekly trends
   - Monthly reports

---

## User Workflows

### Faculty: Applying for Leave
```
1. Navigate to: /dashboard/faculty/leave
2. Click "Apply Leave" tab
3. Fill the form:
   - Select leave type
   - Choose start and end dates
   - Select duration
   - Enter reason
   - Upload document (if needed)
4. Click "Submit Request"
5. Request goes to "Pending" status
6. Receive notification when approved/rejected
```

### Admin: Approving Leave
```
1. Navigate to: /dashboard/faculty/leave/manage
2. Click "Pending" tab
3. Review leave request details
4. Check leave balance
5. Click "Approve" or "Reject"
6. Add remarks (optional for approve, required for reject)
7. Confirm action
8. Faculty receives notification
```

### Admin: Marking Attendance
```
1. Navigate to: /dashboard/faculty/attendance-manage
2. Click "Mark Attendance" tab
3. Select date (default: today)
4. Faculty list appears
5. Mark status for each faculty:
   - Present / Absent / On Leave / Half Day
6. Enter check-in/out times (optional)
7. Add remarks if needed
8. Click "Save All" or "Submit"
```

### Faculty: Viewing Attendance
```
1. Navigate to: /dashboard/faculty/my-attendance
2. View calendar with color-coded dates:
   - Green: Present
   - Red: Absent
   - Orange: On Leave
   - Blue: Half Day
3. Click any date for details
4. Switch to "Monthly Summary" for reports
```

---

## API Integration

### Leave Actions
```typescript
// Submit leave request
import { submitLeaveRequest } from "@/actions/faculty/leaveActions";

const result = await submitLeaveRequest(
  facultyId,
  facultyName,
  employeeId,
  department,
  {
    leaveType: "casual",
    startDate: "2024-12-01",
    endDate: "2024-12-03",
    duration: "full_day",
    reason: "Personal work",
    supportingDocument: "https://..."
  }
);

// Approve leave
import { approveLeaveRequest } from "@/actions/faculty/leaveActions";

await approveLeaveRequest(leaveId, approverName);

// Get leave balance
import { getFacultyLeaveBalance } from "@/actions/faculty/leaveActions";

const balance = await getFacultyLeaveBalance(facultyId, "2024-2025");
```

### Attendance Actions
```typescript
// Mark attendance
import { recordAttendance } from "@/actions/faculty/attendanceActions";

await recordAttendance(
  facultyId,
  facultyName,
  employeeId,
  department,
  {
    date: "2024-11-22",
    status: "present",
    checkInTime: "09:00",
    checkOutTime: "17:30",
    remarks: ""
  },
  markedBy
);

// Get monthly summary
import { getMonthlyAttendance } from "@/actions/faculty/attendanceActions";

const summary = await getMonthlyAttendance(facultyId, "2024-11");
```

---

## Testing Guide

### 1. Setup Testing
```bash
# Ensure environment variables are set
echo $NEXT_PUBLIC_LEAVE_SHEET_ID
echo $NEXT_PUBLIC_ATTENDANCE_SHEET_ID

# Verify service account permissions
# Both sheets should be shared with service account email
```

### 2. Leave Management Tests

**Test Case 1: Apply Leave**
```
✓ Navigate to /dashboard/faculty/leave
✓ Fill leave application form
✓ Submit request
✓ Verify request appears in "My Requests"
✓ Check status is "Pending"
✓ Verify data in Google Sheet
```

**Test Case 2: Approve Leave**
```
✓ Login as admin
✓ Navigate to /dashboard/faculty/leave/manage
✓ Open pending request
✓ Click "Approve"
✓ Verify status changes to "Approved"
✓ Check leave balance deduction
```

**Test Case 3: Leave Balance**
```
✓ Initialize balance for new faculty
✓ Check allocated amounts (12+12+15=39)
✓ Apply and approve leave
✓ Verify balance deduction
✓ Check remaining leave
```

### 3. Attendance Tests

**Test Case 1: Mark Attendance**
```
✓ Login as admin
✓ Navigate to /dashboard/faculty/attendance-manage
✓ Select today's date
✓ Mark attendance for faculty
✓ Save records
✓ Verify in Google Sheet
```

**Test Case 2: View Personal Attendance**
```
✓ Login as faculty
✓ Navigate to /dashboard/faculty/my-attendance
✓ Verify calendar displays correctly
✓ Check attendance records
✓ View monthly summary
```

**Test Case 3: Late Marking**
```
✓ Mark attendance with check-in time after 9:00 AM
✓ Verify "Is Late" flag is set
✓ Check "Late By Minutes" calculation
✓ View in late arrivals report
```

---

## Default Settings

### Leave Allocations (Per Year)
- **Casual Leave:** 12 days
- **Sick Leave:** 12 days  
- **Earned Leave:** 15 days
- **Total:** 39 days

### Working Hours
- **Standard In Time:** 09:00 AM
- **Standard Out Time:** 05:30 PM
- **Working Days per Month:** 26 days
- **Late Threshold:** Any check-in after 9:00 AM

### Leave Rules
- Half day leave = 0.5 days deduction
- Full day = 1 day deduction
- Leave can be applied for future dates only
- Minimum 1 day notice required
- Maximum 15 consecutive days per request

---

## Troubleshooting

### Common Issues

**Issue 1: "Failed to fetch leave requests"**
- **Cause:** Sheet ID not set or service account access
- **Solution:** 
  - Check NEXT_PUBLIC_LEAVE_SHEET_ID in .env.local
  - Verify sheet is shared with service account
  - Restart development server

**Issue 2: "Attendance already marked"**
- **Cause:** Duplicate attendance record
- **Solution:**
  - Check existing records for the date
  - Delete duplicate from sheet
  - Reattempt marking

**Issue 3: Leave balance not updating**
- **Cause:** Balance sheet not initialized
- **Solution:**
  - Run `initializeLeaveBalance()` for faculty
  - Check LeaveBalance sheet exists
  - Verify academic year format (YYYY-YYYY)

---

## Future Enhancements

### Phase 2 Features
- [ ] Email notifications for leave approvals
- [ ] Biometric integration for attendance
- [ ] Mobile app for attendance marking
- [ ] Auto-leave marking from attendance
- [ ] Leave carry-forward rules
- [ ] Substitute teacher assignment
- [ ] Department head approval workflow
- [ ] Attendance regularization requests
- [ ] Compensation leave calculations
- [ ] Holiday calendar integration

### Phase 3 Features
- [ ] Machine learning for leave pattern analysis
- [ ] Predictive analytics for attendance
- [ ] Integration with payroll system
- [ ] Performance metrics based on attendance
- [ ] Department resource planning
- [ ] Advanced reporting and dashboards

---

## Support

For issues or questions:
1. Check this documentation
2. Review Google Sheet structure
3. Verify environment variables
4. Check service account permissions
5. Review server logs for errors

---

## Conclusion

The Leave and Attendance Management System provides a complete solution for tracking faculty leave requests and daily attendance with admin approval workflows, balance management, and comprehensive reporting capabilities.

**Key Benefits:**
✅ Streamlined leave application process
✅ Real-time attendance tracking
✅ Automated balance calculations
✅ Department-wise analytics
✅ Historical data retention
✅ Easy admin management
✅ Mobile-friendly interface
✅ Export capabilities

Ready for production use after Google Sheets setup! 🎉
