# Admission Columns - Quick Reference

## Sheet Structure (37 Columns)

| # | Column | Field Name | Type | Description |
|---|--------|-----------|------|-------------|
| A | 1 | timestamp | DateTime | Form submission time |
| B | 2 | fullName | String | Student name |
| C | 3 | email | String | Email address |
| D | 4 | mobileNumber | String | Mobile number |
| E | 5 | dateOfBirth | String | Date of birth |
| F | 6 | address | String | Full address |
| G | 7 | guardianName | String | Parent/Guardian name |
| H | 8 | guardianContact | String | Guardian mobile |
| I | 9 | school10th | String | 10th school name |
| J | 10 | board10th | String | 10th board |
| K | 11 | marks10th | String | 10th marks % |
| L | 12 | yearOfPassing10th | String | 10th year |
| M | 13 | school12th | String | 12th school name |
| N | 14 | board12th | String | 12th board |
| O | 15 | marks12th | String | 12th marks % |
| P | 16 | yearOfPassing12th | String | 12th year |
| Q | 17 | course | String | Course name |
| R | 18 | branch | String | Branch name |
| S | 19 | marksheet10th | URL | 10th marksheet link |
| T | 20 | marksheet12th | URL | 12th marksheet link |
| U | 21 | entranceExamMarksheet | URL | Entrance marksheet |
| V | 22 | allotmentLetter | URL | Allotment letter |
| W | 23 | transferCertificate | URL | TC link |
| X | 24 | characterCertificate | URL | Character cert |
| Y | 25 | domicileCertificate | URL | Domicile cert |
| Z | 26 | casteCertificate | URL | Caste cert |
| AA | 27 | idProof | URL | Aadhar/ID |
| AB | 28 | photo | URL | Photo link |
| AC | 29 | gapCertificate | URL | Gap cert |
| AD | 30 | applicationStatus | Enum | pending/documents_verified/completed/rejected |
| AE | 31 | documentsVerified | Boolean | TRUE/FALSE |
| AF | 32 | verifiedBy | String | Verifier email |
| AG | 33 | verifiedDate | DateTime | Verification time |
| AH | 34 | locked | Boolean | TRUE/FALSE |
| AI | 35 | lockedBy | String | Who locked |
| AJ | 36 | lockedDate | DateTime | Lock time |
| AK | 37 | finalRemarks | String | Notes |

## Usage in Code

### Reading Data
```typescript
// Using column index (0-based)
const COLUMN_INDEX = {
  timestamp: 0,
  fullName: 1,
  email: 2,
  // ... etc
};

const fullName = row[COLUMN_INDEX.fullName];
```

### Writing Data
```typescript
// Using column letter
const COLUMN_MAP = {
  fullName: 'B',
  email: 'C',
  // ... etc
};

const range = `${COLUMN_MAP.fullName}${rowNumber}`;
// Range: 'B5' for row 5
```

### Helper Function
```typescript
// Add update using field name
function addUpdate(field: keyof typeof COLUMN_MAP, value: any) {
  const column = COLUMN_MAP[field];
  updates.push({ 
    range: `${column}${rowNumber}`, 
    values: [[value]] 
  });
}

// Usage
addUpdate('documentsVerified', 'TRUE');
addUpdate('verifiedBy', 'admin@example.com');
```

## Column Mapping (Form → App)

```javascript
// AppScript mapping
const COLUMN_MAPPING = {
  'timestamp': 0,           // A → A
  'fullName': 1,            // B → B
  'email': 2,               // C → C
  'mobileNumber': 3,        // D → D
  'dateOfBirth': 4,         // E → E
  'address': 5,             // F → F
  'guardianName': 6,        // G → G
  'guardianContact': 7,     // H → H
  'school10th': 8,          // I → I
  'board10th': 9,           // J → J
  'marks10th': 10,          // K → K
  'yearOfPassing10th': 11,  // L → L
  'school12th': 12,         // M → M
  'board12th': 13,          // N → N
  'marks12th': 14,          // O → O
  'yearOfPassing12th': 15,  // P → P
  'course': 16,             // Q → Q
  'branch': 17,             // R → R
  'marksheet10th': 18,      // S → S
  'marksheet12th': 19,      // T → T
  'entranceExamMarksheet': 20, // U → U
  'allotmentLetter': 21,    // V → V
  'transferCertificate': 22, // W → W
  'characterCertificate': 23, // X → X
  'domicileCertificate': 24, // Y → Y
  'casteCertificate': 25,   // Z → Z
  'idProof': 26,            // AA → AA
  'photo': 27,              // AB → AB
  'gapCertificate': 28,     // AC → AC
};
```

## Status Values

### applicationStatus
- `pending` - Initial state
- `documents_verified` - Documents approved
- `completed` - Admission finalized & locked
- `rejected` - Application rejected

### Boolean Fields
- `documentsVerified`: TRUE | FALSE
- `locked`: TRUE | FALSE

## Default Values (New Records)
```javascript
applicationStatus: 'pending'
documentsVerified: 'FALSE'
locked: 'FALSE'
```

## Example: Update Application

```typescript
import { updateApplication } from '@/lib/google/sheets.admission';

// Update personal details
await updateApplication(rowNumber, {
  personalDetails: {
    fullName: "John Doe",
    email: "john@example.com"
  }
});

// Verify documents
await updateApplication(rowNumber, {
  documentsVerified: true,
  verifiedBy: "admin@college.edu",
  verifiedDate: new Date().toISOString(),
  applicationStatus: "documents_verified"
});

// Complete admission
await updateApplication(rowNumber, {
  applicationStatus: "completed",
  locked: true,
  lockedBy: "admin@college.edu",
  lockedDate: new Date().toISOString(),
  completionDetails: {
    finalRemarks: "All documents verified. Admission granted."
  }
});
```

## Range Examples

| Operation | Range | Columns |
|-----------|-------|---------|
| Read all data | A2:AK | 37 columns |
| Personal info | B2:H | 7 columns |
| 10th details | I2:L | 4 columns |
| 12th details | M2:P | 4 columns |
| Documents | S2:AC | 11 columns |
| Status fields | AD2:AG | 4 columns |
| Lock fields | AH2:AJ | 3 columns |
| Single row | A5:AK5 | Full row |

## Common Patterns

### Read entire application
```typescript
const range = `${SHEET_NAME}!A${row}:AK${row}`;
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range
});
```

### Batch update multiple fields
```typescript
const updates = [
  { range: `B${row}`, values: [["John Doe"]] },
  { range: `C${row}`, values: [["john@example.com"]] },
  { range: `AD${row}`, values: [["completed"]] }
];

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: {
    data: updates,
    valueInputOption: "RAW"
  }
});
```

---

**Pro Tip:** Always use column name constants instead of hardcoded letters or indices!
