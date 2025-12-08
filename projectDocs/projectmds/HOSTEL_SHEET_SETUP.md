# Hostel Module Google Sheets Setup

## Sheet Structure

### 1. HostelForm (Raw Google Form Responses)
This sheet receives direct responses from the Google Form. The order of columns should match the form fields:

1. timestamp
2. studentId
3. fullName
4. email
5. contactNumber
6. gender
7. category
8. entrancePercentage

> **Note:** The order of these columns must match the order of fields in your Google Form.

### 2. HostelApplications (Processed Data)
This sheet is used by the ERP system and contains all columns needed for allocation, status tracking, and email automation. The recommended order is:

1. timestamp
2. studentId
3. fullName
4. email
5. contactNumber
6. gender
7. category
8. entrancePercentage
9. status
10. roomNumber
11. allocationTimestamp
12. paymentConfirmed
13. allocationEmailSent
14. confirmationEmailSent

> **Tip:** The first 8 columns are copied directly from HostelForm. The rest are managed by the system or staff.

## Data Flow
- **Student fills Hostel Google Form → HostelForm sheet (raw)**
- **Apps Script processes new row → Appends to HostelApplications sheet with default values**
- **ERP system and staff work with HostelApplications for allocation, status, and notifications**

## Example Row (HostelApplications)
| timestamp | studentId | fullName | email | contactNumber | gender | category | entrancePercentage | status | roomNumber | allocationTimestamp | paymentConfirmed | allocationEmailSent | confirmationEmailSent |
|-----------|-----------|----------|-------|---------------|--------|----------|-------------------|--------|------------|--------------------|------------------|---------------------|-----------------------|
| 2025-11-20 10:00 | 12345 | John Doe | john@example.com | 9876543210 | male | OBC | 92.5 | pending |            |                    | FALSE            | FALSE               | FALSE                 |

## Setup Checklist
- [ ] Create **HostelForm** sheet (linked to Google Form)
- [ ] Create **HostelApplications** sheet with columns as above
- [ ] Deploy Apps Script to process form responses and append to HostelApplications
- [ ] Ensure column order matches exactly for smooth automation


App script code for Hostel

function onHostelFormSubmit(e) {
  try {
    log('📝 Processing new hostel form submission');

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = getSheet(CONFIG.SHEETS.HOSTEL_FORM); // e.g., "HostelForm"
    const hostelSheet = getSheet(CONFIG.SHEETS.HOSTEL);    // e.g., "HostelApplications"

    // Get the submitted row data
    const submittedRow = e?.range?.getRow() || formSheet.getLastRow();
    const formData = formSheet.getRange(submittedRow, 1, 1, HOSTEL_FORM_COLUMNS.length).getValues()[0];

    // Process hostel application
    const hostelRow = processHostelApplication(formData, hostelSheet);

    // Optionally, send a confirmation or notification email here

    log(`✅ Hostel application record created at row ${hostelRow}`);
  } catch (error) {
    logError('onHostelFormSubmit', error);
  }
}

function processHostelApplication(formData, hostelSheet) {
  try {
    // Build hostel application row with default values
    const hostelRow = [];

    // Copy form data (adjust indices as per your form)
    hostelRow.push(formData[0] || ''); // timestamp
    hostelRow.push(formData[1] || ''); // studentId
    hostelRow.push(formData[2] || ''); // fullName
    hostelRow.push(formData[3] || ''); // email
    hostelRow.push(formData[4] || ''); // contactNumber
    hostelRow.push(formData[5] || ''); // gender
    hostelRow.push(formData[6] || ''); // category
    hostelRow.push(formData[7] || ''); // entrancePercentage

    // Add system columns with defaults
    hostelRow.push('pending');    // status
    hostelRow.push('');           // roomNumber
    hostelRow.push('');           // allocationTimestamp
    hostelRow.push('FALSE');      // paymentConfirmed
    hostelRow.push('FALSE');      // allocationEmailSent
    hostelRow.push('FALSE');      // confirmationEmailSent

    // Add to sheet
    hostelSheet.appendRow(hostelRow);
    const newRow = hostelSheet.getLastRow();

    log(`✅ Hostel application record created at row ${newRow}`);
    return newRow;
  } catch (error) {
    logError('processHostelApplication', error);
    throw error;
  }
}



function sendHostelAllocationEmail(sheet, row) {
  try {
    var data = getRowData(sheet, row);
    if (data.status === 'allocated' && !data.allocationEmailSent) {
      var subject = 'Hostel Room Allocation - Confirmation Pending';
      var body = `Dear ${data.fullName},\n\nYour hostel room (${data.roomNumber}) has been allocated. Please complete payment to confirm your booking.\n\nRegards,\nHostel Office`;
      MailApp.sendEmail(data.email, subject, body);
      sheet.getRange(row, getColumnIndex('allocationEmailSent')).setValue(true);
    }
  } catch (error) {
    logError('sendHostelAllocationEmail', error);
  }
}

function sendHostelConfirmationEmail(sheet, row) {
  try {
    var data = getRowData(sheet, row);
    if (data.status === 'confirmed' && !data.confirmationEmailSent) {
      var subject = 'Hostel Room Booking Confirmed';
      var body = `Dear ${data.fullName},\n\nYour hostel room (${data.roomNumber}) booking is confirmed. Welcome!\n\nRegards,\nHostel Office`;
      MailApp.sendEmail(data.email, subject, body);
      sheet.getRange(row, getColumnIndex('confirmationEmailSent')).setValue(true);
    }
  } catch (error) {
    logError('sendHostelConfirmationEmail', error);
  }
}

// Handler for hostel sheet edits
function handleHostelEdit(sheet, row) {
  sendHostelAllocationEmail(sheet, row);
  sendHostelConfirmationEmail(sheet, row);
}