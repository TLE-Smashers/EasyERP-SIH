# Payment Period System - Complete Setup Guide

## Overview
The Payment Period System allows accountants to control when students can pay semester fees. Accountants can create payment periods with specific dates, target students, and fee breakdowns. Students will see active payment periods on their dashboard and can pay directly through Razorpay.

---

## Step 1: Create PaymentPeriods Sheet in Google Sheets

### 1.1 Open Your Google Sheet
Go to your existing Google Sheet that contains the "Payment" sheet.

### 1.2 Create New Sheet
- Click the **"+"** button at the bottom to create a new sheet
- Name it **exactly**: `PaymentPeriods` (case-sensitive, no spaces)

### 1.3 Add Column Headers
In Row 1, add these 25 column headers from A to Y:

| Column | Header Name |
|--------|------------|
| A | periodId |
| B | type |
| C | title |
| D | description |
| E | academicYear |
| F | semester |
| G | startDate |
| H | endDate |
| I | status |
| J | targetCourses |
| K | targetBranches |
| L | targetYears |
| M | tuitionFee |
| N | amalgamatedFund |
| O | sportsFee |
| P | cautionMoney |
| Q | transferCertificateFee |
| R | libraryCardReissueFee |
| S | penaltyFee |
| T | otherFees |
| U | transactionCharges |
| V | totalAmount |
| W | createdBy |
| X | createdDate |
| Y | updatedBy |
| Z | updatedDate |

**IMPORTANT**: 
- Headers must be **exact camelCase** as shown above
- No extra spaces
- Spelling must match exactly

### Quick Copy-Paste Option
Copy this tab-separated line and paste into Row 1:
```
periodId	type	title	description	academicYear	semester	startDate	endDate	status	targetCourses	targetBranches	targetYears	tuitionFee	amalgamatedFund	sportsFee	cautionMoney	transferCertificateFee	libraryCardReissueFee	penaltyFee	otherFees	transactionCharges	totalAmount	createdBy	createdDate	updatedBy	updatedDate
```

---

## Step 2: Verify Student Profile Data

Students need the following fields in their profile to see payment periods:
- `course` (e.g., "B.Tech", "M.Tech")
- `branch` (e.g., "CSE", "ECE", "ME")
- `currentYear` (1, 2, 3, or 4)

Check the Students sheet to ensure these fields are populated for your test student.

---

## Step 3: Create First Payment Period (Accountant)

### 3.1 Login as Accountant
Go to: `http://localhost:3000/login`
- Use accountant credentials

### 3.2 Navigate to Payment Periods
Go to: **Dashboard → Accounts → Payment Periods**

### 3.3 Create Payment Period
Click **"Create Payment Period"** button and fill in:

#### Basic Information:
- **Type**: Select "semester", "hostel", "library", "exam", or "other"
- **Title**: e.g., "Semester 2 Fee Payment - Jan 2026"
- **Description**: e.g., "Pay your semester 2 fees for Academic Year 2025-26"
- **Academic Year**: e.g., "2025-26"
- **Semester**: e.g., "2"

#### Payment Period:
- **Start Date**: When students can start paying (e.g., 2025-12-01)
- **End Date**: Last date to pay (e.g., 2026-01-31)

#### Target Students:
- **Target Courses**: 
  - Enter "ALL" to target all courses
  - OR enter specific courses separated by commas: "B.Tech,M.Tech"
- **Target Branches**: 
  - Enter "ALL" to target all branches
  - OR enter specific: "CSE,ECE,ME"
- **Target Years**: 
  - Enter "ALL" to target all years
  - OR enter specific: "1,2,3,4"

#### Fee Breakdown:
Enter amounts for each fee component:
- **Tuition Fee**: e.g., 60000
- **Amalgamated Fund**: e.g., 5000
- **Sports Fee**: e.g., 2000
- **Caution Money**: e.g., 3000
- **Transfer Certificate Fee**: e.g., 500
- **Library Card Reissue Fee**: e.g., 200
- **Penalty Fee**: e.g., 0
- **Other Fees**: e.g., 0
- **Transaction Charges**: e.g., 0

**Total Amount** is calculated automatically.

### 3.4 Submit
Click **"Create Payment Period"**

---

## Step 4: Verify Payment Period Created

