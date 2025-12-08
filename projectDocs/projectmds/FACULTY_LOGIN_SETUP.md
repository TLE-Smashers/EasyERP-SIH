# Faculty Login Setup - Complete Guide

## Overview
The system now supports faculty login using the actual Faculty sheet structure with credentials:
- **Email**: ayesha.kapoor@univ.edu
- **Password**: 12345

## Faculty Sheet Structure

Your Faculty sheet should have these columns (Row 1 = Headers):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| facultyId | fullName | email | mobileNumber | gender | dateOfBirth | photoUrl | designation | branch | joiningDate | assignedSubjects | assignedClasses | accessRole | status | createdBy | createdDate | updatedBy | updatedDate |

### Sample Faculty Data (Row 2)

```
FAC001 | Ayesha Kapoor | ayesha.kapoor@univ.edu | 9876543210 | Female | 1990-05-15 | https://example.com/photo.jpg | Professor | CSE | 2020-08-01 | Computer Networks,Database Systems | CSE-3A,CSE-3B | faculty | active | admin | 2024-01-01 | admin | 2024-01-01
```

## Authentication Flow

### 1. Login Process
When a faculty member logs in with email and password:

1. System checks **Faculty** sheet first
   - Matches email: `ayesha.kapoor@univ.edu`
   - Password: `12345` (plain text, no hashing)
   - If found → Login as faculty

2. If not in Faculty sheet, checks **Users** sheet
   - For admin, librarian, etc.
   - Uses bcrypt hashed passwords

3. If not in Users sheet, checks **Student** sheet
   - For student login
   - Password = mobile number (plain text)

### 2. Faculty Authentication
```typescript
// Faculty users (like students) use plain text passwords
if (user.role === 'student' || user.role === 'faculty') {
    isPasswordValid = credentials.password === user.password; // Plain text
} else {
    isPasswordValid = await bcrypt.compare(...); // Hashed for others
}
```

## Environment Variables

Make sure your `.env.local` has:

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

**Note**: You do NOT need `NEXT_PUBLIC_FACULTY_SHEET_ID` anymore. All sheets use the same `GOOGLE_SHEETS_ID`.

## Testing Steps

### 1. Add Faculty to Sheet

Add this row to your Faculty sheet (after the header):

```
FAC001	Ayesha Kapoor	ayesha.kapoor@univ.edu	9876543210	Female	1990-05-15		Professor	CSE	2020-08-01	Computer Networks,Database Systems	CSE-3A,CSE-3B	faculty	active	admin	2024-01-01		
```

**Important**: 
- Column I (branch) should be "CSE" or match your student branches
- Column N (status) must be "active"

### 2. Restart Server

```powershell
npm run dev
```

### 3. Login

1. Go to: http://localhost:3000/login
2. Enter credentials:
   - Email: `ayesha.kapoor@univ.edu`
   - Password: `12345`
3. Click Login

### 4. Access Faculty Dashboard

After login, you'll be redirected to: http://localhost:3000/dashboard/faculty

From there you can:
- **View Students**: See students from your branch (CSE)
- **Mark Attendance**: Mark attendance for students
- **Upload Marks**: Enter exam marks

## Data Fetching

### Faculty Data
Faculty information is fetched from the Faculty sheet with this structure:

```typescript
{
  id: "FAC001",
  personalDetails: {
    fullName: "Ayesha Kapoor",
    email: "ayesha.kapoor@univ.edu",
    mobileNumber: "9876543210",
    gender: "Female",
    dateOfBirth: "1990-05-15"
  },
  professionalDetails: {
    employeeId: "FAC001",
    designation: "Professor",
    department: "CSE", // This is the branch field
    dateOfJoining: "2020-08-01"
  },
  status: "active"
}
```

### Student Data
When viewing students, the system:
1. Gets faculty branch from Faculty sheet (column I)
2. Fetches students from Student sheet
3. Filters students by matching branch

## Troubleshooting

### Error: "No user found with this email"
**Solution**: 
- Check that `ayesha.kapoor@univ.edu` exists in Faculty sheet
- Verify email is in column C (email)
- Check spelling and no extra spaces

### Error: "Invalid email or password"
**Solution**:
- Password must be exactly `12345`
- No hashing - plain text comparison
- Check there are no extra spaces

### Error: "Your account has been deactivated"
**Solution**:
- Check column N (status) is "active" not "inactive"

### Error: "Failed to fetch faculty by email"
**Solution**:
- Verify `GOOGLE_SHEETS_ID` is set in `.env.local`
- Check Google Sheet has a tab named exactly "Faculty"
- Verify service account has access to the sheet

### Error: "Failed to load students"
**Solution**:
- Check that Student sheet exists
- Verify students have branch = "CSE" (or whatever faculty's branch is)
- Check Student sheet structure matches: _Id, enrollmentNumber, fullName, etc.

## Console Logs

When testing, check your terminal for these logs:

```
[getUserByEmail] Looking for user: ayesha.kapoor@univ.edu
[getUserByEmail] Faculty sheet rows: 5
[getUserByEmail] Faculty user found: Ayesha Kapoor
[fetchAllFaculty] Starting fetch...
[fetchAllFaculty] Rows fetched: 5
[fetchAllFaculty] Faculty records processed: 5
[getFacultyByEmail] Fetching faculty for email: ayesha.kapoor@univ.edu
[getFacultyByEmail] Faculty found: FAC001
```

## Key Changes Made

### 1. Updated Authentication (`src/actions/auth/getUserByEmail.ts`)
- Now checks Faculty sheet first
- Falls back to Users sheet, then Student sheet
- Faculty password is hardcoded as "12345" (plain text)

### 2. Updated Auth Config (`src/lib/auth/auth.config.ts`)
- Faculty users treated like students (plain text password)
- No bcrypt hashing for faculty

### 3. Updated Faculty Sheet Integration (`src/lib/google/sheets.faculty.ts`)
- Uses direct Google Sheets API (not old `sheets.ts` wrapper)
- Matches your actual Faculty sheet columns
- Uses `GOOGLE_SHEETS_ID` instead of `NEXT_PUBLIC_FACULTY_SHEET_ID`

## Important Notes

1. **Same Spreadsheet**: All sheets (Student, Faculty, Admissions, etc.) are in the SAME Google Spreadsheet
2. **Different Tabs**: Each is a different tab/sheet within that spreadsheet
3. **Single Auth Key**: Uses one `GOOGLE_SERVICE_ACCOUNT_KEY` for all sheets
4. **Plain Text Password**: Faculty users use "12345" as password (no hashing)
5. **Branch Matching**: Faculty branch (column I) must match Student branch for filtering to work

## What's Working Now

✅ Faculty can login with email and password (12345)
✅ Faculty data fetched from actual Faculty sheet structure
✅ Student filtering by faculty branch
✅ Attendance marking
✅ Marks upload
✅ All using the same Google Sheets authentication method
