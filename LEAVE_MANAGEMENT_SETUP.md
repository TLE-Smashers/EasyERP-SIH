# Faculty Leave Management System - Setup Guide

## Overview
The Faculty Leave Management System allows faculty members to apply for leave and administrators to approve/reject leave requests. The system tracks leave balances and maintains a complete history of all leave requests.

## Features
- ✅ Faculty can apply for different types of leave (Casual, Sick, Earned, Maternity, Paternity, etc.)
- ✅ Admin can approve/reject leave requests with reasons
- ✅ Leave balance tracking (Casual, Sick, Earned leaves)
- ✅ Complete leave history with status tracking
- ✅ Real-time updates using Google Sheets backend
- ✅ Email notifications (ready for integration)

## Setup Instructions

### Step 1: Environment Configuration
The `.env.local` file has been updated with the required configuration:
```bash
NEXT_PUBLIC_LEAVE_SHEET_ID=1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
```

### Step 2: Initialize Google Sheets Structure
Run the setup script to create the required sheets in your Google Spreadsheet:

```bash
# Using npm
npm run setup:leave

# OR using pnpm  
pnpm run setup:leave

# OR using tsx directly
npx tsx scripts/setupLeaveManagement.ts
```

This script will create two sheets:
1. **LeaveRequests** - Stores all leave applications
2. **LeaveBalance** - Tracks leave balance for each faculty

### Step 3: Add Script to package.json (if not already added)
Add this to your `package.json` scripts section:
```json
{
  "scripts": {
    "setup:leave": "tsx scripts/setupLeaveManagement.ts"
  }
}
```

### Step 4: Verify Sheet Structure
After running the setup script, visit your Google Sheet:
https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit

You should see two new tabs:
- **LeaveRequests** (18 columns: A-R)
- **LeaveBalance** (16 columns: A-P)

### Step 5: Initialize Leave Balance for Faculty
When a new faculty member is added, their leave balance needs to be initialized. This can be done:

**Option A: Manually in Google Sheets**
Add a row in the `LeaveBalance` sheet with:
- Faculty ID (from Faculty sheet)
- Employee ID
- Academic Year (e.g., "2024-2025")
- Default allocations: Casual=12, Sick=12, Earned=15

**Option B: Programmatically**
The system will auto-initialize when a faculty first applies for leave, or you can call:
```typescript
import { createLeaveBalance } from "@/actions/faculty/leaveActions";

await createLeaveBalance(
  "faculty-email@example.com",
  "EMP001",
  "2024-2025"
);
```

## Usage

### For Faculty Members

#### 1. Apply for Leave
Navigate to: `/dashboard/faculty/leave`

Steps:
1. Select **Leave Type** (Casual, Sick, Earned, etc.)
2. Choose **Duration** (Full Day, Half Day First Half, Half Day Second Half)
3. Select **Start Date** and **End Date**
4. Enter **Reason** for leave
5. Click **Submit Leave Request**

#### 2. View Leave History
Go to the "My Requests" tab to see:
- Pending requests
- Approved leaves
- Rejected leaves
- Cancelled leaves

#### 3. Check Leave Balance
Your current leave balance is displayed at the top of the leave page showing:
- Casual Leave (allocated/used/remaining)
- Sick Leave (allocated/used/remaining)
- Earned Leave (allocated/used/remaining)

### For Administrators

#### 1. Access Leave Management
Navigate to: `/dashboard/faculty/leave/manage`

#### 2. Review Leave Requests
View requests by status:
- **Pending** - Requests awaiting approval
- **Approved** - Approved leave requests
- **Rejected** - Rejected leave requests  
- **All Requests** - Complete history

#### 3. Approve Leave
1. Find the request in the Pending tab
2. Click the **Approve** button (green checkmark)
3. Confirmation toast will appear
4. Status updates automatically

#### 4. Reject Leave
1. Find the request in the Pending tab
2. Click the **Reject** button (red X)
3. Enter rejection reason in the dialog
4. Click **Confirm Rejection**
5. Faculty will see the rejection reason

## Leave Types

| Leave Type | Code | Description |
|-----------|------|-------------|
| Casual Leave | `casual` | For personal reasons, planned activities |
| Sick Leave | `sick` | For illness or medical appointments |
| Earned Leave | `earned` | Accumulated leave, usually for vacation |
| Maternity Leave | `maternity` | For expecting mothers |
| Paternity Leave | `paternity` | For new fathers |
| Compensatory Off | `compensatory` | Time off for extra work |
| Leave Without Pay | `unpaid` | Unpaid leave |
| Special Leave | `other` | Other types of leave |

## Leave Balance Allocation (Default)

Annual allocation per faculty:
- **Casual Leave**: 12 days
- **Sick Leave**: 12 days
- **Earned Leave**: 15 days
- **Total**: 39 days per year

## Data Structure

