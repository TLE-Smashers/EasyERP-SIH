# Email System - Apps Script Setup

## ✅ Why Apps Script for ALL Emails?

1. **Beautiful HTML emails** - Full styling support
2. **Non-blocking** - Doesn't slow down Next.js app
3. **No credentials needed** - Gmail already authorized
4. **Instant delivery** - Triggered on sheet changes
5. **No quota issues** - 500 emails/day from Apps Script
6. **Centralized** - All email templates in one place

---

## 🔧 Setup Steps

### Step 1: Add Email Tracking Columns

Add these columns to your sheets:

**Admissions Sheet:**
- `admissionEmailSent` (after finalRemarks)
- `verificationEmailSent`
- `completionEmailSent`

**Payments Sheet:**
- `emailSent` (after remarks)

### Step 2: Install Apps Script

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy entire content from `scripts/EmailSystem.gs`
5. Paste into Apps Script editor
6. Click **Save** (💾 icon)
7. Name it: "Email System"

### Step 3: Set Up Triggers

Create **TWO triggers**:

**Trigger A: Admission Form Submit**
1. Click **Triggers** (⏰ clock icon)
2. Click **+ Add Trigger**
3. Configure:
   - Function: `onAdmissionFormSubmit`
   - Event source: From spreadsheet
   - Event type: **On form submit**
4. Save & authorize

**Trigger B: Sheet Edit (Payment & Status Changes)**
1. Click **+ Add Trigger** again
2. Configure:
   - Function: `onSheetEdit`
   - Event source: From spreadsheet
   - Event type: **On edit**
3. Save & authorize

### Step 4: Test Email System

Run the test function:
1. In Apps Script, select `testAllEmails` from dropdown
2. Click **Run** (▶️)
3. Check your Gmail inbox for 4 test emails:
   - 📋 Application Received
   - ✅ Documents Verified
   - 💳 Payment Received
   - 🎉 Admission Confirmed

All should have beautiful HTML formatting!

---

## 📧 Email Flow

### 1. Admission Confirmation Email
**Trigger:** Form submission
**When:** Student submits Google Form
**Template:** Purple gradient header
**Content:** 
- Application ID
- Status: Under Review
- Next steps

### 2. Document Verification Email
**Trigger:** `documentsVerified` changes to TRUE
**When:** Admin verifies documents
**Template:** Green gradient header
**Content:**
- Verified status
- Verified by name
- Payment next steps

### 3. Payment Confirmation Email
**Trigger:** `paymentStatus` changes to "paid"
**When:** Payment webhook updates status
**Template:** Blue gradient header
**Content:**
- Receipt ID
- Amount paid
- Payment date
- Next steps

### 4. Admission Completion Email
**Trigger:** `locked` changes to TRUE
**When:** Admin locks admission
**Template:** Pink gradient header
**Content:**
- Confirmation message
- Course & Branch
- Welcome message
- Orientation info

---

## 🎨 Email Templates

All emails feature:
- ✅ Responsive design (mobile-friendly)
- ✅ Beautiful gradient headers
- ✅ Color-coded status badges
- ✅ Structured information boxes
- ✅ Clear next steps
- ✅ Professional footer

### Color Scheme:
- **Admission:** Purple gradient (#667eea → #764ba2)
- **Verification:** Green gradient (#11998e → #38ef7d)
- **Payment:** Blue gradient (#2196f3 → #1976d2)
- **Completion:** Pink gradient (#f093fb → #f5576c)

---

## 🔍 How It Works

### Next.js Side:
```
1. User action happens (form submit, payment, etc.)
2. Next.js updates Google Sheet via API
3. Sets emailSent column to FALSE
4. Returns success to user
```

### Apps Script Side:
```
1. Sheet edit detected
2. Apps Script checks: emailSent = FALSE?
3. If yes, generates beautiful HTML email
4. Sends via MailApp.sendEmail()
5. Sets emailSent = TRUE
```

**Result:** Instant, beautiful emails without blocking Next.js!

---

## 🐛 Troubleshooting

### Email Not Sending?

**Check 1: Columns exist**
```
Admissions: admissionEmailSent, verificationEmailSent, completionEmailSent
Payments: emailSent
```

**Check 2: Trigger is active**
- Go to Triggers in Apps Script
- Both triggers should show "Active"

**Check 3: Execution logs**
- Click **Executions** in Apps Script
- Look for errors or "✅ Email sent" logs

**Check 4: Gmail quota**
- Apps Script allows 500 emails/day
- Check quota: Tools > Quotas in Apps Script

### Re-send Failed Email

Simply change the `emailSent` column from TRUE to FALSE. Apps Script will retry on next edit.

### Test Individual Email

Use these functions:
- `testAllEmails()` - Send all 4 types to yourself
- `sendAllPendingEmails()` - Batch process all pending

---

## 📊 Monitoring

### View Email Status

**Admissions Sheet:**
- `admissionEmailSent = TRUE` → Confirmation sent
- `verificationEmailSent = TRUE` → Verification sent
- `completionEmailSent = TRUE` → Completion sent

**Payments Sheet:**
- `emailSent = TRUE` → Payment confirmation sent

### Execution History

1. Apps Script > **Executions**
2. See all email sends with timestamps
3. Filter by status: Success / Failed
4. Click for detailed logs

---

## 🎯 Production Recommendations

1. **Test thoroughly** - Run `testAllEmails()` first
2. **Monitor first week** - Check Executions daily
3. **Backup trigger** - Optional: Time-based backup every hour
4. **Email quota** - 500/day = ~20/hour safe limit
5. **Customize templates** - Edit HTML in Apps Script as needed

---

## 🔄 Next.js Changes Needed

Remove nodemailer calls, just update sheet:

```typescript
// OLD: Send email via nodemailer
await sendPaymentConfirmationEmail(...)

// NEW: Just update sheet (Apps Script handles email)
await updatePaymentRecord(id, {
  paymentStatus: 'paid',
  // emailSent defaults to FALSE
})
```

Apps Script detects the change and sends email automatically!

---

## 📝 Manual Operations

### Send All Pending Emails
```javascript
// Run in Apps Script
sendAllPendingEmails()
```

### Test Email System
```javascript
// Run in Apps Script
testAllEmails()
```

### Check Specific Row
```javascript
// In Apps Script console
handleAdmissionEdit(sheet, 5) // Row 5
handlePaymentEdit(sheet, 10)  // Row 10
```

---

## ✨ Benefits Summary

| Feature | Nodemailer | Apps Script |
|---------|-----------|-------------|
| Setup | Complex credentials | Already authorized |
| Performance | Blocks Next.js | Non-blocking |
| HTML Support | Yes | Yes (better) |
| Quota | Gmail limits | 500/day Apps Script |
| Monitoring | Server logs | Apps Script Executions |
| Error Handling | Try-catch | Built-in retry |
| Testing | Separate script | Built-in functions |

**Winner:** Apps Script for all email operations! 🏆

---

**Status:** ✅ Ready to deploy  
**Last Updated:** November 2025  
**Version:** 2.0 (Complete Apps Script Email System)
