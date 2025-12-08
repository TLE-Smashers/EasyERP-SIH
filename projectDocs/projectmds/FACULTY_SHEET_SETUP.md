# Faculty Sheet Setup Guide

## Overview
This guide explains how to set up the Google Sheet for the Faculty Management module in Easy-ERP.

## Sheet Structure

### Sheet Name: `Faculty`

### Column Layout (A to AQ - 43 columns)

#### Metadata (A-B)
- **A**: Timestamp
- **B**: ID (Unique faculty identifier, e.g., FAC1700000000)

#### Personal Details (C-P)
- **C**: Full Name
- **D**: Email
- **E**: Mobile Number
- **F**: Alternate Contact
- **G**: Date of Birth (YYYY-MM-DD)
- **H**: Gender (male/female/other)
- **I**: Address
- **J**: City
- **K**: State
- **L**: Pincode
- **M**: Emergency Contact
- **N**: Emergency Contact Name
- **O**: Blood Group

#### Professional Details (P-X)
- **P**: Employee ID (Unique)
- **Q**: Designation (professor/associate_professor/assistant_professor/lecturer/guest_faculty/lab_assistant)
- **R**: Department
- **S**: Employment Type (permanent/contract/visiting/part_time)
- **T**: Date of Joining (YYYY-MM-DD)
- **U**: Highest Qualification (phd/mtech/msc/btech/bsc/other)
- **V**: Specialization
- **W**: Experience (in years)
- **X**: Previous Institution

#### Qualifications (Y)
- **Y**: Qualifications (JSON array of qualification objects)

#### Document Links (Z-AG)
- **Z**: Photo (Google Drive link)
- **AA**: Resume (Google Drive link)
- **AB**: ID Proof (Google Drive link)
- **AC**: Address Proof (Google Drive link)
- **AD**: Degree Certificates (Google Drive link)
- **AE**: Experience Certificates (Google Drive link)
- **AF**: Joining Letter (Google Drive link)
- **AG**: Bank Details (Google Drive link)

#### Status & Metadata (AH-AK)
- **AH**: Status (active/on_leave/inactive)
- **AI**: Notes
- **AJ**: Last Updated (ISO timestamp)
- **AK**: Updated By

## Setup Instructions

### 1. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename it to "Easy-ERP Faculty"
4. Rename the first sheet to "Faculty"

### 2. Add Headers

Copy and paste this header row into Row 1:

```
Timestamp	ID	Full Name	Email	Mobile Number	Alternate Contact	Date of Birth	Gender	Address	City	State	Pincode	Emergency Contact	Emergency Contact Name	Blood Group	Employee ID	Designation	Department	Employment Type	Date of Joining	Highest Qualification	Specialization	Experience	Previous Institution	Qualifications	Photo	Resume	ID Proof	Address Proof	Degree Certificates	Experience Certificates	Joining Letter	Bank Details	Status	Notes	Last Updated	Updated By
```

### 3. Set Up Data Validation

Apply data validation to specific columns:

#### Gender (Column H)
- Go to Data > Data validation
- Criteria: List of items
- Items: `male,female,other`

#### Designation (Column Q)
- Criteria: List of items
- Items: `professor,associate_professor,assistant_professor,lecturer,guest_faculty,lab_assistant`

#### Employment Type (Column S)
- Criteria: List of items
- Items: `permanent,contract,visiting,part_time`

#### Highest Qualification (Column U)
- Criteria: List of items
- Items: `phd,mtech,msc,btech,bsc,other`

#### Status (Column AH)
- Criteria: List of items
- Items: `active,on_leave,inactive`

### 4. Format Columns

- **Date Columns (G, T, AJ)**: Format as Date (Format > Number > Date)
- **Number Columns (W)**: Format as Number
- **ID Columns (B, P)**: Format as Plain Text
- **JSON Column (Y)**: Format as Plain Text

### 5. Configure Sheet Protection

1. Right-click on sheet tab > Protect sheet
2. Set permissions appropriately for your team

### 6. Get Sheet ID

1. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
2. Add to your `.env.local` file:
   ```
   NEXT_PUBLIC_FACULTY_SHEET_ID=your_sheet_id_here
   ```

### 7. Share with Service Account

1. Go to your Google Cloud Project
2. Find your service account email (usually ends with `@*.iam.gserviceaccount.com`)
3. Share the sheet with this email address with "Editor" permissions

## Sample Data Format

### Qualifications JSON Format
```json
[
  {
    "degree": "M.Tech",
    "institution": "IIT Delhi",
    "university": "IIT Delhi",
    "yearOfPassing": "2018",
    "percentage": "8.5 CGPA",
    "specialization": "Computer Science"
  },
  {
    "degree": "B.Tech",
    "institution": "NIT Trichy",
    "university": "NIT Trichy",
    "yearOfPassing": "2016",
    "percentage": "85%",
    "specialization": "Computer Science"
  }
]
```

## Google Apps Script (Optional)

For real-time notifications and automation, you can add this Apps Script:

```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();
  
  // Only run for Faculty sheet
  if (sheetName !== 'Faculty') return;
  
  const range = e.range;
  const column = range.getColumn();
  
  // Update "Last Updated" timestamp when any cell is edited
  if (column > 2) { // Skip timestamp and ID columns
    const row = range.getRow();
    const lastUpdatedCol = 36; // Column AJ
    sheet.getRange(row, lastUpdatedCol).setValue(new Date().toISOString());
  }
}

function sendFacultyNotification(facultyData) {
  // Send email notification when new faculty is added
  const recipient = 'admin@college.edu';
  const subject = 'New Faculty Member Added';
  const body = `
    New faculty member has been added:
    
    Name: ${facultyData.fullName}
    Employee ID: ${facultyData.employeeId}
    Department: ${facultyData.department}
    Designation: ${facultyData.designation}
    
    Please review and approve.
  `;
  
  MailApp.sendEmail(recipient, subject, body);
}
```

## Testing

1. **Test Add Faculty**:
   - Go to `/dashboard/faculty/new`
   - Fill in the form with test data
   - Submit and verify data appears in sheet

2. **Test View Faculty**:
   - Go to `/dashboard/faculty`
   - Verify all faculty members are displayed
   - Click on a faculty member to view details

3. **Test Update**:
   - Change faculty status from the table
   - Verify changes are reflected in the sheet

## Troubleshooting

### Data Not Showing
- Verify `NEXT_PUBLIC_FACULTY_SHEET_ID` is set correctly
- Check service account has Editor access to the sheet
- Verify sheet name is exactly "Faculty"

### Permission Errors
- Ensure service account credentials are valid
- Check `.env.local` has correct `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`

### Column Mismatch
- Verify column order matches exactly as specified
- Check for any extra spaces in header names
- Ensure no columns are hidden

## Next Steps

After setting up the Faculty sheet:
1. Add sample faculty data for testing
2. Configure faculty role users in authentication
3. Test faculty portal pages with actual faculty accounts
4. Set up additional features like class assignments and schedules

## Related Modules

This Faculty module integrates with:
- **Student Module**: For class assignments and attendance
- **Library Module**: For faculty book borrowing
- **Accounts Module**: For salary and payments (future)
