# Faculty Request System - Spreadsheet ID Fix

## Problem Fixed
❌ **Before**: Faculty requests failing with 404 "Requested entity was not found" error because Column D in Faculty tab contained dummy value "ABC"

✅ **After**: Simplified data flow where Column D (Institution ID) in Faculty tab directly contains the actual Google Spreadsheet ID

---

## Updated Architecture

### Super Master Sheet > Faculty Tab
| Column | Field | Description | Example |
|--------|-------|-------------|---------|
| A | Faculty ID | Unique identifier | `FAC001` |
| B | Name | Faculty full name | `Dr. Ayesha Khan` |
| C | Email | Faculty email (used for queries) | `ayesha.khan@gec.ac.in` |
| **D** | **Institution ID** | **Actual Google Spreadsheet ID** | `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw` |
| E | Institution Name | Display name | `Government Engineering College, Ajmer` |
| F | Department | Faculty department | `Computer Science` |
| G | Specialization | Area of expertise | `Artificial Intelligence` |
| H | Designation | Position title | `Associate Professor` |
| I | Status | Active/Inactive | `Active` |

### Key Change
**Column D must contain the actual Google Spreadsheet ID** (the long alphanumeric string in the spreadsheet URL), not a manual ID like "ABC" or "INST001".

---

## How It Works

### Data Flow (Student Request)
1. **Student selects faculty** from list (fetched from Super Master > Faculty tab)
2. **Query by email**: System finds faculty row using Column C (Email)
3. **Get spreadsheet ID**: Extract Column D (Institution ID) which IS the actual Google Spreadsheet ID
4. **Store request**: Create Faculty_Requests entry in that spreadsheet

### Code Implementation
```typescript
// src/actions/federation/facultyRequests.ts

async function getFacultySheetId(facultyEmail: string) {
  // Query Super Master Sheet > Faculty tab
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SUPER_MASTER_SHEET_ID,
    range: "Faculty!A2:I",
  });

  // Find faculty by email (Column C)
  const facultyRow = rows.find(row => row[2] === facultyEmail);
  
  // Column D is the actual Google Spreadsheet ID
  const sheetId = facultyRow[3]; // This is the spreadsheet ID!
  const institutionName = facultyRow[4];
  
  return { sheetId, institutionName };
}

async function createFacultyRequest(data) {
  const facultyInfo = await getFacultySheetId(data.facultyEmail);
  const facultySheetId = facultyInfo.sheetId; // Direct spreadsheet ID
  
  // Store request in faculty's institution sheet
  await initializeFacultyRequestsSheet(facultySheetId);
  // ... create request
}
```

---

## Required Data Update

### Current Super Master Sheet Faculty Data
```
Row 2: FAC001 | Dr. Ayesha Khan | ayesha.khan@gec.ac.in | ABC | GEC | CS | AI | Assoc Prof | Active
                                                           ^^^
                                                         PROBLEM: "ABC" is not a valid spreadsheet ID
```

### Correct Super Master Sheet Faculty Data
```
Row 2: FAC001 | Dr. Ayesha Khan | ayesha.khan@gec.ac.in | 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw | GEC | CS | AI | Assoc Prof | Active
                                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                           CORRECT: Actual Google Spreadsheet ID
```

### How to Get Spreadsheet ID
1. Open the faculty member's institution spreadsheet in Google Sheets
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
3. Copy the long alphanumeric string between `/d/` and `/edit`
4. Paste it into Column D of the Faculty tab in Super Master Sheet

Example URL:
```
https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       This is the Spreadsheet ID to use!
```

---

## Testing Steps

### 1. Update Faculty Data
```
Super Master Sheet > Faculty tab > Column D
Replace "ABC" with actual spreadsheet ID like "1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw"
```

### 2. Test Student Request Flow
1. Login as student
2. Go to Faculty Request page (`/dashboard/student/faculty-request`)
3. Select faculty member (e.g., Dr. Ayesha Khan)
4. Fill in request details (subject, description, preferred date/time)
5. Submit request
6. **Expected**: Request stored successfully in faculty's spreadsheet

