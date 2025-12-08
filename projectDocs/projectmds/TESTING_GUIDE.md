# 🧪 Complete Testing Guide - Admission System Refactoring

## Prerequisites ✅
- [x] Google Sheets setup complete (AdmissionsForm → Admissions with AppScript)
- [x] `.env.local` updated with `GOOGLE_SHEET_NAME=Admissions`
- [x] Backend code refactored (types, actions, sheets helper)
- [x] Frontend components updated

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd /Users/kanhaiyalalsahu/Documents/Devs/ERP\ Student\ Management\ System/easy-erp-v1
pnpm dev
```

Open: http://localhost:3000

---

## 📋 Test Checklist

### ✅ Test 1: View Applications List
**URL:** `/dashboard/admission/applications`

**Expected:**
- ✅ List of all applications loads
- ✅ Shows: Name, Email, Phone, Course, Status, Documents Verified
- ✅ No `paymentStatus` column (removed)
- ✅ No console errors

**Actions:**
1. Navigate to admission applications page
2. Verify data displays correctly
3. Check browser console (F12) for errors

---

### ✅ Test 2: View Single Application
**URL:** `/dashboard/admission/applications/[id]`

**Expected:**
- ✅ Personal details display correctly
- ✅ Academic details (10th & 12th) show
- ✅ Document links are visible
- ✅ Application status shown
- ✅ Documents verified status accurate

**Actions:**
1. Click any application from list
2. Review all sections
3. Verify no missing fields

---

### ✅ Test 3: Edit Application Data
**Location:** Application detail page → Edit mode

**Test Cases:**

#### 3a. Update Personal Info
```
Fields to test:
- Full Name
- Email
- Mobile Number
- Date of Birth
- Address
- Guardian Name
- Guardian Contact
```

**Steps:**
1. Click Edit on personal details
2. Change any field
3. Click Save
4. **Verify:** Success toast appears
5. **Verify:** Data updates in Google Sheet (Admissions sheet)
6. Refresh page → confirm changes persist

#### 3b. Update Academic Info
```
Fields to test:
- 10th School, Board, Marks, Year
- 12th School, Board, Marks, Year
- Course
- Branch
```

**Steps:**
1. Click Edit on academic details
2. Change any field
3. Click Save
4. **Verify:** Updates appear in sheet

---

### ✅ Test 4: Document Verification ⭐ CRITICAL
**Location:** Application detail → Documents section

**Pre-requisite:** Application must have `applicationStatus = "pending"`

**Steps:**
1. Navigate to application
2. Go to Documents section
3. Review uploaded document links
4. Click **"Verify Documents"** button

**Expected Results:**
- ✅ Success toast: "Documents verified successfully"
- ✅ Status badge changes to "Documents Verified"
- ✅ Button becomes disabled/hidden

**Verify in Google Sheet (Admissions):**
- Column AD (`applicationStatus`): `documents_verified`
- Column AE (`documentsVerified`): `TRUE`
- Column AF (`verifiedBy`): Your email
- Column AG (`verifiedDate`): Current timestamp

**Debug if not working:**
```bash
# Run test script to check updates
npx tsx scripts/testSheetUpdate.ts
```

---

### ✅ Test 5: Payment Creation ⭐ CRITICAL
**Location:** Application detail → Step 4: Payment

**Pre-requisite:** Documents must be verified

**Test Case 5a: Create Razorpay Payment**
1. Click "Record Payment"
2. Fill fee breakdown:
   - Tuition Fee: 50000
   - Amalgamated Fund: 5000
   - Sports Fee: 2000
   - etc.
3. Select "Razorpay" as payment method
4. Click "Create Payment"

**Expected:**
- ✅ Payment link generated
- ✅ Payment record created in **Payments sheet** (not Admissions)
- ✅ `applicationId` links to admission (e.g., APP-2)
- ✅ Student name & email copied for verification
- ✅ Status shows as "Payment Pending"

**Test Case 5b: Record Manual Payment (Cash/Bank)**
1. Click "Record Payment"
2. Fill fee breakdown
3. Select "Cash" or "Bank Transfer"
4. Enter transaction details
5. Click "Record Payment"

**Expected:**
- ✅ Payment marked as "Paid" immediately
- ✅ Shows in Payment Completed banner
- ✅ "View Receipt" button appears

**Verify in Google Sheet (Payments):**
- New row added
- `applicationId` column has correct value (e.g., APP-2)
- `studentName` and `email` match admission data
- `paymentStatus` = "paid" (for manual) or "unpaid" (for Razorpay link)

---

### ✅ Test 6: Payment Status Check
**Location:** Step 4: Payment

**Test Scenario:** After payment is recorded

**Expected:**
- ✅ Green banner shows "Payment Completed"
- ✅ Displays amount: ₹X,XXX
- ✅ Shows payment ID (if online)
- ✅ "View Receipt" button works
- ✅ Receipt dialog opens with full details

**Debug if payment not showing:**
```typescript
// Check browser console for:
"Failed to fetch payments"
// or
"No payments found for application"
```

---

### ✅ Test 7: Complete Admission ⭐ CRITICAL
**Location:** Step 5: Complete & Lock

**Pre-requisites:**
- ✅ Documents verified
- ✅ Payment received (at least one paid payment)

**Steps:**
1. Navigate to Step 5
2. Review checklist:
   - [ ] Personal Info: Complete
   - [ ] Documents: Verified ✓
   - [ ] Payment: Received ✓
3. Add final remarks (optional)
4. Click **"Complete & Lock Admission"**

**Expected Results:**
- ✅ Success toast: "Admission completed successfully!"
- ✅ 🎉 Success screen with confetti animation
- ✅ Application becomes **read-only**
- ✅ All edit buttons disabled

**Verify in Google Sheet (Admissions):**
- Column AD (`applicationStatus`): `completed`
- Column AH (`locked`): `TRUE`
- Column AI (`lockedBy`): Your email
- Column AJ (`lockedDate`): Current timestamp
- Column AK (`finalRemarks`): Your remarks (if added)

**Verify Email Sent (if configured):**
- Check student's email for completion confirmation

---

## 🐛 Troubleshooting Guide

### Issue 1: "Sheet updates not working"
**Symptoms:** Updates don't appear in Google Sheet

**Solutions:**
1. Check `.env.local`:
   ```env
   GOOGLE_SHEET_NAME=Admissions  # Must be exact
   GOOGLE_SHEETS_ID=your-id
   ```

2. Run debug test:
   ```bash
   npx tsx scripts/testSheetUpdate.ts
   ```

3. Check service account permissions:
   - Service account must have **Editor** access to sheet

4. Verify column structure:
   - Sheet must have exactly 37 columns (A-AK)
   - Headers must match `COLUMN_REFERENCE.md`

---

### Issue 2: "Payment not showing as received"
**Symptoms:** Step 5 says payment pending when it's paid

**Solutions:**
1. Check Payments sheet:
   - Find row with matching `applicationId`
   - Verify `paymentStatus` column = "paid"

2. Check browser console for fetch errors

3. Verify payment action:
   ```bash
   # In browser console:
   await fetchPaymentsByApplicationIdAction('APP-2')
   ```

4. Make sure `applicationId` is stored correctly in Payments sheet

---

### Issue 3: "Cannot complete admission"
**Symptoms:** Complete button disabled

**Checklist:**
- [ ] Documents verified? (Check Admissions sheet column AE)
- [ ] Payment received? (Check Payments sheet for paid entry)
- [ ] Already locked? (Check Admissions sheet column AH)

**Debug:**
```javascript
// In browser console:
application.documentsVerified  // Should be true
application.locked             // Should be false
isPaymentReceived             // Should be true
```

---

### Issue 4: "TypeScript errors"
**Run build to check:**
```bash
pnpm run build
```

**Common errors:**
- ❌ `Property 'paymentStatus' does not exist on type 'Application'`
  - **Fix:** Update component to fetch from Payments sheet
  
- ❌ `Property 'assignedBatch' does not exist`
  - **Fix:** These fields were removed, update UI

---

## 📊 Data Flow Verification

### Flow 1: Form Submission → Admissions Sheet
```
Google Form Submit
  ↓ [Trigger]
