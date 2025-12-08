# Payment System Implementation Plan

## Overview
Building a comprehensive, modular payment system integrated with Razorpay for handling:
- **Admission Fees** - During student admission process
- **Semester Fees** - Recurring every semester
- **Other Fees** - Exam fees, hostel fees, library fines, etc.

## Key Requirements
✅ **Modular Design** - Reusable components across admission staff and student portals  
✅ **Multiple Payment Methods** - Razorpay (Online), Cash, Bank Transfer, Cheque  
✅ **Detailed Fee Breakdown** - Support all fee categories from receipt  
✅ **Receipt Generation** - Professional receipts with breakdown, matching provided format  
✅ **Role-Based Access** - Staff can create payments for students, students can pay for themselves  
✅ **Payment History** - Complete audit trail of all transactions  

---

## Fee Categories (from Receipt Image)

Based on the SB Collect receipt provided:

```typescript
1. Tuition Fee / Course Fee
2. Amalgamated Fund (₹2,500 in example)
3. Sports Fee University Share (₹250 in example)
4. Caution Money (₹0 in example)
5. Transfer Certificate Fee (₹0 in example)
6. Library Card Reissue Fee (₹0 in example)
7. Penalty Fee (₹0 in example)
8. Any Other Fee (₹0 in example)
9. Transaction Charges (₹0.00 in example)
---
Total Amount: ₹2,750.00
```

---

## Phase 1: Database Schema Design

### Payment Table Structure (Google Sheets)
**Sheet Name:** `Payments`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| Payment ID | String | Unique identifier | `PAY-2024-0001` |
| Reference Number | String | Display reference | `DUL8624765` |
| Timestamp | DateTime | Payment creation time | `1/27/25, 7:55 AM` |
| Payment Type | Enum | admission/semester/exam/hostel/other | `semester` |
| Academic Year | String | Year of study | `2024-25` |
| Semester | Number | Semester number | `3` |
| Student ID | String | Student unique ID | `300703322025` |
| Roll Number | String | Student roll no | `300703322025` |
| Application ID | String | Link to admission (if applicable) | `APP-123` |
| Student Name | String | Full name | `KANHAIYA LAL SAHU` |
| Father Name | String | Guardian name | `BHAGBALI SAHU` |
| Email | String | Student email | `kanhaiyasahutools@gmail.com` |
| Mobile | String | Contact number | `6260093705` |
| Course | String | Course code | `B E` |
| Branch | String | Branch/Stream | `IT` |
| Category | String | Student category | `OBC` |
| **Fee Breakdown** | | | |
| Tuition Fee | Number | Main course fee | `0` |
| Amalgamated Fund | Number | Student welfare fund | `2500` |
| Sports Fee University Share | Number | Sports fee | `250` |
| Caution Money | Number | Refundable deposit | `0` |
| Transfer Certificate Fee | Number | TC fee | `0` |
| Library Card Reissue Fee | Number | Library fee | `0` |
| Penalty Fee | Number | Late fee | `0` |
| Other Fees | Number | Miscellaneous | `0` |
| Transaction Charges | Number | Gateway charges | `0.00` |
| **Payment Details** | | | |
| Total Amount | Number | Sum of all fees | `2750` |
| Amount In Words | String | Text representation | `Rupees Two Thousand Seven Hundred Fifty Only` |
| Payment Status | Enum | unpaid/paid/partial/failed/refunded | `paid` |
| Payment Method | Enum | razorpay/cash/bank_transfer/cheque | `razorpay` |
| Razorpay Payment Link ID | String | Link ID from Razorpay | `plink_xxx` |
| Razorpay Payment ID | String | Payment ID after success | `pay_xxx` |
| Razorpay Order ID | String | Order ID | `order_xxx` |
| Transaction ID | String | Bank/UPI transaction ID | `DUL8624765` |
| Payment Date | DateTime | When payment completed | `1/27/25, 7:50 AM` |
| **Admin Fields** | | | |
| Created By | String | Staff who created | `admission@college.edu` |
| Created Date | DateTime | Record creation time | `1/27/25, 7:45 AM` |
| Updated By | String | Last modifier | `accountant@college.edu` |
| Updated Date | DateTime | Last update time | `1/27/25, 7:55 AM` |
| Receipt URL | String | PDF receipt link | `https://drive.google.com/xxx` |
| Notes | String | Additional remarks | `Paid via UPI` |
| Remarks | Text | Admin notes | `All fee payments are subjected to approval of the Institute` |

---

## Phase 2: TypeScript Type Definitions

