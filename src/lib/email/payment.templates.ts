/**
 * Payment Email Templates
 * Modular email templates for payment-related communications
 */

/**
 * Generate Payment Link Email HTML
 * @param params - Email parameters
 * @returns HTML email content
 */
export function generatePaymentLinkEmail(params: {
  studentName: string;
  applicationId: string;
  amount: number;
  currency: string;
  paymentLink: string;
  expiresIn: string;
  courseName?: string;
}): string {
  const { studentName, applicationId, amount, currency, paymentLink, expiresIn, courseName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Required - Easy ERP</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .success-icon {
      text-align: center;
      font-size: 48px;
      margin: 20px 0;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 5px 0;
    }
    .info-box strong {
      color: #667eea;
    }
    .payment-button {
      text-align: center;
      margin: 30px 0;
    }
    .payment-button a {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s;
    }
    .payment-button a:hover {
      transform: translateY(-2px);
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
    .divider {
      height: 1px;
      background: #e9ecef;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Government Engineering College Bilaspur</h1>
      <p>Admission Application Update</p>
    </div>
    
    <div class="content">
      <div class="success-icon">✅</div>
      
      <h2 style="color: #28a745; text-align: center;">Documents Verified Successfully!</h2>
      
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <p>We are pleased to inform you that your admission documents have been successfully verified by our team.</p>
      
      <div class="divider"></div>
      
      <h3 style="color: #667eea; margin-top: 25px;">📝 Next Step: Admission Fee Payment</h3>
      
      <p>To proceed with your admission to <strong>Government Engineering College Bilaspur</strong>, please complete the admission fee payment.</p>
      
      <div class="info-box">
        <p><strong>Application ID:</strong> ${applicationId}</p>
        ${courseName ? `<p><strong>Course:</strong> ${courseName}</p>` : ''}
        <p><strong>Institution:</strong> Government Engineering College Bilaspur</p>
        <p><strong>Payment Purpose:</strong> Admission Fee</p>
        <p><strong>Amount Payable:</strong> ₹${amount.toLocaleString()}</p>
      </div>
      
      <div class="payment-button">
        <a href="${paymentLink}" target="_blank">Pay Now - Secure Payment</a>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ Important:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This payment link will expire in <strong>${expiresIn}</strong></li>
          <li>Please complete the payment before expiry</li>
          <li>You will receive a confirmation email after successful payment</li>
          <li>Keep your payment receipt for future reference</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #6c757d;">
        If you have any questions or face issues with the payment, please contact our admissions office.
      </p>
      
      <p style="margin-top: 20px;">
        Best regards,<br>
        <strong>Easy ERP Admissions Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Easy ERP. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate Payment Success Email HTML
 * @param params - Email parameters
 * @returns HTML email content
 */
export function generatePaymentSuccessEmail(params: {
  studentName: string;
  applicationId: string;
  amount: number;
  currency: string;
  paymentId: string;
  paidAt: string;
  courseName?: string;
}): string {
  const { studentName, applicationId, amount, currency, paymentId, paidAt, courseName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - Easy ERP</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .success-icon {
      text-align: center;
      font-size: 64px;
      margin: 20px 0;
    }
    .info-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 5px 0;
    }
    .info-box strong {
      color: #059669;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Easy ERP</h1>
      <p>Payment Confirmation</p>
    </div>
    
    <div class="content">
      <div class="success-icon">✅</div>
      
      <h2 style="color: #10b981; text-align: center;">Payment Successful!</h2>
      
      <p>Dear <strong>${studentName}</strong>,</p>
      
      <p>Thank you for completing your payment. Your admission process is now complete!</p>
      
      <div class="info-box">
        <p><strong>Application ID:</strong> ${applicationId}</p>
        ${courseName ? `<p><strong>Course:</strong> ${courseName}</p>` : ''}
        <p><strong>Amount Paid:</strong> ${currency} ${amount.toLocaleString()}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Payment Date:</strong> ${new Date(paidAt).toLocaleString()}</p>
      </div>
      
      <p>Your admission has been confirmed. You will receive further instructions via email regarding the next steps.</p>
      
      <p style="margin-top: 20px;">
        Best regards,<br>
        <strong>Easy ERP Admissions Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Easy ERP. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