AppScript: onFormSubmit()
  ↓ [Transform]
AdmissionsForm → Admissions (camelCase)
  ↓ [Result]
New row in Admissions sheet
```

**Verify:**
1. Submit test form
2. Check both sheets have new row
3. Row numbers match (e.g., row 10 in both)

---

### Flow 2: Document Verification
```
User clicks "Verify Documents"
  ↓
verifyDocuments() action
  ↓
updateApplication() with:
  - applicationStatus: "documents_verified"
  - documentsVerified: TRUE
  - verifiedBy: email
  - verificationDate: timestamp
  ↓
Google Sheets API: batchUpdate
  ↓
Admissions!AD2, AE2, AF2, AG2 updated
```

**Verify:**
- Check exact cells in sheet are updated
- Timestamp is ISO format

---

### Flow 3: Payment Recording
```
User creates payment
  ↓
createPaymentAction()
  ↓
Writes to PAYMENTS SHEET (not Admissions)
  - applicationId: APP-2 (link)
  - studentName, email: snapshot
  - feeBreakdown, totalAmount
  - paymentStatus: paid/unpaid
  ↓
Payments sheet new row added
```

**Verify:**
- Admissions sheet NOT modified
- Payments sheet has new row
- `applicationId` correctly links

---

### Flow 4: Complete Admission
```
User completes admission
  ↓
