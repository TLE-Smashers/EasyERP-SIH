# Admissions Sheet Setup Guide

## Overview
This guide helps you set up a two-sheet system:
1. **AdmissionsForm** - Raw Google Form responses (auto-generated)
2. **Admissions** - Clean data with camelCase columns for the app

## Step 1: Prepare Your Google Sheet

### 1.1 Rename Current Sheet
1. Rename your current "Admissions" sheet to **"AdmissionsForm"**
2. This will continue receiving Google Form responses

### 1.2 Create New Admissions Sheet
1. Create a new sheet named **"Admissions"**
2. Add the following header row (Row 1):

```
timestamp	fullName	email	mobileNumber	dateOfBirth	address	guardianName	guardianContact	school10th	board10th	marks10th	yearOfPassing10th	school12th	board12th	marks12th	yearOfPassing12th	course	branch	marksheet10th	marksheet12th	entranceExamMarksheet	allotmentLetter	transferCertificate	characterCertificate	domicileCertificate	casteCertificate	idProof	photo	gapCertificate	applicationStatus	documentsVerified	verifiedBy	verifiedDate	locked	lockedBy	lockedDate	finalRemarks
```

### Column Mapping (36 columns total)

| Column | Field Name | Type | Description |
|--------|-----------|------|-------------|
| A | timestamp | DateTime | Form submission timestamp |
| B | fullName | String | Student full name |
| C | email | String | Email address |
| D | mobileNumber | String | Mobile number |
| E | dateOfBirth | String | Date of birth |
| F | address | String | Full address |
| G | guardianName | String | Guardian/parent name |
| H | guardianContact | String | Guardian contact number |
| I | school10th | String | 10th school name |
| J | board10th | String | 10th board |
| K | marks10th | String | 10th marks/percentage |
| L | yearOfPassing10th | String | 10th passing year |
| M | school12th | String | 12th school name |
| N | board12th | String | 12th board |
| O | marks12th | String | 12th marks/percentage |
| P | yearOfPassing12th | String | 12th passing year |
| Q | course | String | Selected course |
| R | branch | String | Selected branch |
| S | marksheet10th | URL | 10th marksheet (Google Drive) |
| T | marksheet12th | URL | 12th marksheet (Google Drive) |
| U | entranceExamMarksheet | URL | Entrance exam marksheet |
| V | allotmentLetter | URL | Allotment letter |
| W | transferCertificate | URL | Transfer certificate |
| X | characterCertificate | URL | Character certificate |
| Y | domicileCertificate | URL | Domicile certificate |
| Z | casteCertificate | URL | Caste certificate |
| AA | idProof | URL | ID proof/Aadhar card |
| AB | photo | URL | Student photo |
| AC | gapCertificate | URL | Gap certificate (if any) |
| AD | applicationStatus | String | Status: pending/documents_verified/completed/rejected |
| AE | documentsVerified | Boolean | TRUE/FALSE |
| AF | verifiedBy | String | Email of verifier |
| AG | verifiedDate | DateTime | Verification timestamp |
| AH | locked | Boolean | TRUE/FALSE (admission completed) |
| AI | lockedBy | String | Email of who locked |
| AJ | lockedDate | DateTime | Lock timestamp |
| AK | finalRemarks | String | Final remarks/notes |

## Step 2: Install AppScript

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Paste the following script:

