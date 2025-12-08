# ✅ Document Upload Issue - FIXED

## Problem
Documents uploaded via Google Forms were showing as "Not Uploaded" in Step 3, even though they were uploaded and stored in Google Drive.

## Root Cause
Google Forms creates **separate columns** for each file upload field in the spreadsheet, not a single "Documents" column.

**Before (Incorrect):**
- Expected all documents in Column 18 as JSON
- Google Forms actually creates: Column 18 (10th Marksheet), Column 19 (12th Marksheet), etc.

## Solution Applied

### 1. Updated Column Mapping (`/src/lib/google/sheets.admission.ts`)

**Old Structure (Incorrect):**
```typescript
// Column 18: Document Links (JSON or pipe-separated)
const documentLinks = parseDocumentLinks(row[18] || "");
```

**New Structure (Correct):**
```typescript
// Column 18: 10th Marksheet (Google Drive URL)
// Column 19: 12th Marksheet (Google Drive URL)
// Column 20: Photo (Google Drive URL)
// Column 21: ID Proof (Google Drive URL)
const documentLinks = {
  marksheet10th: row[18] || undefined,
  marksheet12th: row[19] || undefined,
  photo: row[20] || undefined,
  idProof: row[21] || undefined,
};
```

### 2. Updated Processing Columns Index
Since document columns shifted from 1 column to 4 columns, all processing columns moved:

**Old:** Application Status at Column 19
**New:** Application Status at Column 22

**Updated mapping:**
- Column 22: Application Status
- Column 23: Documents Verified
- Column 24: Verified By
- Column 25: Verified Date
- Column 26: Verification Notes
- Column 27: Payment Status
- ... (all shifted by 3 positions)

### 3. Simplified Document List in Step 3
Updated to show only the 4 documents that Google Forms collects:
- ✅ 10th Marksheet
- ✅ 12th Marksheet
- ✅ Passport Size Photo
- ✅ ID Proof / Aadhar Card

### 4. Added UI Improvements
- Document counter badge (e.g., "3 / 4 uploaded")
- Info banner explaining Google Drive storage
- Better visual feedback for uploaded/missing documents

## How Google Forms Works

When you add file upload questions in Google Forms:
1. Student uploads file through form
2. File is stored in Google Drive (your Google Drive)
3. Form records the Google Drive URL in the spreadsheet
4. ERP reads the URL and displays "View" and "Download" buttons

**Example URL format:**
```
https://drive.google.com/open?id=1abc123xyz456...
```

## Updated Column Structure

Your **Admissions** tab should now have these columns:

```
A: Timestamp
B: Email
C: Full Name
...
Q: Course
R: Branch
S: 10th Marksheet      ← Google Drive URL
T: 12th Marksheet      ← Google Drive URL
U: Photo               ← Google Drive URL
V: ID Proof            ← Google Drive URL
W: Application Status
X: Documents Verified
Y: Verified By
...
```

## Testing

1. **Submit a test form** with file uploads
2. **Check the Admissions tab** in Google Sheets
   - Columns S, T, U, V should have Google Drive URLs
3. **Open application in ERP**
   - Go to Step 3: Document Review
   - You should see documents marked as uploaded
   - Click "View" to open them

## Files Updated

- ✅ `/src/lib/google/sheets.admission.ts` - Fixed column mapping
- ✅ `/src/app/dashboard/admission/applications/[id]/steps/Step3DocumentReview.tsx` - Updated UI
- ✅ `/FIX_ERRORS_NOW.md` - Updated column structure guide
- ✅ `/ADMISSIONS_INTEGRATION_STEPS.md` - Updated setup instructions

## Important Notes

1. **File upload permissions:** Make sure Google Forms has permission to upload to your Drive
2. **File privacy:** By default, uploaded files are private to the form owner
3. **View permissions:** The service account needs access to view files (should work automatically)
4. **File types:** Recommended to allow PDF and images (JPG, PNG) only

---

**Status:** ✅ Fixed - Documents will now display correctly in Step 3!