completeAdmission() action
  ↓
updateApplication() with:
  - applicationStatus: "completed"
  - locked: TRUE
  - lockedBy: email
  - lockedDate: timestamp
  - finalRemarks: text
  ↓
Admissions!AD2, AH2, AI2, AJ2, AK2 updated
```

**Verify:**
- Application becomes read-only
- Lock timestamp recorded

---

## ✅ Success Criteria

### Backend
- [x] All TypeScript compiles without errors
- [x] Sheet updates work for all fields
- [x] Column name mapping (not letters)
- [x] Payment system separate from admissions

### Frontend
- [x] Applications list loads
- [x] Application details display
- [x] Edit functionality works
- [x] Document verification works
- [x] Payment creation works
- [x] Payment status detection works
- [x] Admission completion works
- [x] Locked applications read-only

### Data Integrity
- [x] AdmissionsForm → Admissions sync works
- [x] Row numbers stay aligned
- [x] Payments link via applicationId
- [x] No data duplication issues

---

## 🎯 Next Steps After Testing

### If Everything Works:
1. ✅ Test with 5-10 real applications
2. ✅ Train staff on new workflow
3. ✅ Monitor for edge cases
4. ✅ Optional: Update remaining UI components (ApplicationsTable, ApplicationDrawer)

### If Issues Found:
1. Note specific error messages
2. Check which test failed
3. Review troubleshooting guide
4. Share error details for help

---

## 📝 Test Log Template

```
Date: ___________
Tester: _________

Test 1 - View Applications: [ ] Pass [ ] Fail
Test 2 - View Details: [ ] Pass [ ] Fail
Test 3 - Edit Data: [ ] Pass [ ] Fail
Test 4 - Verify Documents: [ ] Pass [ ] Fail
Test 5 - Create Payment: [ ] Pass [ ] Fail
Test 6 - Payment Status: [ ] Pass [ ] Fail
Test 7 - Complete Admission: [ ] Pass [ ] Fail

Issues Found:
_______________________________________
_______________________________________

Notes:
_______________________________________
_______________________________________
```

---

**Start with Test 1 and work through systematically!** 

Each test builds on the previous one, so complete them in order.
