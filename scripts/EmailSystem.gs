/**
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN EMAIL SYSTEM - GOOGLE APPS SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * 
 * A streamlined email system for admission and payment notifications.
 * This script is designed to be error-free and maintainable.
 * 
 * FEATURES:
 * 1. Admission Confirmation - When form is submitted
 * 2. Document Verification - When documents are approved
 * 3. Payment Confirmation - When payment is received ✅ FIXED
 * 4. Admission Completion - Final confirmation
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure these columns exist in your sheets:
 *    - Admissions Sheet: admissionEmailSent, verificationEmailSent, completionEmailSent
 *    - Payments Sheet: emailSent, paymentEmailTrigger (dedicated columns for tracking)
 * 
 * 2. Set up triggers:
 *    - onFormSubmit: triggers when admission form is submitted
 *    - onEdit: triggers when any sheet is edited
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  SHEETS: {
    FORM_RESPONSES: 'AdmissionsForm',
    ADMISSIONS: 'Admissions',
    PAYMENTS: 'Payments'
  },
  SENDER_NAME: 'Government Engineering College Bilaspur',
  DEBUG: true // Set to false for production
};

// Column mappings for form data (0-indexed)
const FORM_COLUMNS = {
  timestamp: 0, fullName: 1, email: 2, mobileNumber: 3, dateOfBirth: 4,
  address: 5, guardianName: 6, guardianContact: 7, school10th: 8, board10th: 9,
  marks10th: 10, yearOfPassing10th: 11, school12th: 12, board12th: 13,
  marks12th: 14, yearOfPassing12th: 15, course: 16, branch: 17,
  marksheet10th: 18, marksheet12th: 19, entranceExamMarksheet: 20,
  allotmentLetter: 21, transferCertificate: 22, characterCertificate: 23,
  domicileCertificate: 24, casteCertificate: 25, idProof: 26, photo: 27,
  gapCertificate: 28
};

// ═══════════════════════════════════════════════════════════════════
// MAIN TRIGGER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Main trigger: When admission form is submitted
 * 1. Syncs data to Admissions sheet
 * 2. Sends admission confirmation email
 * 3. Creates payment record
 */
function onFormSubmit(e) {
  try {
    log('📝 Processing new admission form submission');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = getSheet(CONFIG.SHEETS.FORM_RESPONSES);
    const admissionsSheet = getSheet(CONFIG.SHEETS.ADMISSIONS);
    
    // Get the submitted row data
    const submittedRow = e?.range?.getRow() || formSheet.getLastRow();
    const formData = formSheet.getRange(submittedRow, 1, 1, 29).getValues()[0];
    
    // Process admission
    const admissionRow = processAdmission(formData, admissionsSheet);
    
    // Send confirmation email
    sendAdmissionEmail(admissionsSheet, admissionRow);
    
    // Create payment record
    createPaymentRecord(formData, admissionRow);
    
    log('✅ Form submission processed successfully');
    
  } catch (error) {
    logError('onFormSubmit', error);
  }
}

/**
 * Main trigger: When any sheet is edited
 * Handles document verification and payment confirmation
 */
