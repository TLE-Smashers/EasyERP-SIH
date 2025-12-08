# 🚨 FIX ERRORS - DO THIS NOW

## The Problem
Error: **"Unable to parse range: Admissions!A2:AM2"**

This means the **Admissions** tab doesn't exist in your Google Sheet yet.

---

## ✅ Quick Fix (5 minutes)

### 1️⃣ Open Your Google Sheet
**Click this link:** https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit

### 2️⃣ Create Admissions Tab
1. Look at the bottom left - you'll see sheet tabs
2. Click the **+** button (next to existing tabs)
3. Right-click the new tab
4. Select **"Rename"**
5. Type: **`Admissions`** (exactly this, capital A)
6. Press Enter

### 3️⃣ Add Column Headers (Row 1)
Click on cell **A1** and type these headers:

```
A1: Timestamp
B1: Email
C1: Full Name
D1: Mobile Number
E1: Date of Birth
F1: Address
G1: Guardian Name
H1: Guardian Contact
I1: 10th School Name
J1: 10th Board
K1: 10th Marks
L1: 10th Year
M1: 12th School Name
N1: 12th Board
O1: 12th Marks
P1: 12th Year
Q1: Course
R1: Branch
S1: 10th Marksheet
T1: 12th Marksheet
U1: Photo
V1: ID Proof
W1: Application Status
X1: Documents Verified
Y1: Verified By
Z1: Verified Date
AA1: Verification Notes
AB1: Payment Status
AC1: Payment Method
AD1: Transaction ID
AE1: Payment Date
AF1: Amount Received
AG1: Payment Remarks
AH1: Receipt ID
AI1: Receipt URL
AJ1: Reporting Date
AK1: Assigned Batch
AL1: Assigned Section
AM1: Final Remarks
AN1: Locked
AO1: Locked By
AP1: Locked Date
```

**Important:** Columns S-V (10th Marksheet, 12th Marksheet, Photo, ID Proof) will automatically be filled by Google Forms with Google Drive URLs when students upload files.

**Tip:** You can copy-paste each header quickly. The Google Form will also add these automatically when you link it, but having them now prevents errors.

### 4️⃣ Add a Test Row (Optional)
In Row 2, add some dummy data:
- A2: `11/16/2025 10:00:00`
- B2: `test@example.com`
- C2: `Test Student`
- D2: `1234567890`
- T2: `pending` (Application Status)

This will help you test the dashboard.

### 5️⃣ Verify Service Account Access
1. Click **Share** button (top right)
2. Check if this email is listed:
   ```
   erp-backend-service@easy-erp-478315.iam.gserviceaccount.com
   ```
3. If NOT listed:
   - Click **Share**
   - Enter: `erp-backend-service@easy-erp-478315.iam.gserviceaccount.com`
   - Set role: **Editor**
   - Uncheck "Notify people"
   - Click **Share**

### 6️⃣ Refresh Your App
1. Go back to your browser with the ERP app
2. Press **Ctrl+R** (or Cmd+R on Mac) to refresh
3. The errors should be gone!

---

## 📋 Your Sheet Structure After This

```
📊 Google Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw

├─ 📄 Users (existing)
│  └─ Your login data
│
└─ 📄 Admissions (NEW - you just created)
   └─ 39 columns ready for data
```

---

## 🎯 Next Steps After Fixing

Once the errors are gone:

1. **Create Google Form** (follow ADMISSIONS_INTEGRATION_STEPS.md)
2. **Link form to Admissions tab**
3. **Submit test application via form**
4. **View in ERP dashboard**

---

## ⚠️ Important Notes

- Tab name must be **exactly** `Admissions` (capital A)
- Service account MUST have Editor access
- Don't delete the Users tab
- Both tabs can exist in the same sheet

---

**Time to fix:** ~5 minutes
**After this:** Your app will work perfectly! ✨
