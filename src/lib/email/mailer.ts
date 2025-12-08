/**
 * Email Service for Admission Module
 * Sends automated email notifications at different stages
 */

import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Generic send email function
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const { to, subject, html, from } = options;
  
  const mailOptions = {
    from: from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send confirmation email when application is received
 */
export async function sendAdmissionConfirmation(
  to: string,
  studentName: string,
  applicationId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Application Received - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Application Received</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Thank you for submitting your admission application. We have successfully received your application with the following details:
                      </p>
                      
                      <!-- Application Details Box -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 10px; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Application ID:</strong> ${applicationId}
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Status:</strong> 
                          <span style="background-color: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">Under Review</span>
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Our admission team will review your application and contact you within <strong>2-3 business days</strong>.
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        You can track your application status by contacting our admission office.
                      </p>
                      
                      <!-- Contact Info -->
                      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 4px; margin: 30px 0;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #1976d2; font-weight: 600;">
                          📞 Need Help?
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #555555; line-height: 1.6;">
                          Contact our admission office for any queries or updates.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.4;">
                        This is an automated email. Please do not reply to this message.<br>
                        © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

/**
 * Send email when documents are verified
 */
export async function sendDocumentVerificationEmail(
  to: string,
  studentName: string,
  applicationId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Documents Verified - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ Documents Verified</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Great news! Your documents have been successfully verified by our admission team.
                      </p>
                      
                      <!-- Application Details Box -->
                      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 10px; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Application ID:</strong> ${applicationId}
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Status:</strong> 
                          <span style="background-color: #4caf50; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">Documents Verified</span>
                        </p>
                      </div>
                      
                      <!-- Next Steps -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">📋 Next Steps:</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #555555; line-height: 2;">
                          <li style="font-size: 15px;">Complete the admission fee payment</li>
                          <li style="font-size: 15px;">Submit payment proof to the admission office</li>
                          <li style="font-size: 15px;">Wait for final confirmation</li>
                        </ol>
                      </div>
                      
                      <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        Please contact our office for payment details and instructions.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.4;">
                        This is an automated email. Please do not reply to this message.<br>
                        © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

/**
 * Send email when payment is received
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  studentName: string,
  applicationId: string,
  receiptId: string,
  amount: number
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Payment Received - ${receiptId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">💳 Payment Received</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Thank you! We have successfully received your admission fee payment.
                      </p>
                      
                      <!-- Payment Details Box -->
                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px; font-size: 16px; color: #1565c0;">Payment Details</h3>
                        <p style="margin: 0 0 10px; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Receipt ID:</strong> ${receiptId}
                        </p>
                        <p style="margin: 0 0 10px; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Application ID:</strong> ${applicationId}
                        </p>
                        <p style="margin: 0 0 10px; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}
                        </p>
                        <p style="margin: 0; font-size: 15px; color: #666666;">
                          <strong style="color: #333333;">Status:</strong> 
                          <span style="background-color: #4caf50; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">✓ Paid</span>
                        </p>
                      </div>
                      
                      <!-- Next Steps -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">📋 Next Steps:</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #555555; line-height: 2;">
                          <li style="font-size: 15px;">Save this receipt for your records</li>
                          <li style="font-size: 15px;">Wait for final admission confirmation</li>
                          <li style="font-size: 15px;">Check your email for further instructions</li>
                        </ol>
                      </div>
                      
                      <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; font-size: 14px; color: #856404;">
                          <strong>⚠️ Important:</strong> Keep this receipt safe. You may need to present it during document verification.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.4;">
                        This is an automated email. Please do not reply to this message.<br>
                        © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

/**
 * Send email when admission is completed
 */
export async function sendAdmissionCompletionEmail(
  to: string,
  studentName: string,
  applicationId: string,
  reportingDate: string,
  assignedBatch: string,
  assignedSection: string
) {
  const formattedDate = new Date(reportingDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `🎉 Admission Confirmed - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Congratulations!</h1>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Your Admission is Confirmed</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; font-size: 16px; color: #333333; line-height: 1.6;">
                        We are delighted to inform you that your admission has been <strong>successfully confirmed</strong>!
                      </p>
                      
                      <!-- Admission Details Box -->
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; margin: 30px 0; border-radius: 8px; color: #ffffff;">
                        <h3 style="margin: 0 0 15px; font-size: 18px;">📋 Admission Details</h3>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Application ID:</strong> ${applicationId}
                        </p>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Assigned Batch:</strong> ${assignedBatch}
                        </p>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Section:</strong> ${assignedSection}
                        </p>
                        <p style="margin: 0; font-size: 15px;">
                          <strong>Reporting Date:</strong> ${formattedDate}
                        </p>
                      </div>
                      
                      <!-- Important Notice -->
                      <div style="background-color: #fff3cd; padding: 20px; border-radius: 4px; margin: 30px 0; border-left: 4px solid #ffc107;">
                        <h3 style="margin: 0 0 10px; font-size: 16px; color: #856404;">📅 Important: Reporting Date</h3>
                        <p style="margin: 0; font-size: 15px; color: #856404;">
                          Please report to the campus on <strong>${formattedDate}</strong>. Late reporting may result in cancellation of admission.
                        </p>
                      </div>
                      
                      <!-- Next Steps -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">🚀 What to Bring on Reporting Day:</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #555555; line-height: 2.2;">
                          <li style="font-size: 15px;">All original documents for verification</li>
                          <li style="font-size: 15px;">Admission fee receipt</li>
                          <li style="font-size: 15px;">Recent passport-size photographs (4 copies)</li>
                          <li style="font-size: 15px;">Medical fitness certificate</li>
                        </ol>
                      </div>
                      
                      <!-- Welcome Message -->
                      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 4px; margin: 30px 0; border-left: 4px solid #4caf50;">
                        <p style="margin: 0; font-size: 15px; color: #2e7d32; font-weight: 600;">
                          🎓 Welcome to our institution! We look forward to seeing you on campus.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0 0; font-size: 15px; color: #666666; line-height: 1.6;">
                        If you have any questions, feel free to contact our admission office.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.4;">
                        This is an automated email. Please do not reply to this message.<br>
                        © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Completion email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

/**
 * Send email when admission is completed
 */
export async function sendAdmissionCompleteEmail(
  to: string,
  studentName: string,
  applicationId: string,
  course: string,
  branch: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `🎉 Admission Confirmed - ${applicationId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Congratulations!</h1>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Your Admission is Confirmed</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                        Dear <strong>${studentName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; font-size: 16px; color: #333333; line-height: 1.6;">
                        We are delighted to inform you that your admission has been <strong>successfully confirmed</strong>!
                      </p>
                      
                      <!-- Admission Details Box -->
                      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; margin: 30px 0; border-radius: 8px; color: #ffffff;">
                        <h3 style="margin: 0 0 15px; font-size: 18px;">📋 Admission Details</h3>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Application ID:</strong> ${applicationId}
                        </p>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Course:</strong> ${course}
                        </p>
                        <p style="margin: 0 0 8px; font-size: 15px;">
                          <strong>Branch:</strong> ${branch}
                        </p>
                        <p style="margin: 0; font-size: 15px;">
                          <strong>Status:</strong> 
                          <span style="background-color: rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">✅ Admission Complete</span>
                        </p>
                      </div>
                      
                      <!-- Next Steps -->
                      <div style="margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; font-size: 18px; color: #333333;">🚀 What's Next?</h3>
                        <ol style="margin: 0; padding-left: 20px; color: #555555; line-height: 2.2;">
                          <li style="font-size: 15px;">Visit the campus for final document verification</li>
                          <li style="font-size: 15px;">Complete hostel allocation (if required)</li>
                          <li style="font-size: 15px;">Collect your ID card and library card</li>
                          <li style="font-size: 15px;">Attend the orientation program</li>
                        </ol>
                      </div>
                      
                      <!-- Welcome Message -->
                      <div style="background-color: #fff3e0; padding: 20px; border-radius: 4px; margin: 30px 0; border-left: 4px solid #ff9800;">
                        <p style="margin: 0; font-size: 15px; color: #e65100; font-weight: 600;">
                          Welcome to our institution! We look forward to seeing you on campus.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0 0; font-size: 15px; color: #666666; line-height: 1.6;">
                        If you have any questions, feel free to contact our admission office.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center; line-height: 1.4;">
                        This is an automated email. Please do not reply to this message.<br>
                        © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Completion email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error };
  }
}