function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    const editedRow = e.range.getRow();
    
    if (editedRow === 1) return; // Skip header row
    
    log(`🔍 Sheet edit detected: ${sheetName}, Row: ${editedRow}`);
    
    switch (sheetName) {
      case CONFIG.SHEETS.ADMISSIONS:
        handleAdmissionEdit(sheet, editedRow);
        break;
      case CONFIG.SHEETS.PAYMENTS:
        handlePaymentEdit(sheet, editedRow);
        break;
      default:
        log(`❓ Unknown sheet: ${sheetName}`);
    }
    
  } catch (error) {
    logError('onEdit', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// CORE PROCESSING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Process admission: Copy form data to admissions sheet
 */
function processAdmission(formData, admissionsSheet) {
  try {
    // Build admission row with default values
    const admissionRow = [];
    
    // Copy form data
    Object.keys(FORM_COLUMNS).forEach(key => {
      const index = FORM_COLUMNS[key];
      admissionRow.push(formData[index] || '');
    });
    
    // Add system columns with defaults
    admissionRow.push('pending');    // applicationStatus
    admissionRow.push('FALSE');      // documentsVerified
    admissionRow.push('');           // verifiedBy
    admissionRow.push('');           // verifiedDate
    admissionRow.push('FALSE');      // locked
    admissionRow.push('');           // lockedBy
    admissionRow.push('');           // lockedDate
    admissionRow.push('');           // finalRemarks
    admissionRow.push('FALSE');      // admissionEmailSent
    admissionRow.push('FALSE');      // verificationEmailSent
    admissionRow.push('FALSE');      // completionEmailSent
    
    // Add to sheet
    admissionsSheet.appendRow(admissionRow);
    const newRow = admissionsSheet.getLastRow();
    
    log(`✅ Admission record created at row ${newRow}`);
    return newRow;
    
  } catch (error) {
    logError('processAdmission', error);
    throw error;
  }
}

/**
 * Create payment record linked to admission
 */
function createPaymentRecord(formData, admissionRowNumber) {
  try {
    const paymentsSheet = getSheet(CONFIG.SHEETS.PAYMENTS);
    const headers = paymentsSheet.getRange(1, 1, 1, paymentsSheet.getLastColumn()).getValues()[0];
    
    // Generate IDs
    const applicationId = `APP-${admissionRowNumber}`;
    const studentId = `STU-${admissionRowNumber}`;
    const paymentId = `PAY-${Date.now()}`;
    
    // Extract student data
    const studentName = formData[FORM_COLUMNS.fullName] || '';
    const email = formData[FORM_COLUMNS.email] || '';
    const mobile = formData[FORM_COLUMNS.mobileNumber] || '';
    const course = formData[FORM_COLUMNS.course] || '';
    const branch = formData[FORM_COLUMNS.branch] || '';
    
    // Create payment row
    const paymentRow = new Array(headers.length).fill('');
    
    // Map essential fields
    const fieldMap = {
      'paymentId': paymentId,
      'timestamp': new Date(),
      'applicationId': applicationId,
      'studentId': studentId,
      'studentName': studentName,
      'email': email,
      'mobile': mobile,
      'course': course,
      'branch': branch,
      'paymentStatus': 'pending',
      'emailSent': 'FALSE',
      'paymentEmailTrigger': 'FALSE',
    };
    
    // Fill payment row
    Object.keys(fieldMap).forEach(field => {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1) {
        paymentRow[colIndex] = fieldMap[field];
      }
    });
    
    paymentsSheet.appendRow(paymentRow);
    log(`✅ Payment record created: ${paymentId}`);
    
  } catch (error) {
    logError('createPaymentRecord', error);
  }
}

/**
 * Handle admission sheet edits
 */
function handleAdmissionEdit(sheet, row) {
  try {
    const data = getRowData(sheet, row);
    
    // Document verification email
    if (data.documentsVerified === 'TRUE' && data.verificationEmailSent === 'FALSE') {
      sendVerificationEmail(sheet, row);
    }
    
    // Completion email
    if (data.locked === 'TRUE' && data.completionEmailSent === 'FALSE') {
      sendCompletionEmail(sheet, row);
    }
    
  } catch (error) {
    logError('handleAdmissionEdit', error);
  }
}

/**
 * Handle payment sheet edits - FIXED VERSION
 */
function handlePaymentEdit(sheet, row) {
  try {
    log(`🔍 Processing payment edit for row ${row}`);
    
    const data = getRowData(sheet, row);
    
    // New: Trigger payment email only if paymentEmailTrigger is set to TRUE
    if ((data.paymentEmailTrigger || '').toUpperCase() === 'TRUE') {
      log(`✅ paymentEmailTrigger is TRUE for row ${row}`);
      // Only send if paymentStatus is paid and emailSent is not TRUE
      if (shouldSendPaymentEmail(data)) {
        // Get student data from admissions sheet
        const studentData = getStudentDataById(data.studentId || data.applicationId);
        if (studentData) {
          const success = sendPaymentEmail(studentData, data);
          if (success) {
            // Mark email as sent
            markEmailAsSent(sheet, row);
            // Reset paymentEmailTrigger to FALSE
            updateCell(sheet, row, 'paymentEmailTrigger', 'FALSE');
            log(`✅ Payment email sent and trigger reset for row ${row}`);
          }
        } else {
          log(`❌ Student data not found for payment row ${row}`);
        }
      } else {
        log(`⏭️ Payment email conditions not met for row ${row}`);
      }
    } else {
      log(`⏭️ paymentEmailTrigger is not TRUE for row ${row}`);
    }
    
  } catch (error) {
    logError('handlePaymentEdit', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// EMAIL SENDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Send admission confirmation email
 */
function sendAdmissionEmail(sheet, row) {
  try {
    const data = getRowData(sheet, row);
    
    if (!data.email || !data.fullName) {
      log(`❌ Missing email or name for admission row ${row}`);
      return;
    }
    
    const applicationId = `APP-${row}`;
    const subject = `Application Received - ${applicationId}`;
    const htmlBody = generateAdmissionEmailHTML(data.fullName, applicationId);
    
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.SENDER_NAME
    });
    
    // Mark as sent
    updateCell(sheet, row, 'admissionEmailSent', 'TRUE');
    log(`✅ Admission email sent to ${data.email}`);
    
  } catch (error) {
    logError('sendAdmissionEmail', error);
  }
}

/**
 * Send document verification email
 */
function sendVerificationEmail(sheet, row) {
  try {
    const data = getRowData(sheet, row);
    
    if (!data.email || !data.fullName) return;
    
    const applicationId = `APP-${row}`;
    const subject = `Documents Verified - ${applicationId}`;
    const htmlBody = generateVerificationEmailHTML(data.fullName, applicationId);
    
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.SENDER_NAME
    });
    
    updateCell(sheet, row, 'verificationEmailSent', 'TRUE');
    log(`✅ Verification email sent to ${data.email}`);
    
  } catch (error) {
    logError('sendVerificationEmail', error);
  }
}