### LeaveRequests Sheet (18 columns)
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | ID | String | Unique leave request ID (LV{timestamp}) |
| B | Faculty ID | String | Faculty email/ID |
| C | Faculty Name | String | Full name of faculty |
| D | Employee ID | String | Employee/Staff ID |
| E | Department | String | Department name |
| F | Leave Type | Enum | Type of leave |
| G | Start Date | Date | Leave start date (YYYY-MM-DD) |
| H | End Date | Date | Leave end date (YYYY-MM-DD) |
| I | Duration | Enum | full_day, half_day_first, half_day_second |
| J | Total Days | Number | Calculated total days |
| K | Reason | Text | Reason for leave |
| L | Status | Enum | pending, approved, rejected, cancelled |
| M | Applied On | DateTime | When request was submitted |
| N | Approved By | String | Who approved/rejected |
| O | Approved On | DateTime | When it was approved |
| P | Rejection Reason | Text | Reason for rejection |
| Q | Supporting Document | URL | Link to any uploaded document |
| R | Timestamp | DateTime | Record creation time |

### LeaveBalance Sheet (16 columns)
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | Faculty ID | String | Faculty email/ID |
| B | Employee ID | String | Employee/Staff ID |
| C | Academic Year | String | e.g., "2024-2025" |
| D | Casual Allocated | Number | Total casual leaves allocated |
| E | Casual Used | Number | Casual leaves used |
| F | Casual Remaining | Number | Casual leaves remaining |
| G | Sick Allocated | Number | Total sick leaves allocated |
| H | Sick Used | Number | Sick leaves used |
| I | Sick Remaining | Number | Sick leaves remaining |
| J | Earned Allocated | Number | Total earned leaves allocated |
| K | Earned Used | Number | Earned leaves used |
| L | Earned Remaining | Number | Earned leaves remaining |
| M | Total Allocated | Number | Total all leaves allocated |
| N | Total Used | Number | Total all leaves used |
| O | Total Remaining | Number | Total all leaves remaining |
| P | Last Updated | DateTime | Last balance update time |

## Navigation Structure

### Admin Module
- Leave Management → `/dashboard/faculty/leave/manage`
  - View all faculty leave requests
  - Approve/Reject requests
  - View statistics

### Faculty Module  
- My Leave → `/dashboard/faculty/leave`
  - Apply for leave
  - View leave history
  - Check leave balance

## Troubleshooting

### Issue: "Failed to fetch leave requests"
**Solution**: 
1. Verify the Google Sheet has "LeaveRequests" tab
2. Run the setup script: `npm run setup:leave`
3. Check `.env.local` has `NEXT_PUBLIC_LEAVE_SHEET_ID` set

### Issue: "Leave balance not found"
**Solution**:
1. Initialize leave balance for the faculty member
2. Ensure "LeaveBalance" sheet exists
3. Add a row for the faculty in LeaveBalance sheet

### Issue: Faculty details showing as "N/A"
**Solution**:
1. Ensure faculty record exists in Faculty sheet
2. Verify `employeeId` and `department` fields are populated
3. Check faculty email matches the login email

### Issue: "Hydration error" or UI not rendering
**Solution**:
1. Clear browser cache
2. Restart the development server
3. Check console for specific errors

## Future Enhancements

- [ ] Email notifications on leave approval/rejection
- [ ] Leave calendar view
- [ ] Bulk leave operations
- [ ] Leave reports and analytics
- [ ] Leave carryforward policy
- [ ] Holiday calendar integration
- [ ] Manager approval hierarchy
- [ ] Document upload for medical certificates

## API Reference

### Actions (Server-side)

```typescript
// Get all leave requests (admin)
getLeaveRequests(): Promise<{success: boolean, data?: LeaveRequest[]}>

// Get faculty's leave requests
getFacultyLeaveRequests(facultyId: string): Promise<{success: boolean, data?: LeaveRequest[]}>

// Submit new leave request
submitLeaveRequest(
  facultyId: string,
  facultyName: string,
  employeeId: string,
  department: string,
  formData: LeaveFormData
): Promise<{success: boolean, message: string}>

// Approve leave request
approveLeaveRequest(
  leaveId: string,
  approvedBy: string
): Promise<{success: boolean, message: string}>

// Reject leave request
rejectLeaveRequest(
  leaveId: string,
  approvedBy: string,
  rejectionReason: string
): Promise<{success: boolean, message: string}>

// Get leave balance
getFacultyLeaveBalance(
  facultyId: string,
  academicYear: string
): Promise<{success: boolean, data?: LeaveBalance}>
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Google Sheets structure
3. Verify environment variables
4. Check browser console for errors

## System Status
✅ Leave application form - Working
✅ Leave approval/rejection - Working
✅ Leave balance tracking - Working
✅ Leave history - Working
✅ Admin dashboard - Working
✅ Faculty dashboard - Working
✅ Google Sheets integration - Working
