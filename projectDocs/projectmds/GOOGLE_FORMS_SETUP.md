# Google Forms Integration Setup Guide

Complete guide to integrate Google Forms with your **existing** ERP Google Sheet for admission applications.

## 📊 Your Current Setup

You already have a Google Sheet with:
- **Sheet ID:** `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
- **Existing tabs:** Users (with roles and login credentials)
- **Service Account:** Already configured with credentials

This guide will help you add an **Admissions** tab to your existing sheet for managing admission applications.

---

## 📋 Table of Contents
1. [Google Form Setup](#1-google-form-setup)
2. [Google Sheets Configuration](#2-google-sheets-configuration)
3. [Service Account Permissions](#3-service-account-permissions)
4. [Email Notifications Setup](#4-email-notifications-setup)
5. [Testing the Integration](#5-testing-the-integration)

---

## 1. Google Form Setup

### Step 1.1: Create Your Google Form
1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with these fields (must match your schema):

**Required Fields:**
- **Full Name** (Short answer)
- **Email Address** (Short answer)
- **Mobile Number** (Short answer)
- **Date of Birth** (Date)
- **Address** (Paragraph)
- **Guardian Name** (Short answer)
- **Guardian Contact** (Short answer)

**Academic Details:**
- **10th School Name** (Short answer)
- **10th Board** (Short answer)
- **10th Marks/Percentage** (Short answer)
- **10th Year of Passing** (Short answer)
- **12th School Name** (Short answer)
- **12th Board** (Short answer)
- **12th Marks/Percentage** (Short answer)
- **12th Year of Passing** (Short answer)
- **Course Applied For** (Dropdown or Short answer)
- **Branch/Specialization** (Dropdown or Short answer)

**Documents (File Upload):**
- **10th Marksheet** (File upload)
- **12th Marksheet** (File upload)
- **Photo** (File upload)
- **ID Proof** (File upload)

### Step 1.2: Configure File Uploads
1. For each file upload question:
   - Click on the question
   - Click the three dots (⋮)
   - Select "Response validation"
   - Set file type restrictions (PDF, images)
   - Set maximum file size (1MB recommended)

### Step 1.3: Link Form to Google Sheets
1. In your form, click **Responses** tab
2. Click the **Google Sheets icon** (📊)
3. Select **Create a new spreadsheet**
4. Name it: `Admission Applications`
5. Click **Create**

---

## 2. Google Sheets Configuration

### Step 2.1: Using Your Existing Sheet
Since you already have an existing Google Sheet with users and roles:

1. Your existing Sheet ID is: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
2. You'll add a **new tab** for Admissions data
3. This keeps your users/roles data separate from admission applications

**Your Sheet Structure:**
```
📊 Your Google Sheet
   ├─ 📄 Users (existing - with roles and logins)
   └─ 📄 Admissions (new - for admission applications)
```

### Step 2.2: Create Admissions Tab
1. Open your existing Google Sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
2. Click the **+** button at the bottom left to add a new sheet tab
3. Rename the new tab to: **`Admissions`**
4. This tab will store all admission application data

**Visual Guide:**
```
Before:
📊 Your Sheet
   └─ 📄 Users [email, password, name, role]

After:
📊 Your Sheet
   ├─ 📄 Users [email, password, name, role]
   └─ 📄 Admissions [NEW - admission data]