/**
 * Send payment confirmation email - FIXED VERSION
 */
function sendPaymentEmail(studentData, paymentData) {
  try {
    const subject = `Payment Confirmed - ${paymentData.referenceNumber || paymentData.paymentId}`;
    const htmlBody = generatePaymentEmailHTML(
      studentData.fullName,
      studentData.applicationId,
      paymentData.referenceNumber || paymentData.paymentId,
      paymentData.totalAmount || 0,
      paymentData.paymentDate || new Date()
    );
    
    MailApp.sendEmail({
      to: studentData.email,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.SENDER_NAME
    });
    
    return true;
    
  } catch (error) {
    logError('sendPaymentEmail', error);
    return false;
  }
}

/**
 * Send admission completion email
 */
function sendCompletionEmail(sheet, row) {
  try {
    const data = getRowData(sheet, row);
    
    if (!data.email || !data.fullName) return;
    
    const applicationId = `APP-${row}`;
    const subject = `Admission Confirmed - Welcome to GEC Bilaspur!`;
    const htmlBody = generateCompletionEmailHTML(data.fullName, applicationId);
    
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.SENDER_NAME
    });
    
    updateCell(sheet, row, 'completionEmailSent', 'TRUE');
    log(`✅ Completion email sent to ${data.email}`);
    
  } catch (error) {
    logError('sendCompletionEmail', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get sheet by name with error handling
 */
function getSheet(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet;
}

/**
 * Get row data as object
 */
function getRowData(sheet, row) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const data = {};
  headers.forEach((header, index) => {
    data[header] = values[index] || '';
  });
  
  return data;
}

/**
 * Update a specific cell in a row
 */
function updateCell(sheet, row, columnName, value) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIndex = headers.indexOf(columnName);
  
  if (colIndex !== -1) {
    sheet.getRange(row, colIndex + 1).setValue(value);
  }
}

/**
 * Check if payment email should be sent
 */
function shouldSendPaymentEmail(data) {
  const isPaid = (data.paymentStatus || '').toLowerCase().trim() === 'paid';
  const emailNotSent = (data.emailSent || '').toUpperCase() !== 'TRUE';
  const hasStudentId = !!(data.studentId || data.applicationId);
  
  log(`📋 Payment email conditions:`);
  log(`   - isPaid: ${isPaid} (status: "${data.paymentStatus}")`);
  log(`   - emailNotSent: ${emailNotSent} (emailSent: "${data.emailSent}")`);
  log(`   - hasStudentId: ${hasStudentId} (studentId: "${data.studentId}", appId: "${data.applicationId}")`);
  
  return isPaid && emailNotSent && hasStudentId;
}

/**
 * Get student data from admissions sheet by ID
 */
function getStudentDataById(studentId) {
  try {
    if (!studentId) return null;
    
    const admissionsSheet = getSheet(CONFIG.SHEETS.ADMISSIONS);
    const headers = admissionsSheet.getRange(1, 1, 1, admissionsSheet.getLastColumn()).getValues()[0];
    const lastRow = admissionsSheet.getLastRow();
    
    if (lastRow <= 1) return null;
    
    // Search by studentId or applicationId
    for (let row = 2; row <= lastRow; row++) {
      const data = getRowData(admissionsSheet, row);
      const appId = `APP-${row}`;
      const stuId = `STU-${row}`;
      
      if (studentId === appId || studentId === stuId) {
        return {
          fullName: data.fullName,
          email: data.email,
          applicationId: appId,
          studentId: stuId
        };
      }
    }
    
    return null;
    
  } catch (error) {
    logError('getStudentDataById', error);
    return null;
  }
}

