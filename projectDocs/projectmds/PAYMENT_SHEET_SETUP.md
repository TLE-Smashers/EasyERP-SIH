# Google Sheets Payment Setup Guide

## 📋 Setup Instructions

### Step 1: Open Your Google Sheets Spreadsheet
Open the same Google Sheets file you're using for the ERP system (the one with Admissions data).

### Step 2: Create a New Sheet Named "Payments"
1. Click the **+ button** at the bottom of your spreadsheet
2. Name the new sheet: **Payments** (case-sensitive)
3. This will be used to store all payment records

### Step 3: Add Column Headers
Copy and paste this **entire first row** into your new Payments sheet (columns A to AP):

```
# Google Sheets Payment Setup Guide

## 📋 Setup Instructions

### Step 1: Open Your Google Sheets Spreadsheet
Open the same Google Sheets file you're using for the ERP system (the one with Admissions data).

### Step 2: Create a New Sheet Named "Payments"
1. Click the **+ button** at the bottom of your spreadsheet
2. Name the new sheet: **Payments** (case-sensitive)
3. This will be used to store all payment records

### Step 3: Add Column Headers (camelCase Keys)
Copy and paste this **entire first row** into your new Payments sheet:

```
paymentId	referenceNumber	timestamp	applicationId	studentId	studentName	email	mobile	course	branch	paymentType	academicYear	semester	rollNumber	fatherName	category	tuitionFee	amalgamatedFund	sportsFee	cautionMoney	transferCertificateFee	libraryCardReissueFee	penaltyFee	otherFees	transactionCharges	totalAmount	amountInWords	paymentStatus	paymentMethod	razorpayLinkId	razorpayPaymentId	razorpayOrderId	razorpayShortUrl	transactionId	paymentDate	createdBy	createdDate	updatedBy	updatedDate	receiptUrl	notes	remarks
```

**IMPORTANT:** These headers use camelCase format (e.g., `paymentId`, `studentName`) instead of spaces. This allows columns to be reordered without breaking the system!

### Step 4: Format the Headers (Optional but Recommended)
1. Select row 1 (the header row)
2. Make it **bold**
3. Add a **background color** (e.g., light blue or gray)
4. **Freeze the first row**: View → Freeze → 1 row
5. Apply **text wrapping** if needed: Format → Text wrapping → Wrap

### Step 5: Set Column Widths (Recommended)
Adjust these columns for better visibility:
- **A (paymentId)**: 150px
- **B (referenceNumber)**: 120px
- **F (studentName)**: 180px
- **G (email)**: 200px
- **Z (totalAmount)**: 120px
- **AA (amountInWords)**: 300px
- **AB (paymentStatus)**: 100px
- **AC (paymentMethod)**: 120px

### Step 6: Apply Data Validation (Optional)
For better data integrity, add validation:

**paymentStatus Column:**
- Data → Data validation
- Criteria: List of items
- Values: `unpaid,paid,partial,failed,refunded`

**paymentMethod Column:**
- Data → Data validation
- Criteria: List of items
- Values: `razorpay,cash,bank_transfer,cheque`

**paymentType Column:**
- Data → Data validation
- Criteria: List of items
- Values: `admission,semester,exam,hostel,library,other`
```

### Step 4: Format the Headers (Optional but Recommended)
1. Select row 1 (the header row)
2. Make it **bold**
3. Add a **background color** (e.g., light blue or gray)
4. **Freeze the first row**: View → Freeze → 1 row
5. Apply **text wrapping** if needed: Format → Text wrapping → Wrap

### Step 5: Set Column Widths (Recommended)
Adjust these columns for better visibility:
- **A (Payment ID)**: 150px
- **B (Reference Number)**: 120px
- **F (Student Name)**: 180px
- **G (Email)**: 200px
- **Z (Total Amount)**: 120px
- **AA (Amount in Words)**: 300px
- **AB (Payment Status)**: 100px
- **AC (Payment Method)**: 120px

### Step 6: Apply Data Validation (Optional)
For better data integrity, add validation:

**Payment Status (Column AB):**
- Data → Data validation
- Criteria: List of items
- Values: `unpaid,paid,partial,failed,refunded`

**Payment Method (Column AC):**
- Data → Data validation
- Criteria: List of items
- Values: `razorpay,cash,bank_transfer,cheque`

**Payment Type (Column K):**
- Data → Data validation
- Criteria: List of items
- Values: `admission,semester,exam,hostel,library,other`

### Step 7: Verify Column Order (Flexible!)
✅ **Great News:** The system now uses **header-based mapping** instead of fixed column positions!

