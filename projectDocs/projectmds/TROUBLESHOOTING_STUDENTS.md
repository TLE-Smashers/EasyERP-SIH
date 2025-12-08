# Faculty Students Loading - Troubleshooting Guide

## Problem: "Failed to load students" error

If you're seeing this error, follow these steps to diagnose and fix:

## 1. Check Environment Variables

Make sure your `.env.local` file has:

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

### How to get Spreadsheet ID:
Open your Google Sheet and look at the URL:
```
https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SPREADSHEET_ID]/edit
```

## 2. Verify Sheet Name

The sheet must be named exactly **"Student"** (case-sensitive)
- Not "Students" 
- Not "student"
- Must be "Student"

## 3. Check Google Service Account Permissions

### Setup Steps:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Enable Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click Enable

3. **Create Service Account** (if not already created):
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "erp-sheets-access")
   - Click "Create and Continue"
   - Skip role assignment (click Continue)
   - Click Done

4. **Create Service Account Key**:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the downloaded file
   - Copy its contents to `GOOGLE_SERVICE_ACCOUNT_KEY` in `.env.local`

5. **Share Google Sheet with Service Account**:
   - Open your Google Sheet
   - Click "Share" button
   - Paste the service account email (looks like: `your-service@project-id.iam.gserviceaccount.com`)
   - Give it "Editor" access
   - Uncheck "Notify people"
   - Click Share

## 4. Verify Sheet Structure

Your Student sheet should have these exact columns (A-P) in Row 1:

```
_Id | enrollmentNumber | fullName | gender | dateOfBirth | email | mobileNumber | category | course | branch | admissionYear | admissionDate | currentYear | currentSemester | guardianName | photoUrl
```

**Important**: 
- Row 1 = Headers
- Row 2 onwards = Data
- At least one student must have `branch` matching the faculty's `department`

## 5. Check Faculty Setup

In your Faculty sheet, make sure faculty@test.com has:
- **Email**: faculty@test.com
- **Department/Branch**: Must match exactly with student `branch` values (e.g., "CSE", "ECE")
- **Status**: active

## 6. Debug with Console Logs

After making changes, check the browser console (F12) and terminal logs for:

### Browser Console (F12):
```
[getStudentsByBranch] Called with: { branch: 'CSE', year: undefined }
```

### Server/Terminal Logs:
```
Attempting to fetch students from Student sheet...
Spreadsheet ID: 1234...
Sheet Name: Student
Fetched X rows from Student sheet
Total students fetched: X
Students in branch CSE: X
```

## 7. Common Errors and Solutions

### Error: "GOOGLE_SHEETS_ID environment variable is not set"
**Solution**: Add `GOOGLE_SHEETS_ID` to your `.env.local` file

### Error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set"
**Solution**: Add `GOOGLE_SERVICE_ACCOUNT_KEY` to your `.env.local` file

### Error: "Unable to parse range: Student!A2:P"
**Solution**: 
- Rename your sheet to exactly "Student"
- Make sure it's not "Students" or any other variation

### Error: "The caller does not have permission"
**Solution**: 
- Share the Google Sheet with your service account email
- Give it Editor permissions

### Error: "Fetched 0 rows from Student sheet"
**Solution**: 
- Make sure Row 1 has headers
- Make sure Row 2+ has data
- Check if the sheet "Student" has any data

### Error: "Students in branch CSE: 0"
**Solution**: 
- Check that student `branch` values match exactly with faculty `department`
- Case-sensitive: "CSE" ≠ "cse" ≠ "Cse"
- Check for extra spaces in branch names

## 8. Test with Sample Data

Add this test student to your Student sheet (Row 2):

```
1 | TEST001 | Test Student | Male | 2005-01-01 | test@test.com | 9999999999 | General | B.Tech | CSE | 2021 | 2021-08-01 | 1 | 1 | Test Guardian | https://example.com/photo.jpg
```

Make sure faculty@test.com has `department = "CSE"` in Faculty sheet.

## 9. Restart Development Server

After making environment variable changes:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## 10. No AppScript Needed

**Important**: You do NOT need to add any Apps Script code to your Google Sheets. The integration works directly through the Google Sheets API using service account authentication.

## Still Having Issues?

Check the logs in this order:

1. **Terminal/Server logs** - Look for the fetch attempt messages
2. **Browser Console** - Look for action call logs
3. **Network tab** (F12 > Network) - Check if API calls are being made
4. **Environment variables** - Double-check they're set correctly

If you see "Faculty data not found", the issue is with faculty@test.com not being in the Faculty sheet or not having the correct structure.
