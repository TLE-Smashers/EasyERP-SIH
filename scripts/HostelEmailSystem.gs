/**
 * Google Apps Script: Hostel Email System
 * Sends hostel allocation and confirmation emails
 */

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

// Add triggers in onEdit/onFormSubmit as per admission module
