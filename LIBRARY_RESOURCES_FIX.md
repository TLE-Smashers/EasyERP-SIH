# Library Resources - Issue Fix Report

## Problem Identified

The Library Resources feature was failing to fetch resources with a toast notification error. The root cause was **incorrect environment variable names** in the Google Sheets integration code.

## Root Cause Analysis

The `sheets.resources.ts` file was using different environment variable names than the rest of the codebase:

### ❌ Incorrect (Before Fix):
```typescript
// Wrong credential variable
const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');

// Wrong spreadsheet ID variable
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
```

### ✅ Correct (After Fix):
```typescript
// Correct credential variable (matches rest of codebase)
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (!credentials) {
  throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
}
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(credentials),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Correct spreadsheet ID variable (matches rest of codebase)
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
```

## Changes Made

### File: `src/lib/google/sheets.resources.ts`

**1. Fixed `getSheetsClient()` function:**
- Changed `GOOGLE_SHEETS_CREDENTIALS` → `GOOGLE_SERVICE_ACCOUNT_KEY`
- Added proper error handling for missing credentials
- Added JSON.parse() for the credentials string

**2. Fixed all spreadsheet ID references (4 locations):**
- Changed `GOOGLE_SHEETS_SPREADSHEET_ID` → `GOOGLE_SHEETS_ID`
- Affected functions:
  - `generateResourceId()` (line ~99)
  - `uploadResource()` (line ~137)
  - `getAllResources()` (line ~218)
  - `incrementDownloadCount()` (line ~315)
  - `updateResource()` (line ~352)

## Environment Variables Used in Codebase

Based on analysis of all Google Sheets integration files in the project:

### Standard Variables (Used by all other modules):
```
GOOGLE_SERVICE_ACCOUNT_KEY    # JSON string of service account credentials
GOOGLE_SHEETS_ID              # Spreadsheet ID
```

### Files Using Correct Variables:
- `sheets.ts`
- `sheets.library.ts`
- `sheets.faculty.ts`
- `sheets.admission.ts`
- `sheets.examScores.ts`
- `hostelRoomManagement.ts`
- `hostelSheet.ts`
- `sheets.notices.ts`

## Verification Steps

✅ **Compilation Check:** No TypeScript errors
✅ **Environment Variables:** Now matches rest of codebase
✅ **Error Handling:** Added proper validation for missing credentials
✅ **All Functions Updated:** 5 functions now use correct variable names

## Expected Behavior After Fix

1. **On Resource Fetch:**
   - System will correctly read `GOOGLE_SHEETS_ID` from environment
   - System will correctly parse `GOOGLE_SERVICE_ACCOUNT_KEY` credentials
   - Google Sheets API authentication will succeed
   - Resources will be fetched from `LibraryResources` sheet

2. **On Resource Upload:**
   - Uploads will work for both librarians and faculty
   - Resources will be correctly written to the sheet

3. **On Download:**
   - Download count will increment correctly

## Testing Checklist

After this fix, please verify:

- [ ] Student can view resources page without errors
- [ ] Resources load from the `LibraryResources` sheet
- [ ] Librarian can upload e-books
- [ ] Faculty can upload resources
- [ ] Download button works and increments counter
- [ ] Search and filter functionality works
- [ ] Archive/unarchive operations work

## Environment Variable Setup Reminder

Make sure your `.env.local` file contains:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID="your-spreadsheet-id-here"
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Note:** The service account key should be a valid JSON string with proper escaping.

## Additional Notes

- The `LibraryResources` sheet must exist in your Google Spreadsheet
- The sheet must have the correct column structure (A-R) as specified in `LIBRARY_RESOURCES_SHEET_SETUP.md`
- The service account must have edit permissions on the spreadsheet

## Summary

The issue was a simple but critical mismatch in environment variable names. The library resources module was looking for variables that don't exist in your environment configuration. After aligning with the standard variable names used throughout the codebase, the feature should now work correctly.

---

**Fixed on:** December 8, 2025  
**Status:** ✅ Complete  
**Files Modified:** 1 (`src/lib/google/sheets.resources.ts`)  
**Lines Changed:** ~10 lines across 5 functions