### File: `src/types/payment.ts` (Extended)

```typescript
// Fee Categories
export type FeeCategory = 
  | 'tuition_fee'
  | 'amalgamated_fund'
  | 'sports_fee_university_share'
  | 'caution_money'
  | 'transfer_certificate_fee'
  | 'library_card_reissue_fee'
  | 'penalty_fee'
  | 'other_fees';

// Payment Type
export type PaymentType = 
  | 'admission'
  | 'semester'
  | 'exam'
  | 'hostel'
  | 'library'
  | 'other';

// Fee Breakdown Structure
export interface FeeBreakdown {
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFeeUniversityShare: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
}

// Student Information for Payment
export interface PaymentStudentInfo {
  studentId?: string;
  rollNumber?: string;
  applicationId?: string;
  studentName: string;
  fatherName: string;
  email: string;
  mobile: string;
  course: string;
  branch: string;
  category: string; // OBC, General, SC, ST, etc.
  semester?: number;
  academicYear?: string;
}

// Complete Payment Record
export interface Payment {
  // Identifiers
  id: string;
  referenceNumber: string;
  timestamp: string;
  
  // Payment Type & Context
  paymentType: PaymentType;
  academicYear?: string;
  semester?: number;
  
  // Student Information
  studentInfo: PaymentStudentInfo;
  
  // Fee Details
  feeBreakdown: FeeBreakdown;
  totalAmount: number;
  amountInWords: string;
  
  // Payment Status
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  // Razorpay Integration
  razorpayPaymentLinkId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpayShortUrl?: string;
  
  // Transaction Details
  transactionId?: string;
  paymentDate?: string;
  
  // Admin Fields
  createdBy: string;
  createdDate: string;
  updatedBy?: string;
  updatedDate?: string;
  receiptUrl?: string;
  notes?: string;
  remarks?: string;
  
  // Sheet Reference
  rowNumber?: number;
}

// Payment Creation Parameters
export interface CreatePaymentParams {
  paymentType: PaymentType;
  studentInfo: PaymentStudentInfo;
  feeBreakdown: FeeBreakdown;
  paymentMethod: PaymentMethod;
  academicYear?: string;
  semester?: number;
  notes?: string;
  createdBy: string;
}

// Payment Receipt Data
export interface PaymentReceipt {
  payment: Payment;
  instituteName: string;
  instituteAddress?: string;
  instituteContact?: string;
  generatedAt: string;
  qrCodeData?: string;
}
```

---

## Phase 3: Modular Payment Components

### Component Architecture

```
src/components/payment/
├── PaymentForm.tsx              # Main form (create/edit payments)
├── FeeBreakdownForm.tsx         # Fee category inputs
├── PaymentMethodSelector.tsx   # Payment method selection
├── PaymentReceipt.tsx          # Receipt display component
├── PaymentReceiptPDF.tsx       # PDF generation component
├── PaymentStatusBadge.tsx      # Status display
├── PaymentList.tsx             # Payment history table
├── PaymentDetails.tsx          # Detailed payment view
└── RazorpayPaymentButton.tsx   # Razorpay integration button
```

### Key Component: `PaymentForm.tsx`

```typescript
interface PaymentFormProps {
  // Mode
  mode: 'create' | 'view' | 'edit';
  
  // Initial Data
  initialData?: Partial<Payment>;
  studentInfo?: Partial<PaymentStudentInfo>;
  defaultFeeBreakdown?: Partial<FeeBreakdown>;
  paymentType: PaymentType;
  
  // Callbacks
  onSubmit: (data: CreatePaymentParams) => Promise<void>;
  onCancel?: () => void;
  
  // Configuration
  allowedPaymentMethods?: PaymentMethod[];
  showStudentFields?: boolean;
  readonly?: boolean;
}
```

**Features:**
- Pre-fill student data from admission or student profile
- Dynamic fee breakdown with real-time total calculation
- Transaction charges auto-calculation (if applicable)
- Amount in words conversion
- Payment method selection
- Razorpay payment link generation for online payments
- Form validation with Zod
- Responsive design

---

## Phase 4: Payment Service Layer

### File: `src/lib/payment/payment.service.ts`