```javascript
// Configuration
const SOURCE_SHEET_NAME = 'AdmissionsForm'; // Form responses
const TARGET_SHEET_NAME = 'Admissions';     // App data

// Column mapping from Form to App
// Form columns are 0-indexed
const COLUMN_MAPPING = {
  // Format: targetColumn: sourceColumnIndex
  'timestamp': 0,           // A -> A
  'fullName': 1,            // B -> B
  'email': 2,               // C -> C
  'mobileNumber': 3,        // D -> D
  'dateOfBirth': 4,         // E -> E
  'address': 5,             // F -> F
  'guardianName': 6,        // G -> G
  'guardianContact': 7,     // H -> H
  'school10th': 8,          // I -> I
  'board10th': 9,           // J -> J
  'marks10th': 10,          // K -> K
  'yearOfPassing10th': 11,  // L -> L
  'school12th': 12,         // M -> M
  'board12th': 13,          // N -> N
  'marks12th': 14,          // O -> O
  'yearOfPassing12th': 15,  // P -> P
  'course': 16,             // Q -> Q
  'branch': 17,             // R -> R
  'marksheet10th': 18,      // S -> S
  'marksheet12th': 19,      // T -> T
  'entranceExamMarksheet': 20, // U -> U
  'allotmentLetter': 21,    // V -> V
  'transferCertificate': 22, // W -> W
  'characterCertificate': 23, // X -> X
  'domicileCertificate': 24, // Y -> Y (fixed typo: domicile)
  'casteCertificate': 25,   // Z -> Z
  'idProof': 26,            // AA -> AA
  'photo': 27,              // AB -> AB
  'gapCertificate': 28,     // AC -> AC
};

// Target sheet headers (must match exactly)
const TARGET_HEADERS = [
  'timestamp', 'fullName', 'email', 'mobileNumber', 'dateOfBirth', 
  'address', 'guardianName', 'guardianContact', 'school10th', 'board10th', 
  'marks10th', 'yearOfPassing10th', 'school12th', 'board12th', 'marks12th', 
  'yearOfPassing12th', 'course', 'branch', 'marksheet10th', 'marksheet12th', 
  'entranceExamMarksheet', 'allotmentLetter', 'transferCertificate', 
  'characterCertificate', 'domicileCertificate', 'casteCertificate', 
  'idProof', 'photo', 'gapCertificate', 'applicationStatus', 
  'documentsVerified', 'verifiedBy', 'verifiedDate', 'locked', 
  'lockedBy', 'lockedDate', 'finalRemarks'
];

/**
 * Trigger: Runs automatically when a form is submitted
 * Uses event object to get the exact row that was submitted
 */
function onFormSubmit(e) {
  try {
    Logger.log('Form submitted, processing...');
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = sheet.getSheetByName(SOURCE_SHEET_NAME);
    const targetSheet = sheet.getSheetByName(TARGET_SHEET_NAME);
    
    if (!sourceSheet) {
      throw new Error(`Source sheet "${SOURCE_SHEET_NAME}" not found`);
    }
    
    if (!targetSheet) {
      throw new Error(`Target sheet "${TARGET_SHEET_NAME}" not found`);
    }
    
    // Use event object to get the exact row number that was submitted
    // This works even if the sheet is sorted!
    let sourceData;
    let submittedRow;
    
    if (e && e.range) {
      // Get row from event object (most reliable)
      submittedRow = e.range.getRow();
      sourceData = sourceSheet.getRange(submittedRow, 1, 1, 29).getValues()[0];
      Logger.log('Using event row: ' + submittedRow);
    } else {
      // Fallback: get last row (only if event object not available)
      submittedRow = sourceSheet.getLastRow();
      sourceData = sourceSheet.getRange(submittedRow, 1, 1, 29).getValues()[0];
      Logger.log('Using last row: ' + submittedRow);
    }
    
    Logger.log('Source data retrieved: ' + sourceData.length + ' columns');
    
    // Build target row
    const targetRow = buildTargetRow(sourceData);
    
    // Append to target sheet
    targetSheet.appendRow(targetRow);
    
    Logger.log('Successfully copied data to ' + TARGET_SHEET_NAME);
    
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    // Send email notification on error (optional)
    // MailApp.sendEmail('your-email@example.com', 'Form Sync Error', error.toString());
  }
}

/**
 * Build target row from source data
 */
function buildTargetRow(sourceData) {
  const targetRow = new Array(TARGET_HEADERS.length).fill('');
  
  // Map form data to target columns
  Object.keys(COLUMN_MAPPING).forEach(function(targetField) {
    const sourceIndex = COLUMN_MAPPING[targetField];
    const targetIndex = TARGET_HEADERS.indexOf(targetField);
    
    if (targetIndex !== -1 && sourceIndex < sourceData.length) {
      targetRow[targetIndex] = sourceData[sourceIndex] || '';
    }
  });
  
  // Set default values for new fields
  const statusIndex = TARGET_HEADERS.indexOf('applicationStatus');
  if (statusIndex !== -1) {
    targetRow[statusIndex] = 'pending';
  }
  
  const docsVerifiedIndex = TARGET_HEADERS.indexOf('documentsVerified');
  if (docsVerifiedIndex !== -1) {
    targetRow[docsVerifiedIndex] = 'FALSE';
  }
  
  const lockedIndex = TARGET_HEADERS.indexOf('locked');
  if (lockedIndex !== -1) {
    targetRow[lockedIndex] = 'FALSE';
  }
  
  return targetRow;
}

/**
 * Manual sync: Copy all existing data from AdmissionsForm to Admissions
 * Run this ONCE to migrate existing data
 */
function manualSyncAllData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const sourceSheet = sheet.getSheetByName(SOURCE_SHEET_NAME);
    const targetSheet = sheet.getSheetByName(TARGET_SHEET_NAME);
    
    if (!sourceSheet || !targetSheet) {
      throw new Error('Source or target sheet not found');
    }
    
    // Clear target sheet (except header)
    const lastRow = targetSheet.getLastRow();
    if (lastRow > 1) {
      targetSheet.deleteRows(2, lastRow - 1);
    }
    
    // Get all source data (skip header)
    const sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 29).getValues();
    
    Logger.log('Processing ' + sourceData.length + ' rows');
    
    // Process each row
    const targetData = [];
    sourceData.forEach(function(row) {
      targetData.push(buildTargetRow(row));
    });
    
    // Write all data at once
    if (targetData.length > 0) {
      targetSheet.getRange(2, 1, targetData.length, TARGET_HEADERS.length).setValues(targetData);
    }
    
    Logger.log('Manual sync completed: ' + targetData.length + ' rows copied');
    
  } catch (error) {
    Logger.log('Error in manualSyncAllData: ' + error.toString());
    throw error;
  }
}

/**
 * Setup function: Initialize target sheet with headers
 * Run this ONCE when setting up
 */
function setupTargetSheet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    let targetSheet = sheet.getSheetByName(TARGET_SHEET_NAME);
    
    // Create target sheet if it doesn't exist
    if (!targetSheet) {
      targetSheet = sheet.insertSheet(TARGET_SHEET_NAME);
      Logger.log('Created new sheet: ' + TARGET_SHEET_NAME);
    }
    
    // Set headers
    targetSheet.getRange(1, 1, 1, TARGET_HEADERS.length).setValues([TARGET_HEADERS]);
    
    // Format header row
    const headerRange = targetSheet.getRange(1, 1, 1, TARGET_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    // Freeze header row
    targetSheet.setFrozenRows(1);
    
    Logger.log('Target sheet setup completed');
    
  } catch (error) {
    Logger.log('Error in setupTargetSheet: ' + error.toString());
    throw error;
  }
}
```