/**
 * Mark email as sent in payments sheet
 */
function markEmailAsSent(sheet, row) {
  try {
    updateCell(sheet, row, 'emailSent', 'TRUE');
  } catch (error) {
    logError('markEmailAsSent', error);
  }
}

/**
 * Logging function
 */
function log(message) {
  if (CONFIG.DEBUG) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    Logger.log(message);
  }
}

/**
 * Error logging function
 */
function logError(functionName, error) {
  const errorMsg = `❌ Error in ${functionName}: ${error.toString()}`;
  console.error(errorMsg);
  Logger.log(errorMsg);
  if (error.stack) {
    Logger.log(`Stack trace: ${error.stack}`);
  }
}

// ═══════════════════════════════════════════════════════════════════
// EMAIL HTML TEMPLATES
// ═══════════════════════════════════════════════════════════════════

/**
 * Admission confirmation email template
 */
function generateAdmissionEmailHTML(fullName, applicationId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Admission Application Received</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; line-height: 1.6; color: #333; }
        .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Application Received</h1>
            <p>Government Engineering College Bilaspur</p>
        </div>
        <div class="content">
            <p>Dear <strong>${fullName}</strong>,</p>
            
            <p>Thank you for submitting your admission application to Government Engineering College Bilaspur. We have successfully received your application.</p>
            
            <div class="highlight">
                <strong>📋 Application Details:</strong><br>
                Application ID: <strong>${applicationId}</strong><br>
                Submitted: ${new Date().toLocaleDateString('en-IN')}
            </div>
            
            <p><strong>📝 Next Steps:</strong></p>
            <ul>
                <li>Our admission team will review your application and documents</li>
                <li>You will receive an email notification once your documents are verified</li>
                <li>Please ensure all required documents are uploaded correctly</li>
                <li>Keep your application ID for future reference</li>
            </ul>
            
            <p><strong>📞 Need Help?</strong></p>
            <p>If you have any questions, please contact our admission office.</p>
            
            <p>Best regards,<br>
            <strong>Admission Office</strong><br>
            Government Engineering College Bilaspur</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>© 2024 Government Engineering College Bilaspur. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Document verification email template
 */
function generateVerificationEmailHTML(fullName, applicationId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Documents Verified</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; line-height: 1.6; color: #333; }
        .highlight { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Documents Verified</h1>
            <p>Government Engineering College Bilaspur</p>
        </div>
        <div class="content">
            <p>Dear <strong>${fullName}</strong>,</p>
            
            <p>Great news! Your documents have been successfully verified by our admission team.</p>
            
            <div class="highlight">
                <strong>✅ Verification Complete:</strong><br>
                Application ID: <strong>${applicationId}</strong><br>
                Verified on: ${new Date().toLocaleDateString('en-IN')}
            </div>
            
            <p><strong>📝 Next Steps:</strong></p>
            <ul>
                <li>Proceed with fee payment as per the admission schedule</li>
                <li>Keep all original documents ready for physical verification</li>
                <li>Check your email regularly for further updates</li>
            </ul>
            
            <p>Congratulations on this important step in your admission process!</p>
            
            <p>Best regards,<br>
            <strong>Admission Office</strong><br>
            Government Engineering College Bilaspur</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>© 2024 Government Engineering College Bilaspur. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Payment confirmation email template
 */
function generatePaymentEmailHTML(fullName, applicationId, referenceNumber, amount, paymentDate) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Confirmation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; line-height: 1.6; color: #333; }
        .highlight { background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FF9800; }
        .payment-details { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Payment Confirmed</h1>
            <p>Government Engineering College Bilaspur</p>
        </div>
        <div class="content">
            <p>Dear <strong>${fullName}</strong>,</p>
            
            <p>We have successfully received your payment. Thank you for completing this step in your admission process.</p>
            
            <div class="payment-details">
                <strong>💰 Payment Details:</strong><br><br>
                Application ID: <strong>${applicationId}</strong><br>
                Reference Number: <strong>${referenceNumber}</strong><br>
                Amount Paid: <strong>₹${amount}</strong><br>
                Payment Date: <strong>${new Date(paymentDate).toLocaleDateString('en-IN')}</strong>
            </div>
            
            <div class="highlight">
                <strong>✅ Payment Status: CONFIRMED</strong><br>
                Your payment has been successfully processed and recorded.
            </div>
            
            <p><strong>📝 Next Steps:</strong></p>
            <ul>
                <li>Keep this email as proof of payment</li>
                <li>Wait for final admission confirmation</li>
                <li>Prepare for document verification if required</li>
                <li>Check your email regularly for further updates</li>
            </ul>
            
            <p><strong>📞 Need Help?</strong></p>
            <p>If you have any questions about your payment or admission, please contact our office.</p>
            
            <p>Best regards,<br>
            <strong>Admission Office</strong><br>
            Government Engineering College Bilaspur</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>© 2024 Government Engineering College Bilaspur. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Admission completion email template
 */
function generateCompletionEmailHTML(fullName, applicationId) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Admission Confirmed - Welcome!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #9C27B0 0%, #673AB7 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; line-height: 1.6; color: #333; }
        .highlight { background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #9C27B0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .welcome { text-align: center; font-size: 18px; color: #9C27B0; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Admission Confirmed!</h1>
            <p>Government Engineering College Bilaspur</p>
        </div>
        <div class="content">
            <div class="welcome">Welcome to GEC Bilaspur Family! 🎓</div>
            
            <p>Dear <strong>${fullName}</strong>,</p>
            
            <p>Congratulations! We are delighted to inform you that your admission has been <strong>confirmed</strong> at Government Engineering College Bilaspur.</p>
            
            <div class="highlight">
                <strong>🎓 Admission Confirmed:</strong><br>
                Application ID: <strong>${applicationId}</strong><br>
                Confirmation Date: ${new Date().toLocaleDateString('en-IN')}
            </div>
            
            <p><strong>📋 Important Next Steps:</strong></p>
            <ul>
                <li>Report to college on the specified joining date</li>
                <li>Bring all original documents for verification</li>
                <li>Complete any remaining formalities</li>
                <li>Attend orientation program</li>
            </ul>
            
            <p><strong>📚 Get Ready For:</strong></p>
            <ul>
                <li>An excellent academic journey</li>
                <li>State-of-the-art facilities</li>
                <li>Expert faculty guidance</li>
                <li>Bright career opportunities</li>
            </ul>
            
            <p>We look forward to welcoming you to our campus and wish you all the best for your academic journey ahead!</p>
            
            <p>Warm regards,<br>
            <strong>Admission Office</strong><br>
            Government Engineering College Bilaspur</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>© 2024 Government Engineering College Bilaspur. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════
// TESTING & SETUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Test payment email functionality
 * Run this function to test the payment email system
 */
function testPaymentEmail() {
  try {
    log('🧪 Testing payment email functionality...');
    
    const paymentsSheet = getSheet(CONFIG.SHEETS.PAYMENTS);
    const lastRow = paymentsSheet.getLastRow();
    
    if (lastRow <= 1) {
      log('❌ No payment records found for testing');
      return;
    }
    
    // Test with the last row
    log(`Testing with row ${lastRow}`);
    handlePaymentEdit(paymentsSheet, lastRow);
    
    log('✅ Payment email test completed');
    
  } catch (error) {
    logError('testPaymentEmail', error);
  }
}

/**
 * Setup function to verify sheet structure
 */
function verifySheetSetup() {
  try {
    log('🔍 Verifying sheet setup...');
    
    const requiredSheets = Object.values(CONFIG.SHEETS);
    requiredSheets.forEach(sheetName => {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (sheet) {
        log(`✅ Sheet found: ${sheetName}`);
        
        // Check if sheet has data
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        log(`   Rows: ${lastRow}, Columns: ${lastCol}`);
        
        if (lastRow > 0) {
          const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
          log(`   Headers: ${headers.slice(0, 5).join(', ')}...`);
        }
      } else {
        log(`❌ Sheet missing: ${sheetName}`);
      }
    });
    
    log('✅ Sheet verification completed');
    
  } catch (error) {
    logError('verifySheetSetup', error);
  }
}

/**
 * Manual trigger to process a specific payment row
 */
function manualProcessPayment(rowNumber) {
  try {
    if (!rowNumber) {
      log('❌ Please provide a row number');
      return;
    }
    
    log(`🔧 Manually processing payment row ${rowNumber}`);
    
    const paymentsSheet = getSheet(CONFIG.SHEETS.PAYMENTS);
    handlePaymentEdit(paymentsSheet, rowNumber);
    
    log('✅ Manual payment processing completed');
    
  } catch (error) {
    logError('manualProcessPayment', error);
  }
}