```typescript
// Create payment record
export async function createPayment(params: CreatePaymentParams): Promise<Payment>

// Generate Razorpay payment link for online payments
export async function initiateOnlinePayment(payment: Payment): Promise<string>

// Record manual payment (cash/bank/cheque)
export async function recordManualPayment(
  paymentId: string, 
  transactionId: string, 
  paymentDate: string
): Promise<Payment>

// Update payment status from Razorpay webhook
export async function updatePaymentFromWebhook(
  paymentLinkId: string, 
  razorpayData: any
): Promise<Payment>

// Fetch payment by ID
export async function getPaymentById(paymentId: string): Promise<Payment>

// Get student payment history
export async function getStudentPayments(
  studentId: string, 
  filters?: PaymentFilters
): Promise<Payment[]>

// Get all payments with filters
export async function getAllPayments(filters?: PaymentFilters): Promise<Payment[]>

// Generate receipt PDF
export async function generatePaymentReceipt(paymentId: string): Promise<string>

// Send receipt email
export async function sendPaymentReceiptEmail(paymentId: string): Promise<void>

// Calculate transaction charges
export function calculateTransactionCharges(amount: number): number

// Convert amount to words
export function convertAmountToWords(amount: number): string

// Validate fee breakdown
export function validateFeeBreakdown(breakdown: FeeBreakdown): boolean
```

---

## Phase 5: Google Sheets Integration

### File: `src/lib/google/sheets.payment.ts`

```typescript
// Similar structure to sheets.admission.ts

export async function createPaymentRecord(payment: Payment): Promise<number>
export async function updatePaymentRecord(rowNumber: number, updates: Partial<Payment>): Promise<void>
export async function fetchPaymentById(paymentId: string): Promise<Payment | null>
export async function fetchAllPayments(): Promise<Payment[]>
export async function fetchStudentPayments(studentId: string): Promise<Payment[]>
```

---

## Phase 6: Payment Receipt (Matching Image Format)

### Receipt Component Structure

```
┌─────────────────────────────────────────────────┐
│ SBCollect Reference Number: DUL8624765          │
│ Category: OTHER FEES                            │
│ Amount: ₹2750                                   │
├─────────────────────────────────────────────────┤
│ COURSE: B E                                     │
│ BRANCH: IT                                      │
│ SEMESTER: III                                   │
│ ROLL NO: 300703322025                           │
├─────────────────────────────────────────────────┤
│ STUDENT NAME: KANHAIYA LAL SAHU                 │
│ FATHERS NAME: BHAGBALI SAHU                     │
│ CATEGORY: OBC                                   │
│ MOBILE NO: 6260093705                           │
│ E MAIL ID: kanhaiyasahutools@gmail.com          │
├─────────────────────────────────────────────────┤
│ Fee Breakdown:                                  │
│ AMALGAMATED FUND: 2500                          │
│ SPORTS FEE UNIVERSITY SHARE: 250                │
│ CAUTION MONEY: 0                                │
│ TRANSFER CERTIFICATE FEE: 0                     │
│ LIBRARY CARD REISSUE FEE: 0                     │
│ PENALTY FEE: 0                                  │
│ ANY OTHER FEE: 0                                │
│ Transaction charge: 0.00                        │
├─────────────────────────────────────────────────┤
│ Total Amount (In Figures): 2,750.00             │
│ Total Amount (In words):                        │
│ Rupees Two Thousand Seven Hundred Fifty Only    │
├─────────────────────────────────────────────────┤
│ Remarks:                                        │
│ Notification 1: All fee payments are            │
│ subjected to approval of the Institute          │
│                                                 │
│ Notification 2: If fee is not paid as fixed    │
│ by Institute, Student may have to pay           │
│ difference amount.                              │
└─────────────────────────────────────────────────┘
```

---

## Phase 7: Integration Points

### 7.1 Admission Module Integration

**Update Files:**
- `src/components/admission/ApplicationStepper.tsx` - Add payment step
- `src/components/admission/ApplicationDrawer.tsx` - Add "Record Payment" action
- `src/actions/admission/recordPayment.ts` - Use new payment service

**Flow:**
1. Staff verifies documents
2. Staff clicks "Record Payment"
3. PaymentForm opens with pre-filled student data
4. Staff enters fee breakdown (or uses default admission fee structure)
5. Staff selects payment method:
   - **Razorpay**: Generate payment link, send to student via SMS/email
   - **Cash/Bank/Cheque**: Record transaction details immediately
6. After payment confirmed:
   - Update admission status to 'completed'
   - Send payment confirmation email with receipt
   - Update Google Sheets
   - Trigger completion email

### 7.2 Student Portal Integration

**New Routes:**
- `/dashboard/student/payments` - Payment history
- `/dashboard/student/payments/pending` - Pending semester fees
- `/dashboard/student/payments/[id]` - Payment details & receipt

**Features:**
- View pending semester fees
- Pay online via Razorpay
- View payment history
- Download receipts as PDF
- Re-send receipt to email