4. Save the script (Ctrl+S or Cmd+S)

## Step 3: Run Setup Functions

### 3.1 Initialize Target Sheet
1. In Apps Script editor, select function: **setupTargetSheet**
2. Click **Run** (▶️ button)
3. Grant permissions when prompted
4. Check execution log for success

### 3.2 Migrate Existing Data
1. Select function: **manualSyncAllData**
2. Click **Run**
3. This copies all existing form responses to the new Admissions sheet
4. Verify data was copied correctly

## Step 4: Setup Form Trigger

1. In Apps Script editor, click **Triggers** (clock icon on left)
2. Click **+ Add Trigger**
3. Configure:
   - Function: **onFormSubmit**
   - Event source: **From spreadsheet**
   - Event type: **On form submit**
4. Click **Save**

## Step 5: Update Environment Variables

Update your `.env.local` file:

```env
# Keep the same spreadsheet ID
GOOGLE_SHEETS_ID=your-spreadsheet-id

# Update sheet name to new structure
GOOGLE_SHEET_NAME=Admissions

# Keep other variables the same
GOOGLE_SERVICE_ACCOUNT_KEY=...
```

## Step 6: Test the Setup

1. Submit a test form response
2. Check that data appears in both sheets:
   - **AdmissionsForm**: Original form data
   - **Admissions**: Transformed data with camelCase columns
