/**
 * Payment Period Type Definition
 * Defines when students can make semester/other payments
 */

export type PaymentPeriodType = 'semester' | 'hostel' | 'library' | 'exam' | 'other';
export type PaymentPeriodStatus = 'enabled' | 'disabled';

export interface PaymentPeriod {
  id: string;                          // PERIOD-2025-001
  type: PaymentPeriodType;            // semester, hostel, library, etc.
  title: string;                       // "Semester 3 Fee Payment"
  description?: string;                // Optional description
  academicYear: string;                // "2024-25"
  semester?: number;                   // 3 (for semester type)
  
  // Date range
  startDate: string;                   // ISO date string
  endDate: string;                     // ISO date string
  status: PaymentPeriodStatus;        // enabled/disabled
  
  // Target filters (comma-separated or "ALL")
  targetCourses: string;               // "B.Tech,B.E" or "ALL"
  targetBranches: string;              // "CSE,IT,ECE" or "ALL"
  targetYears: string;                 // "1,2,3,4" or "ALL"
  
  // Fee breakdown
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFee: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
  totalAmount: number;
  
  // Metadata
  createdBy: string;                   // accountant email
  createdDate: string;                 // ISO date
  updatedBy?: string;
  updatedDate?: string;
  
  // Row tracking for Google Sheets
  rowNumber?: number;
}

export interface CreatePaymentPeriodParams {
  type: PaymentPeriodType;
  title: string;
  description?: string;
  academicYear: string;
  semester?: number;
  startDate: string;
  endDate: string;
  targetCourses: string;
  targetBranches: string;
  targetYears: string;
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFee: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
  createdBy: string;
}

export interface UpdatePaymentPeriodParams {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: PaymentPeriodStatus;
  targetCourses?: string;
  targetBranches?: string;
  targetYears?: string;
  tuitionFee?: number;
  amalgamatedFund?: number;
  sportsFee?: number;
  cautionMoney?: number;
  transferCertificateFee?: number;
  libraryCardReissueFee?: number;
  penaltyFee?: number;
  otherFees?: number;
  transactionCharges?: number;
  updatedBy: string;
}
