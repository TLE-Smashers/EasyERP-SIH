# 🚀 Admissions Integration - Next Steps

## Quick Summary
You want to integrate Google Forms with your **existing Google Sheet** that already contains user roles and logins.

**Your Existing Sheet:** `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`

---

## ✅ What's Already Done

1. ✅ Service account configured
2. ✅ Email service created (`/src/lib/email/mailer.ts`)
3. ✅ Nodemailer installed
4. ✅ Environment variables configured
5. ✅ Admission processing logic ready

---

## 📋 What You Need to Do Now

### Step 1: Prepare Your Existing Sheet (5 minutes)

1. **Open your sheet:**
   - Go to: https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit

2. **Add new tab for Admissions:**
   - Click the **+** button at bottom left
   - Name it: **`Admissions`** (exactly this name)
   
3. **Verify service account access:**
   - Click **Share** button
   - Check if this email has Editor access:
     ```
     erp-backend-service@easy-erp-478315.iam.gserviceaccount.com
     ```
   - If not listed, add it with **Editor** permissions

---

### Step 2: Create Google Form (10 minutes)

1. **Go to:** https://forms.google.com
2. **Create new form** with these fields:

**Personal Information:**
- Full Name (Short answer)
- Email Address (Short answer)
- Mobile Number (Short answer)
- Date of Birth (Date)
- Address (Paragraph)
- Guardian Name (Short answer)
- Guardian Contact (Short answer)

**Academic Details:**
- 10th School Name (Short answer)
- 10th Board (Short answer)
- 10th Marks/Percentage (Short answer)
- 10th Year of Passing (Short answer)
- 12th School Name (Short answer)
- 12th Board (Short answer)
- 12th Marks/Percentage (Short answer)
- 12th Year of Passing (Short answer)
- Course Applied For (Dropdown)
- Branch/Specialization (Dropdown)

**Documents (File Upload):**
- 10th Marksheet (File upload)
- 12th Marksheet (File upload)
- Photo (File upload)
- ID Proof (File upload)

3. **Configure file uploads:**
   - Click each file upload question
   - Set max file size: 1MB
   - Allow: PDF and Images

---

### Step 3: Link Form to Your Sheet (2 minutes)

1. **In your Google Form:**
   - Click **Responses** tab
   - Click **Google Sheets icon** (📊)
   - Select **"Select existing spreadsheet"**
   - Choose your sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
   - Select tab: **Admissions**
   - Click **Select**

2. **Verify:**
   - Submit a test form
   - Check if data appears in Admissions tab

---

### Step 4: Add Processing Columns (5 minutes)

In the **Admissions** tab, add these columns **after** the form columns:

**Column Names (add exactly as shown):**
1. `10th Marksheet` (Google Forms will fill with Drive URL)
2. `12th Marksheet` (Google Forms will fill with Drive URL)
3. `Photo` (Google Forms will fill with Drive URL)
4. `ID Proof` (Google Forms will fill with Drive URL)
5. `Application Status`
6. `Documents Verified`
7. `Verified By`
8. `Verified Date`
9. `Verification Notes`
10. `Payment Status`
11. `Payment Amount`
12. `Payment Method`
13. `Payment Reference`
14. `Payment Date`
15. `Recorded By`
16. `Receipt ID`
17. `Receipt URL`
18. `Reporting Date`
19. `Assigned Batch`
20. `Assigned Section`
21. `Final Remarks`
22. `Locked`
23. `Locked By`
24. `Locked Date`

**Note:** The first 4 columns (document columns) will be automatically created by Google Forms when you add file upload questions. Just add the column headers. The app will automatically set the status to "pending" for new applications. You don't need to fill in any data manually.

---

### Step 5: Configure Email Service (5 minutes)

1. **Get Gmail App Password:**
   - Go to: https://myaccount.google.com/security
   - Enable **2-Step Verification**
   - Go to **App Passwords**
   - Create new app password for "Mail"
   - Copy the 16-character password

2. **Update `.env.local`:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password you just got
   EMAIL_FROM=Your Institution Name <your-email@gmail.com>
   ```

---

### Step 6: Test Everything (5 minutes)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Login to your ERP:**
   - Go to: http://localhost:3000/login

3. **Check applications page:**
   - Go to: http://localhost:3000/dashboard/admission/applications
   - You should see your test application

4. **Test email notifications:**
   - Process an application through the steps
   - Verify emails are sent

---

## 🎯 Your Sheet Structure After Setup

```
📊 Google Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw

├─ 📄 Users (UNCHANGED)
│  ├─ Email
│  ├─ Password
│  ├─ Name
│  └─ Role
│
└─ 📄 Admissions (NEW)
   ├─ Timestamp (auto from form)
   ├─ Full Name (from form)
   ├─ Email Address (from form)
   ├─ ... all form fields ...
   ├─ Application Status (manual)
   ├─ Documents Verified (manual)
   └─ ... processing columns ...
```

---

## 🆘 Quick Troubleshooting

**Problem:** Can't see applications in dashboard
- ✅ Check if Admissions tab exists
- ✅ Verify service account has Editor access
- ✅ Check `.env.local` has correct `GOOGLE_SHEET_NAME=Admissions`

**Problem:** Form not saving to sheet
- ✅ Verify form is linked to correct sheet and tab
- ✅ Submit a test form and check the Admissions tab

**Problem:** Emails not sending
- ✅ Use Gmail App Password (not regular password)
- ✅ Enable 2-Step Verification first
- ✅ Check spam folder

---

## 📚 Full Documentation

For complete details, see: [GOOGLE_FORMS_SETUP.md](./GOOGLE_FORMS_SETUP.md)

---

## ✨ What Happens After Setup

Once you complete these steps:

1. **Students submit applications** via Google Form
2. **Data automatically appears** in Admissions tab
3. **Your ERP dashboard** shows all applications
4. **Staff can process** applications through 5 steps:
   - Step 1: View application
   - Step 2: Review details
   - Step 3: Verify documents
   - Step 4: Record payment
   - Step 5: Complete admission
5. **Email notifications** sent at each step
6. **Applications locked** when complete

---

**Need help?** Check the full guide in `GOOGLE_FORMS_SETUP.md`

**Time to complete:** ~30 minutes total
