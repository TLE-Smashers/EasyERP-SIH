# 📊 Sheet Structure Visualization

## Your Current Setup

### Before Integration
```
┌─────────────────────────────────────────────────────────────┐
│  Google Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw │
└─────────────────────────────────────────────────────────────┘
                            │
                            └─── 📄 Users Tab
                                  ├─ Email
                                  ├─ Password  
                                  ├─ Name
                                  └─ Role
```

### After Integration (What You'll Create)
```
┌─────────────────────────────────────────────────────────────┐
│  Google Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw │
└─────────────────────────────────────────────────────────────┘
            │
            ├─── 📄 Users Tab (UNCHANGED)
            │     ├─ Email
            │     ├─ Password  
            │     ├─ Name
            │     └─ Role
            │
            └─── 📄 Admissions Tab (NEW)
                  ├─ Timestamp
                  ├─ Full Name
                  ├─ Email Address
                  ├─ Mobile Number
                  ├─ Date of Birth
                  ├─ Address
                  ├─ Guardian Name
                  ├─ Guardian Contact
                  ├─ 10th School Name
                  ├─ 10th Board
                  ├─ 10th Marks/Percentage
                  ├─ 10th Year of Passing
                  ├─ 12th School Name
                  ├─ 12th Board
                  ├─ 12th Marks/Percentage
                  ├─ 12th Year of Passing
                  ├─ Course Applied For
                  ├─ Branch/Specialization
                  ├─ 10th Marksheet (File URL)
                  ├─ 12th Marksheet (File URL)
                  ├─ Photo (File URL)
                  ├─ ID Proof (File URL)
                  │
                  ├─ Application Status ⬅️ YOU ADD THIS
                  ├─ Documents Verified ⬅️ YOU ADD THIS
                  ├─ Verified By ⬅️ YOU ADD THIS
                  ├─ Verified Date ⬅️ YOU ADD THIS
                  ├─ Payment Status ⬅️ YOU ADD THIS
                  ├─ Payment Amount ⬅️ YOU ADD THIS
                  ├─ Payment Method ⬅️ YOU ADD THIS
                  ├─ Payment Reference ⬅️ YOU ADD THIS
                  ├─ Payment Date ⬅️ YOU ADD THIS
                  ├─ Recorded By ⬅️ YOU ADD THIS
                  ├─ Locked ⬅️ YOU ADD THIS
                  ├─ Locked By ⬅️ YOU ADD THIS
                  └─ Locked Date ⬅️ YOU ADD THIS
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  Student fills  │
│  Google Form    │
└────────┬────────┘
         │
         │ Automatic submission
         ▼
┌─────────────────────────────────┐
│     Google Sheet (Admissions)   │
│  - Form data auto-populated     │
│  - Processing columns empty     │
└────────┬────────────────────────┘
         │
         │ Service Account reads data
         ▼
┌─────────────────────────────────┐
│     ERP Dashboard               │
│  /dashboard/admission/          │
│  applications                   │
└────────┬────────────────────────┘
         │
         │ Staff processes application
         │
         ├── Step 3: Verify Documents
         │    └─ Updates: Documents Verified, Verified By, Verified Date
         │    └─ Sends: Document Verification Email ✉️
         │
         ├── Step 4: Record Payment
         │    └─ Updates: Payment Status, Amount, Method, Date
         │    └─ Sends: Payment Confirmation Email ✉️
         │
         └── Step 5: Complete Admission
              └─ Updates: Locked, Locked By, Locked Date
              └─ Sends: Admission Complete Email ✉️
```

---

## How Service Account Works

```
┌──────────────────────────────────────────────────┐
│  Your Google Sheet                               │
│  ID: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw│
└──────────────────────────────────────────────────┘
                    ▲
                    │
        ┌───────────┴───────────┐
        │   Shared with:        │
        │   Editor permissions  │
        └───────────┬───────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  Service Account                                 │
│  erp-backend-service@easy-erp-478315...          │
└──────────────────────────────────────────────────┘
                    ▲
                    │
        ┌───────────┴───────────┐
        │   Authenticates       │
        │   using credentials   │
        └───────────┬───────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  Your ERP Application                            │
│  - Reads from Admissions tab                     │
│  - Writes status updates                         │
│  - Sends emails                                  │
└──────────────────────────────────────────────────┘
```

---

## Application Processing Workflow

```
┌─────────────┐
│  New        │
│  Application│
│  Submitted  │
└──────┬──────┘
       │
       │ Status: "pending"
       ▼
┌─────────────────────────────────┐
│  Step 1: Application Details    │  ← Staff views application
│  Status: "pending"               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 2: Academic Details       │  ← Staff reviews academics
│  Status: "pending"               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 3: Verify Documents       │  ← Staff clicks "Verify"
│  Status: "documents_verified"   │
│  ✉️ Email: Documents Verified   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 4: Record Payment         │  ← Staff enters payment
│  Status: "payment_completed"    │
│  ✉️ Email: Payment Confirmed    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 5: Complete Admission     │  ← Staff clicks "Complete"
│  Status: "completed"             │
│  Locked: true                    │
│  ✉️ Email: Admission Complete   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│  ✅ Done    │
│  Locked     │
└─────────────┘
```

---

## Email Notification Flow

```
┌──────────────────┐
│  Step 3:         │
│  Documents       │──┐
│  Verified        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│  Step 4:         │  │
│  Payment         │──┤
│  Recorded        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│  Step 5:         │  │
│  Admission       │──┤
│  Complete        │  │
└──────────────────┘  │
                      │
                      ▼
            ┌─────────────────┐
            │  Email Service  │
            │  (Nodemailer)   │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Gmail SMTP     │
            │  Server         │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Student        │
            │  Receives Email │
            │  📧             │
            └─────────────────┘
```

---

## Quick Reference

### Environment Variables
```
GOOGLE_SHEETS_ID=1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
GOOGLE_SHEET_NAME=Admissions
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Important Locations
- **Sheet URL:** https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit
- **Dashboard:** http://localhost:3000/dashboard/admission/applications
- **Email Service:** `/src/lib/email/mailer.ts`
- **Sheet Service:** `/src/lib/google/sheets.admission.ts`

### Processing Columns to Add
```
Application Status → pending
Documents Verified → true/false
Verified By → Staff name
Verified Date → Date
Payment Status → unpaid/paid
Payment Amount → Number
Payment Method → Cash/Online/Cheque
Payment Reference → Text
Payment Date → Date
Recorded By → Staff name
Locked → true/false
Locked By → Staff name
Locked Date → Date
```
