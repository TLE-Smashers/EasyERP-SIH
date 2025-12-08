# Faculty Loading Error - Fixed

## What Was Wrong

The error "Failed to fetch faculty by email" was happening because:

1. **Wrong Authentication Method**: The faculty module was using old environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` 
   - `GOOGLE_PRIVATE_KEY`
   
   But it should use the new method:
   - `GOOGLE_SERVICE_ACCOUNT_KEY` (full JSON)

2. **Wrong Sheet ID**: Faculty module was looking for `NEXT_PUBLIC_FACULTY_SHEET_ID`, but all your sheets (Student, Faculty, Hostel, etc.) are in the same Google Spreadsheet, so it should use `GOOGLE_SHEETS_ID`.

## What Was Fixed

### 1. Updated `src/lib/google/sheets.ts`
Changed authentication from:
```typescript
credentials: {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
```

To:
```typescript
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
credentials: JSON.parse(credentials)
```

### 2. Updated `src/lib/google/sheets.faculty.ts`
Changed:
```typescript
const FACULTY_SHEET_ID = process.env.NEXT_PUBLIC_FACULTY_SHEET_ID || "";
```

To:
```typescript
const FACULTY_SHEET_ID = process.env.GOOGLE_SHEETS_ID || "";
```

### 3. Added Better Error Logging
Added console logs to trace:
- When faculty fetch starts
- How many records are fetched
- If the faculty is found by email
- Detailed error messages

## What You Need to Do

### 1. Verify Your `.env.local` File

Make sure you have:

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
```

**You do NOT need:**
- ~~`NEXT_PUBLIC_FACULTY_SHEET_ID`~~
- ~~`GOOGLE_SERVICE_ACCOUNT_EMAIL`~~
- ~~`GOOGLE_PRIVATE_KEY`~~

### 2. Check Your Google Sheet Structure

Your Google Spreadsheet should have multiple **sheets/tabs**:
- **Student** sheet (with student data)
- **Faculty** sheet (with faculty data)
- **Admissions** sheet
- **Hostel** sheet
- etc.

All in the SAME spreadsheet (same Spreadsheet ID).

### 3. Verify Faculty Sheet Has Data

Open your Google Sheet and check the **Faculty** tab:

**Row 1 (Headers):**
```
Timestamp | ID | Full Name | Email | Mobile Number | ... | Department | ... | Status
```

**Row 2+ (Data):**
Make sure `faculty@test.com` exists with:
- **Email**: faculty@test.com
- **Department**: CSE (or whatever department you want)
- **Status**: active

### 4. Restart Your Dev Server

After verifying environment variables:

```powershell
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

### 5. Test Again

1. Navigate to: http://localhost:3000/login
2. Login with:
   - Email: `faculty@test.com`
   - Password: `12345`
3. Go to Faculty Dashboard
4. Click on "View Students"

## Check Console Logs

Now when you test, you'll see detailed logs:

**In Terminal/Server Console:**
```
[fetchAllFaculty] Starting fetch...
[fetchAllFaculty] FACULTY_SHEET_ID: SET
[fetchAllFaculty] Sheet Name: Faculty
[fetchAllFaculty] Rows fetched: 5
[fetchAllFaculty] Faculty records processed: 5
[getFacultyByEmail] Fetching faculty for email: faculty@test.com
[getFacultyByEmail] Total faculty fetched: 5
[getFacultyByEmail] Faculty found: FAC123456
```

**In Browser Console (F12):**
```
[getStudentsByBranch] Called with: { branch: 'CSE', year: undefined }
```

## If Still Getting Errors

Check the console logs to see where it's failing:

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set"
**Fix**: Add `GOOGLE_SERVICE_ACCOUNT_KEY` to `.env.local`

### Error: "GOOGLE_SHEETS_ID environment variable is not set"
**Fix**: Add `GOOGLE_SHEETS_ID` to `.env.local`

### Error: "Failed to fetch data from Google Sheets"
**Fix**: 
1. Verify service account has access to the sheet
2. Check that the spreadsheet ID is correct
3. Verify the "Faculty" tab exists in your sheet

### Logs show "No faculty found with email: faculty@test.com"
**Fix**: 
1. Add faculty@test.com to your Faculty sheet
2. Make sure the email column matches exactly (no extra spaces)
3. Check that Row 1 has headers and data starts from Row 2

## Summary

The main issue was that different modules were using different authentication methods. Now everything uses the same method:
- **Single Spreadsheet ID**: `GOOGLE_SHEETS_ID`
- **Single Auth Method**: `GOOGLE_SERVICE_ACCOUNT_KEY` (full JSON)
- **Multiple Sheets/Tabs**: Student, Faculty, Admissions, Hostel, etc.

This matches how the Student module works, which was already functioning correctly.