3. Verify all columns are mapped correctly

## ⚠️ Important: Sheet Sorting Issue

### Problem:
If **AdmissionsForm** sheet gets sorted (accidentally or intentionally), new form submissions may not go to the last row, breaking the sync.

### Solutions:

#### Option 1: Prevent Sorting (Recommended)
1. **Protect the AdmissionsForm sheet:**
   - Right-click sheet tab → Protect sheet
   - Allow only yourself or form to edit
   - Check "Exclude certain cells from this range"
   - Protect everything except column ranges you need to edit

2. **Remove any existing sorts:**
   - Select all data in AdmissionsForm
   - Data → Remove sort

3. **Use a separate "View" sheet for sorted data:**
   - Create a new sheet "AdmissionsView"
   - Use `=SORT(AdmissionsForm!A:AC, 1, FALSE)` to show sorted data
   - Never sort the original AdmissionsForm

#### Option 2: Enhanced Script (Already Included)
The AppScript now uses the event object (`e.range.getRow()`) which gets the actual row number where the form submitted, even if the sheet is sorted.

#### Option 3: Timestamp-Based Sync (Advanced)
If you need sorting flexibility, add this alternative sync method:

```javascript
/**
 * Alternative: Sync by checking for new timestamps
 * Run this on a time-based trigger every 5 minutes
 */
function syncNewEntriesByTimestamp() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = sheet.getSheetByName(SOURCE_SHEET_NAME);
  const targetSheet = sheet.getSheetByName(TARGET_SHEET_NAME);
  
  // Get last processed timestamp from script properties
  const props = PropertiesService.getScriptProperties();
  const lastProcessed = props.getProperty('lastProcessedTimestamp') || '1970-01-01T00:00:00';
  
  // Get all source data
  const sourceData = sourceSheet.getRange(2, 1, sourceSheet.getLastRow() - 1, 29).getValues();
  
  // Find and process new entries
  let newestTimestamp = lastProcessed;
  sourceData.forEach(function(row) {
    const timestamp = row[0]; // First column is timestamp
    if (timestamp && timestamp > new Date(lastProcessed)) {
      const targetRow = buildTargetRow(row);
      targetSheet.appendRow(targetRow);
      if (timestamp > new Date(newestTimestamp)) {
        newestTimestamp = timestamp.toISOString();
      }
    }
  });
  
  // Update last processed timestamp
  if (newestTimestamp !== lastProcessed) {
    props.setProperty('lastProcessedTimestamp', newestTimestamp);
    Logger.log('Synced entries up to: ' + newestTimestamp);
  }
}
```

### Best Practice:
**Don't sort the AdmissionsForm sheet!** Use a separate view/filter sheet if you need to see sorted data.

## Removed Columns

The following columns were removed as they're now tracked in the separate Payments sheet:
- ❌ Payment Status
- ❌ Payment Amount
- ❌ Payment Method
- ❌ Payment Reference
- ❌ Payment Date
- ❌ Recorded By
- ❌ Reporting Date
- ❌ Assigned Batch
- ❌ Assigned Section

## Notes

- Form responses continue going to **AdmissionsForm** (unchanged)
- Your app reads/writes to **Admissions** sheet only
- AppScript automatically syncs new submissions
- You can manually re-sync anytime with `manualSyncAllData()`
- Payment tracking is handled by the separate payment system