```

### Step 2.3: Link Google Form to Admissions Tab
When you create your Google Form:
1. Click **Responses** tab in the form
2. Click **Google Sheets icon** (📊)
3. Select **Select existing spreadsheet**
4. Choose your existing sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
5. Select the **Admissions** tab
6. Click **Select**

This will automatically add form columns to your Admissions tab.

### Step 2.4: Configure Sheet Columns
After linking the form, the Google Form will automatically create columns. You need to add these **processing columns** manually:

**Add these columns after the form columns in the Admissions tab:**
1. **Application Status** (Column after last form field) - Default: `pending`
2. **Documents Verified** (true/false)
3. **Verified By** (Staff name)
4. **Verified Date** (Date)
5. **Payment Status** (unpaid/paid)
6. **Payment Amount** (Number)
7. **Payment Method** (Cash/Online/Cheque)
8. **Payment Reference** (Text)
9. **Payment Date** (Date)
10. **Recorded By** (Staff name)
11. **Locked** (true/false)
12. **Locked By** (Staff name)
13. **Locked Date** (Date)

### Step 2.5: Set Default Values
1. In the **Admissions** tab, select row 2 in the **Application Status** column
2. Type: `pending`
3. Drag down to fill for future rows (optional, can also be set via app)

### Step 2.6: Verify .env.local Configuration
Your `.env.local` should already have:
```env
GOOGLE_SHEETS_ID=1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
ADMISSIONS_SHEET_ID=1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
GOOGLE_SHEET_NAME=Admissions
```

✅ **All set!** You're using the same Sheet ID but different tabs for different purposes.

---

## 3. Service Account Permissions

### Step 3.1: Verify Sheet Access
Since you're using an existing sheet, verify that your service account already has access:

1. Open your Google Sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
2. Click **Share** button (top right)
3. Check if this email is already listed: 
   ```
   erp-backend-service@easy-erp-478315.iam.gserviceaccount.com
   ```
4. If **already listed** ✅: Great! Skip to Step 3.2
5. If **NOT listed** ❌: Add it with **Editor** permissions

**To add service account access:**
1. Click **Share** button
2. Enter email: `erp-backend-service@easy-erp-478315.iam.gserviceaccount.com`
3. Set permission to: **Editor**
4. Uncheck "Notify people"
5. Click **Share**

**Important:** Without Editor access, your app won't be able to read/write to the Admissions tab!

### Step 3.2: Verify Access for Multiple Tabs
Your service account needs these permissions:
- ✅ Read data from **Users** tab (for authentication)
- ✅ Read data from **Admissions** tab (for applications)
- ✅ Write/update data in **Admissions** tab (for status updates)

Since the service account has Editor access to the entire spreadsheet, it can access all tabs.

### Step 3.3: Test Sheet Access
You can test if the service account can access your sheet by running:

```bash
npm run dev
# Then go to: http://localhost:3000/dashboard/admission/applications
```

If you see an error like "Requested entity was not found", the service account doesn't have access yet.

---

## 4. Email Notifications Setup

### Step 4.1: Install Nodemailer
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 4.2: Configure Email Service
Add to your `.env.local`:
```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Your ERP System <your-email@gmail.com>
```

### Step 4.3: Get Gmail App Password
If using Gmail:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Add it to `EMAIL_PASSWORD` in `.env.local`

### Step 4.4: Create Email Service
Create file: `/src/lib/email/mailer.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendAdmissionConfirmation(
  to: string,
  studentName: string,
  applicationId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Application Received - ${applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Received Successfully!</h2>
        <p>Dear ${studentName},</p>
        <p>Thank you for submitting your admission application. We have received your application with the following details:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <p>Our admission team will review your application and contact you within 2-3 business days.</p>
        <p>You can track your application status by contacting our admission office.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendDocumentVerificationEmail(
  to: string,
  studentName: string,
  applicationId: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Documents Verified - ${applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Documents Verified Successfully!</h2>
        <p>Dear ${studentName},</p>
        <p>Good news! Your documents have been verified by our admission team.</p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Status:</strong> ✅ Documents Verified</p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Complete the admission fee payment</li>
          <li>Submit payment proof to the admission office</li>
          <li>Wait for final confirmation</li>
        </ol>
        <p>Please contact our office for payment details.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export async function sendAdmissionCompleteEmail(
  to: string,
  studentName: string,
  applicationId: string,
  course: string,
  branch: string
) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Admission Confirmed - ${applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">🎉 Admission Confirmed!</h2>
        <p>Dear ${studentName},</p>
        <p>Congratulations! Your admission has been confirmed.</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>Branch:</strong> ${branch}</p>
          <p><strong>Status:</strong> ✅ Admission Complete</p>
        </div>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Visit the campus for document verification</li>
          <li>Complete hostel allocation (if required)</li>
          <li>Collect your ID card and library card</li>
          <li>Attend orientation program</li>
        </ol>
        <p>Welcome to our institution! We look forward to seeing you.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

---

## 5. Testing the Integration

### Step 5.1: Test Form Submission
1. Open your Google Form
2. Fill out all fields with test data
3. Submit the form
4. Check if data appears in Google Sheets

### Step 5.2: Test App Reading Data
1. Start your development server: `npm run dev`
2. Login to your ERP system
3. Go to: `/dashboard/admission/applications`
4. You should see the test application you just submitted

### Step 5.3: Test Email Notifications
You need to trigger emails manually from the app after setting up the email service.

**Trigger Points:**
- When documents are verified (Step 3)
- When payment is recorded (Step 4)
- When admission is completed (Step 5)

### Step 5.4: Add Email Triggers to Server Actions

Update `/src/actions/admission/verifyDocuments.ts`:
```typescript
import { sendDocumentVerificationEmail } from '@/lib/email/mailer';

// After successful verification
await sendDocumentVerificationEmail(
  application.personalDetails.email,
  application.personalDetails.fullName,
  applicationId
);
```

---

## 🔧 Troubleshooting

### Issue: "Requested entity was not found"
**Solution:** 
- ✅ Check if `GOOGLE_SHEETS_ID` in `.env.local` matches: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
- ✅ Verify service account has Editor access to your existing sheet
- ✅ Make sure the **Admissions** tab exists in your sheet
- ✅ Verify `GOOGLE_SHEET_NAME=Admissions` in `.env.local`

### Issue: "Permission denied"
**Solution:**
- Share the Google Sheet with your service account email: `erp-backend-service@easy-erp-478315.iam.gserviceaccount.com`
- Grant "Editor" permissions (not just Viewer)

### Issue: "Sheet not found" or "Unable to parse range"
**Solution:**
- Make sure the tab is named exactly: **Admissions** (case-sensitive)
- Check your `.env.local` has: `GOOGLE_SHEET_NAME=Admissions`

### Issue: Emails not sending
**Solution:**
- Check if `EMAIL_USER` and `EMAIL_PASSWORD` are correct in `.env.local`
- For Gmail, you need an **App Password** (not your regular password)
- Enable 2-Step Verification first, then generate App Password
- Check spam folder for test emails

### Issue: Form data not appearing in app
**Solution:**
- Verify Google Form is linked to the **Admissions** tab in your existing sheet
- Check if form submissions are appearing in the Admissions tab
- Refresh the applications page in your ERP dashboard
- Check browser console for any API errors

### Issue: Can't update application status
**Solution:**
- Ensure all processing columns are added to the Admissions tab
- Verify service account has Editor (not just Viewer) permissions
- Check if the row number matches (Google Sheets row numbers start from 1, header is row 1)

---

## 📝 Summary

**What you need to do with your existing sheet:**

1. ✅ Open your existing sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
2. ✅ Create a new tab named **Admissions**
3. ✅ Create Google Form with all required fields
4. ✅ Link form to your existing sheet → **Admissions** tab
5. ✅ Add processing columns (Status, Payment, etc.) to Admissions tab
6. ✅ Verify service account has Editor access to your sheet
7. ✅ Install nodemailer: `pnpm add nodemailer @types/nodemailer -D`
8. ✅ Configure email service in `.env.local` (Gmail credentials)
9. ✅ Create email service functions (already done in `/src/lib/email/mailer.ts`)
10. ✅ Add email triggers to server actions
11. ✅ Test the complete flow

**Key Differences from Fresh Setup:**
- ✅ You're NOT creating a new sheet
- ✅ You're adding a new **Admissions** tab to your existing sheet
- ✅ Your Users tab remains separate and untouched
- ✅ Same Sheet ID is used for both Users and Admissions
- ✅ Service account already has access (just verify)

**Your Final Sheet Structure:**
```
📊 Google Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
   ├─ 📄 Users
   │   ├─ Email
   │   ├─ Password
   │   ├─ Name
   │   └─ Role
   └─ 📄 Admissions (NEW)
       ├─ Timestamp
       ├─ Full Name
       ├─ Email Address
       ├─ Mobile Number
       ├─ ... (all form fields)
       ├─ Application Status
       ├─ Documents Verified
       ├─ Payment Status
       └─ ... (processing columns)
```

**Your system will then:**
- 📝 Collect form submissions automatically in Admissions tab
- � Keep user authentication in Users tab (separate)
- �📊 Display applications in the dashboard
- 📧 Send email notifications at each step
- ✅ Track application status through 5 steps
- 🔒 Lock completed applications

---

## 🚀 Quick Start Checklist

Use this checklist to track your progress:

### Sheet Setup
- [ ] Open existing sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
- [ ] Create new tab named **Admissions**
- [ ] Verify service account has Editor access

### Google Form Setup
- [ ] Create Google Form with all required fields (see Step 1.1)
- [ ] Configure file upload questions
- [ ] Link form to existing sheet → Admissions tab
- [ ] Test form submission to verify data appears

### Admissions Tab Configuration
- [ ] Add **Application Status** column (default: pending)
- [ ] Add **Documents Verified** column
- [ ] Add **Verified By** column
- [ ] Add **Verified Date** column
- [ ] Add **Payment Status** column
- [ ] Add **Payment Amount** column
- [ ] Add **Payment Method** column
- [ ] Add **Payment Reference** column
- [ ] Add **Payment Date** column
- [ ] Add **Recorded By** column
- [ ] Add **Locked** column
- [ ] Add **Locked By** column
- [ ] Add **Locked Date** column

### Email Setup
- [ ] Already installed nodemailer: `pnpm add nodemailer @types/nodemailer -D` ✅
- [ ] Enable Gmail 2-Step Verification
- [ ] Generate Gmail App Password
- [ ] Update `EMAIL_USER` in `.env.local`
- [ ] Update `EMAIL_PASSWORD` in `.env.local`
- [ ] Update `EMAIL_FROM` in `.env.local`

### Testing
- [ ] Submit test application via Google Form
- [ ] Check if data appears in Admissions tab
- [ ] Login to ERP dashboard
- [ ] Navigate to Applications page
- [ ] Verify test application is visible
- [ ] Test document verification workflow
- [ ] Test payment recording workflow
- [ ] Test admission completion workflow
- [ ] Verify emails are sent at each step

---

## 🎯 Next Steps

After completing this setup:

1. **Customize email templates** with your institution's branding
2. **Add SMS notifications** (optional - using Twilio/similar)
3. **Create application form page** on your website with the Google Form embedded
4. **Set up automatic notifications** when new applications arrive
5. **Create analytics dashboard** for admission statistics

Need help? Check the code comments in:
- `/src/lib/google/sheets.admission.ts`
- `/src/actions/admission/*.ts`
- `/src/types/admission.ts`
