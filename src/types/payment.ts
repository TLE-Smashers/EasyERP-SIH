/**
 * Payment Types
 * Type definitions for payment module
 */

export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded' | 'failed';

export type PaymentMethod = 'razorpay' | 'cash' | 'bank_transfer' | 'cheque';

// Payment Type Classification
export type PaymentType = 
  | 'admission'        // Initial admission fees
  | 'semester'         // Recurring semester fees
  | 'exam'            // Examination fees
  | 'hostel'          // Hostel accommodation fees
  | 'library'         // Library fines/fees
  | 'other';          // Miscellaneous fees

// Fee Categories (based on receipt structure)
export type FeeCategory = 
  | 'tuition_fee'
  | 'amalgamated_fund'
  | 'sports_fee_university_share'
  | 'caution_money'
  | 'transfer_certificate_fee'
  | 'library_card_reissue_fee'
  | 'penalty_fee'
  | 'other_fees';

export interface RazorpayPaymentLink {
  id: string;
  short_url: string;
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  expire_by?: number;
  reference_id: string;
  callback_url?: string;
  callback_method?: string;
}

export interface RazorpayPaymentLinkResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  cancelled_at: number | null;
  created_at: number;
  currency: string;
  customer: {
    contact: string;
    email: string;
    name: string;
  };
  description: string;
  expire_by: number | null;
  expired_at: number | null;
  first_min_partial_amount: number;
  notes: Record<string, any>;
  notify: {
    email: boolean;
    sms: boolean;
  };
  payments: any[];
  reference_id: string;
  reminder_enable: boolean;
  reminders: any[];
  short_url: string;
  status: 'created' | 'paid' | 'partially_paid' | 'expired' | 'cancelled';
  updated_at: number;
  upi_link: boolean;
  user_id: string;
}

export interface PaymentRecord {
  paymentLinkId: string;
  paymentId?: string;
  orderId?: string;
  referenceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  paidAt?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkParams {
  amount: number; // in smallest currency unit (paise for INR)
  currency?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  referenceId: string;
  callbackUrl?: string;
  expiresInDays?: number;
  notes?: Record<string, any>;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        captured: boolean;
        email: string;
        contact: string;
        notes: Record<string, any>;
        created_at: number;
      };
    };
    payment_link: {
      entity: RazorpayPaymentLinkResponse;
    };
  };
  created_at: number;
}

/**
 * Fee Breakdown Structure
 * Matches the receipt format with all fee categories
 */
export interface FeeBreakdown {
  // Admission/regular
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFeeUniversityShare: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
  // Hostel
  roomFee?: number;
  messFee?: number;
}

/**
 * Student Information for Payment
 * Links to Admissions sheet with minimal snapshot data for verification
 */
export interface PaymentStudentInfo {
  // PRIMARY LINK - Required
  applicationId: string;         // Link to Admission sheet (APP-123)
  
  // VERIFICATION FIELDS - Required for double-checking
  studentName: string;           // For verification and receipts
  email: string;                 // For verification and notifications
  
  // Optional IDs (for future use)
  studentId?: string;            // Future: Link to centralized Student table
  rollNumber?: string;           // Student roll number (if assigned)
  
  // SNAPSHOT DATA - Stored at payment time for historical accuracy
  // These preserve what values were when payment was made
  mobile: string;                // Snapshot from Admissions
  course: string;                // Snapshot from Admissions
  branch: string;                // Snapshot from Admissions
  fatherName: string;            // Snapshot from Admissions (guardianName)
  category: string;              // Category if applicable (not in Admissions currently)
  
  // Context Fields
  semester?: number;
  academicYear?: string;
}

/**
 * Complete Payment Record
 * Stored in Google Sheets Payment table
 */
export interface Payment {
  // Primary Identifiers
  id: string;                    // PAY-2024-0001
  referenceNumber: string;       // DUL8624765 (display reference)
  timestamp: string;             // Record creation time
  
  // Payment Classification
  paymentType: PaymentType;
  academicYear?: string;         // 2024-25
  semester?: number;             // 1-8
  
  // Student Information (minimal duplication)
  studentInfo: PaymentStudentInfo;
  
  // Fee Details
  feeBreakdown: FeeBreakdown;
  totalAmount: number;
  amountInWords: string;         // "Rupees Two Thousand Seven Hundred Fifty Only"
  
  // Payment Status & Method
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  // Razorpay Integration
  razorpayPaymentLinkId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpayShortUrl?: string;
  
  // Transaction Details
  transactionId?: string;        // Bank/UPI reference
  paymentDate?: string;          // When payment was completed
  
  // Audit Fields
  createdBy: string;             // Staff who created payment
  createdDate: string;
  updatedBy?: string;
  updatedDate?: string;
  
  // Additional Data
  receiptUrl?: string;           // PDF receipt Google Drive link
  notes?: string;                // User notes
  remarks?: string;              // Admin remarks
  
  // Sheet Reference
  rowNumber?: number;            // For Google Sheets operations
}

/**
 * Parameters for Creating a New Payment
 */
export interface CreatePaymentParams {
  // Required Fields
  paymentType: PaymentType;
  studentInfo: PaymentStudentInfo;
  feeBreakdown: FeeBreakdown;
  paymentMethod: PaymentMethod;
  createdBy: string;
  
  // Optional Context
  academicYear?: string;
  semester?: number;
  notes?: string;
  remarks?: string;
  
  // Auto-generated (computed)
  totalAmount?: number;          // Computed from feeBreakdown
  amountInWords?: string;        // Computed from totalAmount
}

/**
 * Payment Receipt Data
 * Used for generating PDF receipts
 */
export interface PaymentReceipt {
  payment: Payment;
  instituteName: string;
  instituteAddress?: string;
  instituteContact?: string;
  instituteEmail?: string;
  generatedAt: string;
  qrCodeData?: string;           // For payment verification
  notifications?: string[];      // Receipt footer notifications
}

/**
 * Payment Filters for Queries
 */
export interface PaymentFilters {
  studentId?: string;
  applicationId?: string;
  email?: string;
  course?: string;
  branch?: string;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  semester?: number;
  academicYear?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;          // Search by name, email, reference number
}

/**
 * Payment Statistics
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  paidCount: number;
  paidAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
  partialCount: number;
  partialAmount: number;
  failedCount: number;
  byPaymentType: Record<PaymentType, { count: number; amount: number }>;
  byPaymentMethod: Record<PaymentMethod, { count: number; amount: number }>;
}