### 4.1 Check Google Sheet
- Open your Google Sheet
- Go to "PaymentPeriods" tab
- You should see a new row with data starting from Row 2
- **periodId** will be auto-generated like: `PERIOD-2025-1733756789123`
- **status** will be "enabled"
- **totalAmount** will be calculated

### 4.2 Check Accountant Dashboard
- Go back to Payment Periods page
- You should see:
  - **Statistics cards** showing: Total Periods, Active Now, Scheduled, Expired
  - **Table** with your payment period
  - **Status badge**: Should show "Active" (blue) if current date is between start and end date
  - **Toggle switch**: Should be ON (enabled)

---

## Step 5: Test Student View

### 5.1 Login as Student
- Logout from accountant account
- Login with student credentials: `anshu@example.com` (based on your screenshot)

### 5.2 Navigate to Fees Page
Go to: **Dashboard → My Profile → Fees** or direct URL: `http://localhost:3000/dashboard/student/fees`

### 5.3 Verify Payment Options Appear
You should see a section called **"Available Payment Options"** with:
- Card showing the payment period
- **Title** and **Description**
- **Amount** in large text (e.g., ₹70,700)
- **Academic Year** and **Semester**
- **Due date** with days left
- **"Pay Now"** button

### 5.4 If You Don't See Payment Options
Check the following:

#### Issue 1: Student Profile Missing Data
- Open browser console (F12)
- Check for error: "No student email found in session"
- **Solution**: Ensure student has `course`, `branch`, and `currentYear` in Students sheet

#### Issue 2: Payment Period Filters Don't Match
The period's `targetCourses`, `targetBranches`, and `targetYears` must match the student's profile:
- If period has `targetCourses = "B.Tech,M.Tech"` → student must have course = "B.Tech" or "M.Tech"
- If period has `targetBranches = "ALL"` → any branch matches
- If period has `targetYears = "1,2"` → student must have currentYear = 1 or 2

**Solution**: 
- Edit the payment period to use "ALL" for testing
- OR ensure student profile matches the filters

#### Issue 3: Date Range Not Active
- Check that current date is between `startDate` and `endDate`
- **Solution**: Adjust the dates to include today

---

## Step 6: Make a Payment (Student)

### 6.1 Click "Pay Now"
A payment sheet will open with:
- Pre-filled fee breakdown from the payment period
- Student information (name, email, roll number)
- Payment method (Razorpay is default)

### 6.2 Review and Confirm
- Verify the amount is correct
- Click **"Create Payment Record"** or **"Pay with Razorpay"**

### 6.3 Razorpay Checkout
- Razorpay checkout modal will open
- For testing, use Razorpay test card:
  - **Card Number**: `4111 1111 1111 1111`
  - **CVV**: Any 3 digits (e.g., 123)
  - **Expiry**: Any future date (e.g., 12/26)
  - **Name**: Any name

### 6.4 Payment Success
- You'll see success toast notification
- Payment sheet will close
- Page will refresh to show updated payment status

---

## Step 7: Verify Payment Recorded

### 7.1 Check Google Sheets - Payment Tab
- Open your Google Sheet
- Go to "Payment" tab
- You should see a new row or updated row with:
  - **paymentId**: Auto-generated
  - **razorpayPaymentId**: From Razorpay (e.g., `pay_xxxxx`)
  - **razorpayOrderId**: From Razorpay (e.g., `order_xxxxx`)
  - **status**: "completed"
  - **totalAmount**: Amount paid
  - **Fee breakdown columns**: All filled
  - **studentInfo**: Name, email, course, branch, etc.
  - **createdDate**: Timestamp

### 7.2 Check Accountant Dashboard
- Login as accountant
- Go to: **Dashboard → Accounts → Payments**
- You should see the payment record in the table
- Status should show "Completed" badge
- Can download receipt PDF

---

## Step 8: Manage Payment Periods (Accountant)

### 8.1 Enable/Disable Periods
- Go to Payment Periods page
- Use the **toggle switch** in the Actions column
- Disabled periods won't show to students

### 8.2 Edit Period
- Click **"Edit"** button
- Modify dates, amounts, or filters
- Click "Update Payment Period"