This means you can:
- ✅ Reorder columns without breaking anything
- ✅ Add new columns between existing ones
- ✅ Hide columns you don't need to see
- ✅ The system will automatically find the right column based on the header name

**Just make sure:**
- Headers are in the **first row**
- Headers use exact **camelCase** names from Step 3
- Don't rename the headers (column order doesn't matter, but names do!)

---

## 📊 Column Structure Overview

### **All 42 Columns** (Reorder-Safe!):

#### **Identifiers**
- `paymentId` - Auto-generated with timestamp (PAY-2025-1117-143052-892)
- `referenceNumber` - Display reference (DUL8624765)
- `timestamp` - Creation time

#### **Foreign Keys**
- `applicationId` - Links to Admission sheet
- `studentId` - Future use

#### **Student Info** - Duplicated for fast queries
- `studentName`
- `email`
- `mobile`
- `course`
- `branch`
- `paymentType`
- `academicYear`
- `semester`
- `rollNumber`
- `fatherName`
- `category` (OBC/General/SC/ST)

#### **Fee Breakdown** - 9 categories
- `tuitionFee`
- `amalgamatedFund`
- `sportsFee`
- `cautionMoney`
- `transferCertificateFee`
- `libraryCardReissueFee`
- `penaltyFee`
- `otherFees`
- `transactionCharges`

#### **Totals**
- `totalAmount` (auto-calculated)
- `amountInWords` (auto-generated in Indian format)

#### **Payment Details**
- `paymentStatus`
- `paymentMethod`

#### **Razorpay Integration**
- `razorpayLinkId`
- `razorpayPaymentId`
- `razorpayOrderId`
- `razorpayShortUrl`

#### **Transaction**
- `transactionId`
- `paymentDate`

#### **Audit Fields**
- `createdBy` (staff email)
- `createdDate`
- `updatedBy`
- `updatedDate`

#### **Additional**
- `receiptUrl`
- `notes`
- `remarks`

---

## 🔧 Verification Steps

After setup, verify:

1. **Sheet name is exactly**: `Payments` (case-sensitive)
2. **42 columns** from A to AP
3. **Headers in row 1** match the list above
4. **Freeze row 1** for easy scrolling
5. **No extra rows** above the headers

---

## 🎯 What Happens Next

Once the sheet is set up:

1. ✅ **System will auto-create payment records** when staff clicks "Record Payment"
2. ✅ **Payment IDs** will be generated automatically with timestamp (PAY-2025-1117-143052-892)
3. ✅ **Reference numbers** will be generated (DUL8624765 format)
4. ✅ **Razorpay webhook** will auto-update payment status when students pay
5. ✅ **Receipt emails** will be sent automatically
6. ✅ **Dashboard stats** will calculate from this data

---

## 🚨 Important Notes

- **Column order doesn't matter** - System uses header names, not positions!
- **Don't rename headers** - Use exact camelCase names from Step 3
- **Don't manually edit** `paymentId`, `referenceNumber`, `timestamp`, `totalAmount`, `amountInWords` (system-generated)
- **Keep the sheet name** as `Payments` (don't rename)
- **Don't delete** any column headers
- **Don't add rows** above the header row
- **Share the spreadsheet** with your Google Service Account email
- **You CAN reorder columns** - System will automatically adapt!

---

## 📝 Example First Payment Row

After staff creates the first payment, row 2 might look like:

```
PAY-2025-1117-143052-892 | DUL8624765 | 2024-11-17T10:30:00Z | APP-2024-0123 | | John Doe | john@example.com | 9876543210 | B.Tech | Computer Science | admission | 2024-25 | 1 | | Ram Sharma | General | 50000 | 2500 | 250 | 5000 | 100 | 0 | 0 | 500 | 1180 | 59530 | Rupees Fifty Nine Thousand Five Hundred Thirty Only | paid | razorpay | plink_xxx | pay_xxx | order_xxx | https://rzp.io/xxx | pay_xxx | 2024-11-17T10:35:00Z | admin@college.com | 2024-11-17T10:30:00Z | system | 2024-11-17T10:35:00Z | https://drive.google.com/xxx | | |
```

**Note:** Columns can be in any order - the system will find them by header name!

---

## ✅ Ready to Test

Once you've completed these steps:

1. Go to your ERP dashboard
2. Open an admission application with verified documents
3. Click "Record Payment"
4. Fill in the fee details
5. Generate payment or record manual payment
6. Check the Payments sheet - you should see a new row!

Need help? The system will show errors if:
- Sheet name is wrong
- Columns are missing
- Permissions are incorrect