### 3. Verify Data Storage
```
Faculty's Institution Sheet > Faculty_Requests tab
Should contain:
- Request ID (REQ-timestamp)
- Student details (email, name, institution)
- Faculty details (email, name)
- Request details (subject, description, preferred date/time)
- Status: Pending
```

### 4. Test Faculty View
1. Login as faculty member
2. Go to Faculty Requests page (`/dashboard/faculty/requests`)
3. **Expected**: See pending requests from students
4. Approve/reject request
5. **Expected**: Status updated, student and faculty both see changes

---

## Files Modified

### src/actions/federation/facultyRequests.ts
- ✅ Renamed `getFacultyInstitutionSheetId()` to `getFacultySheetId()`
- ✅ Simplified return type: only `{ sheetId, institutionName }`
- ✅ Direct usage: Column D = actual spreadsheet ID
- ✅ Removed intermediate institution lookup
- ✅ Updated error messages to be more specific

### Key Changes
```typescript
// Before:
const facultyInstitution = await getFacultyInstitutionSheetId(email);
const facultySheetId = facultyInstitution.sheetId;
const institutionId = facultyInstitution.institutionId; // Redundant!

// After:
const facultyInfo = await getFacultySheetId(email);
const facultySheetId = facultyInfo.sheetId; // Column D is the spreadsheet ID
```

---

## What This Enables

### ✅ Cross-Institution Collaboration
- Students from any institution can request faculty from any other institution
- No need for manual institution configuration in Institutions tab
- Simple data model: just update Faculty tab with spreadsheet IDs

### ✅ Dual Storage
- Request stored in **faculty's institution sheet** (Faculty_Requests tab)
- Also stored in **student's institution sheet** (for their records)
- Faculty sees requests in their dashboard
- Student sees their sent requests

### ✅ Simplified Architecture
```
Super Master Sheet (Read-Only for Students)
└── Faculty Tab: Contains all faculty from all institutions
    └── Column D: Actual Google Spreadsheet ID

Institution Sheet (Faculty's)
├── Faculty_Requests: Stores incoming requests
└── Faculty_Request_Messages: Stores conversation threads

Institution Sheet (Student's)
├── Faculty_Requests: Stores outgoing requests (copy)
└── Faculty_Request_Messages: Stores conversation threads
```

---

## Debugging

### If 404 Error Persists
1. **Check Column D value**:
   ```typescript
   console.log("Faculty sheet ID:", facultyInfo.sheetId);
   // Should output: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
   // NOT: ABC or INST001
   ```

2. **Verify spreadsheet exists**:
   - Open Google Sheets
   - Go to URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Replace `SPREADSHEET_ID_HERE` with the value from Column D
   - Should open successfully

3. **Check service account permissions**:
   - Faculty's institution spreadsheet must be shared with service account email
   - Service account: `easy-erp-sih@easy-erp-sih.iam.gserviceaccount.com`
   - Share with "Editor" permissions

### Console Logs to Check
```typescript
// In getFacultySheetId():
console.log("Searching for faculty email:", facultyEmail);
console.log("Found faculty sheet ID:", { sheetId, institutionName });

// In createFacultyRequest():
console.log("Faculty info:", facultyInfo);
console.log("Storing request in sheet:", facultySheetId);
```

---

## Summary

**The Fix**: Column D in Super Master Sheet > Faculty tab must contain **actual Google Spreadsheet IDs**, not dummy values like "ABC".

**Why**: The system directly uses Column D as the spreadsheet ID to store Faculty_Requests data.

**Action Required**: Update Column D for all faculty members with their institution's actual Google Spreadsheet ID (get it from the spreadsheet URL).

**Result**: Students can request faculty from any institution, and requests are stored in the correct faculty institution sheet for approval/rejection.