### 7.3 Accountant Dashboard

**New Routes:**
- `/dashboard/accounts/payments` - All payments management
- `/dashboard/accounts/payments/create` - Create payment for student
- `/dashboard/accounts/receipts` - Receipt management
- `/dashboard/accounts/reports` - Payment reports

**Features:**
- Create payments for any student
- Record manual payments (cash/cheque/bank)
- View all transactions
- Filter by date/status/payment method/student
- Export to Excel
- Generate reports (daily collection, pending fees, etc.)

---

## Phase 8: Email Templates

### Update: `src/lib/email/payment.templates.ts`

Already exists! Update to include:
- Receipt data in email body
- Attach PDF receipt
- Include payment link for pending payments
- Add QR code for verification

---

## Phase 9: Razorpay Webhook Handler

### File: `src/app/api/payment/webhook/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Verify Razorpay signature
  // 2. Parse webhook payload
  // 3. Update payment status in Google Sheets
  // 4. Send receipt email if payment successful
  // 5. Update admission status if admission payment
}
```

---

## Phase 10: Testing Checklist

- [ ] Create admission payment (staff)
- [ ] Generate Razorpay payment link
- [ ] Complete payment via Razorpay
- [ ] Verify webhook updates payment status
- [ ] Receipt email sent with correct breakdown
- [ ] Receipt PDF generated correctly
- [ ] Create semester payment (student)
- [ ] Record manual payment (cash)
- [ ] View payment history
- [ ] Download receipt PDF
- [ ] Filter payments by various criteria
- [ ] Export payment reports
- [ ] Test with different fee combinations
- [ ] Test amount in words conversion
- [ ] Test transaction charges calculation

---

## Database Schema Summary

**Relationships:**
```
Admission (Google Sheet) ──┬──> Payment (Google Sheet)
                           │    - applicationId field
                           │
Student (Future) ──────────┴──> Payment
                                - studentId field
```

**Key Indexes/Lookups:**
- Payment ID (unique)
- Student ID
- Application ID
- Payment Status
- Payment Date
- Reference Number

---

## UI/UX Considerations

1. **Clear Fee Breakdown** - Show all categories even if ₹0
2. **Amount Validation** - Ensure correct totals
3. **Payment Status Indicators** - Color-coded badges
4. **Receipt Download** - Instant PDF download
5. **Mobile Responsive** - Works on phones for UPI payments
6. **Loading States** - Show progress during Razorpay operations
7. **Error Handling** - Clear error messages
8. **Confirmation Dialogs** - Before creating payments
9. **Print Support** - Receipt should be printer-friendly

---

## Security Considerations

1. **Role-Based Access Control**
   - Students: Can only view/create their own payments
   - Admission Staff: Can create payments for applicants
   - Accountants: Can create/view all payments
   - Admin: Full access

2. **Payment Verification**
   - Verify Razorpay webhook signatures
   - Validate payment amounts
   - Check for duplicate payments

3. **Data Protection**
   - Don't expose Razorpay secrets
   - Sanitize user inputs
   - Validate all fee amounts

---

## Next Steps

1. ✅ Create database schema in Google Sheets
2. ✅ Extend TypeScript types
3. ✅ Build modular PaymentForm component
4. ✅ Implement payment service layer
5. ✅ Create receipt component & PDF generation
6. ✅ Integrate with admission workflow
7. ✅ Build student payment portal
8. ✅ Build accountant dashboard
9. ✅ Test end-to-end flows
10. ✅ Deploy and monitor

---

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, shadcn/ui
- **Payment Gateway**: Razorpay (Payment Links API)
- **Database**: Google Sheets API
- **PDF Generation**: react-pdf or jsPDF
- **Email**: Nodemailer
- **Forms**: React Hook Form + Zod validation
- **State Management**: React useState/useEffect
- **API Routes**: Next.js App Router

---

## Estimated Timeline

- **Phase 1-2** (Database & Types): 1 day
- **Phase 3** (Components): 2-3 days
- **Phase 4-5** (Services & Sheets): 2 days
- **Phase 6** (Receipt): 1 day
- **Phase 7** (Integration): 2 days
- **Phase 8-9** (Email & Webhooks): 1 day
- **Phase 10** (Testing): 1-2 days

**Total: ~10-12 days**

---

## Notes

- Start with admission payment flow (simpler, single payment)
- Then build semester payment system (recurring)
- Keep components modular for reusability
- Follow existing patterns from admission module
- Use existing Razorpay service as foundation
- Match receipt format exactly as shown in image