### 8.3 View Statistics
Top cards show:
- **Total Periods**: All periods created
- **Active Now**: Enabled periods within date range
- **Scheduled**: Enabled periods starting in future
- **Expired**: Periods past end date

---

## Common Issues & Solutions

### Issue: "Unable to parse period" Error
**Cause**: PaymentPeriods sheet doesn't exist or headers are incorrect

**Solution**:
1. Verify sheet name is exactly "PaymentPeriods"
2. Check all 25 column headers match exactly (camelCase)
3. Ensure no extra spaces in headers
4. Try creating the sheet again from scratch

### Issue: Student Sees "No active payment periods available"
**Possible Causes**:
1. No periods created
2. Period is disabled (status = 'disabled')
3. Current date is outside start/end date range
4. Student's course/branch/year doesn't match filters
5. Student profile missing required fields

**Solution**:
1. Create a test period with ALL filters and dates including today
2. Verify period status is "enabled"
3. Check student has course, branch, and currentYear in profile

### Issue: Payment Not Recording in Sheet
**Possible Causes**:
1. Payment verification failed
2. Sheet permissions issue
3. Network error

**Solution**:
1. Check browser console for errors
2. Verify Google Sheets API access
3. Check Razorpay webhook is configured
4. Ensure Payment sheet has correct headers

### Issue: Razorpay Checkout Not Opening
**Possible Causes**:
1. Razorpay SDK not loaded
2. Missing Razorpay API keys
3. Browser blocked popup

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. Verify keys are valid (test mode for development)
3. Allow popups for localhost in browser settings

---

## Testing Checklist

- [ ] PaymentPeriods sheet created with 25 headers
- [ ] First payment period created by accountant
- [ ] Payment period shows in accountant table
- [ ] Student profile has course, branch, currentYear
- [ ] Student can see payment period card on fees page
- [ ] "Pay Now" button opens payment sheet
- [ ] Fee breakdown is pre-filled correctly
- [ ] Razorpay checkout opens
- [ ] Test payment completes successfully
- [ ] Payment recorded in Payment sheet
- [ ] Payment shows in accountant dashboard
- [ ] Receipt can be downloaded

---

## API Endpoints Used

- `POST /api/payment/config` - Get Razorpay public key
- `POST /api/payment/create` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature
- Server Actions:
  - `fetchAllPeriodsAction()` - Get all periods (accountant)
  - `fetchStudentPaymentPeriodsAction(course, branch, year)` - Get student periods
  - `createPeriodAction(params)` - Create period
  - `updatePeriodStatusAction(periodId, status)` - Enable/disable
  - `createPaymentAction(params)` - Create payment record

---

## File Structure

```
src/
├── actions/
│   ├── paymentPeriod/
│   │   └── paymentPeriodActions.ts
│   └── payment/
│       └── paymentActions.ts
├── components/
│   ├── accounts/
│   │   ├── PaymentPeriodsClient.tsx
│   │   └── CreatePaymentPeriodSheet.tsx
│   └── payment/
│       ├── CreatePaymentSheet.tsx
│       └── PaymentForm.tsx
├── lib/
│   ├── google/
│   │   ├── sheets.paymentPeriod.ts
│   │   └── sheets.payment.ts
│   └── payment/
│       ├── payment.service.ts
│       └── razorpay.service.ts
├── types/
│   ├── paymentPeriod.ts
│   └── payment.ts
└── app/
    └── dashboard/
        ├── accounts/
        │   └── payment-periods/
        │       └── page.tsx
        └── student/
            └── fees/
                └── page.tsx
```

---

## Next Steps

1. **Production Deployment**:
   - Switch to Razorpay Live mode keys
   - Update webhook URL to production domain
   - Test with real payment gateway

2. **Enhancements**:
   - Add email notifications when new payment period is created
   - Send reminder emails before period ends
   - Add late fee calculation for expired periods
   - Generate bulk receipts for all payments in a period

3. **Reporting**:
   - Add analytics dashboard for collection rates
   - Export period-wise payment reports
   - Track pending payments by student

---

## Support

If you encounter issues:
1. Check browser console (F12) for JavaScript errors
2. Check server logs for API errors
3. Verify Google Sheets structure matches exactly
4. Test with simple "ALL" filters first
5. Ensure Razorpay keys are valid for test mode

---

**Last Updated**: December 9, 2025
