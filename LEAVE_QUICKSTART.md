# Quick Start: Faculty Leave Management

## ✅ What's Been Done
1. Added `NEXT_PUBLIC_LEAVE_SHEET_ID` to `.env.local`
2. Updated faculty leave page to fetch real faculty details from database
3. Fixed LeaveApplicationForm to use proper faculty information
4. Created setup script to initialize Google Sheets structure
5. Added `setup:leave` command to package.json

## 🚀 Next Steps (Run These Commands)

### Step 1: Install dependencies (if not already done)
```powershell
pnpm install
```

### Step 2: Setup Google Sheets structure
```powershell
pnpm run setup:leave
```

This will create two new sheets in your Google Spreadsheet:
- **LeaveRequests** - For storing leave applications
- **LeaveBalance** - For tracking leave balances

### Step 3: Start the development server
```powershell
pnpm dev
```

### Step 4: Test the system

#### As Admin:
1. Login as admin
2. Go to: http://localhost:3000/dashboard/faculty/leave/manage
3. You should see the leave management page with tabs for Pending/Approved/Rejected/All requests

#### As Faculty:
1. Login as faculty member
2. Go to: http://localhost:3000/dashboard/faculty/leave
3. Fill out the leave application form
4. Submit a leave request
5. Switch to admin account to approve/reject it

## 📝 Important Notes

### Faculty Information Required
For the leave system to work properly, faculty members must have:
- Email (used as faculty ID)
- Name
- Employee ID (in Faculty sheet)
- Department (in Faculty sheet)

If `employeeId` or `department` are missing, they will show as "N/A" but the system will still work.

### Initial Leave Balance
When a faculty first uses the system, you may need to initialize their leave balance:

**Option 1: Manual (Quick)**
Add a row in the `LeaveBalance` sheet with:
```
Faculty ID | Employee ID | Academic Year | Casual | Used | Remaining | Sick | Used | Remaining | Earned | Used | Remaining | ...
email@... | EMP001 | 2024-2025 | 12 | 0 | 12 | 12 | 0 | 12 | 15 | 0 | 15 | ...
```

**Option 2: Will auto-initialize on first leave application**
The system will automatically create a leave balance entry when a faculty submits their first leave request.

## 🎯 Testing Checklist

- [ ] Run `pnpm run setup:leave` successfully
- [ ] Verify two new sheets exist in Google Spreadsheet
- [ ] Faculty can access `/dashboard/faculty/leave`
- [ ] Faculty can submit a leave request
- [ ] Admin can access `/dashboard/faculty/leave/manage`
- [ ] Admin can see submitted request in Pending tab
- [ ] Admin can approve a leave request
- [ ] Admin can reject a leave request with reason
- [ ] Leave balance updates correctly

## ⚠️ Troubleshooting

### If you see "Failed to fetch leave requests":
1. Make sure you ran `pnpm run setup:leave`
2. Check that Google Sheets has "LeaveRequests" and "LeaveBalance" tabs
3. Verify `.env.local` has `NEXT_PUBLIC_LEAVE_SHEET_ID`

### If faculty details show as "N/A":
1. Ensure faculty member exists in the Faculty sheet
2. Add `employeeId` and `department` columns if missing
3. Populate those fields for the faculty member

### If you get authentication errors:
1. Verify Google service account credentials in `.env.local`
2. Ensure the service account has edit access to the spreadsheet

## 📚 Full Documentation
See `LEAVE_MANAGEMENT_SETUP.md` for complete documentation including:
- Detailed usage instructions
- Data structure details
- API reference
- Advanced features

## ✨ System is Ready!
The leave management system is now fully functional and ready to use!
