/**
 * Google Sheets Payment Service
 * Handles all payment-related Google Sheets operations
 * Uses header-based column mapping for flexibility
 */

import { google } from 'googleapis';
import type { Payment, PaymentFilters } from '@/types/payment';

// Google Sheet Configuration
const PAYMENT_SHEET_ID = process.env.GOOGLE_SHEET_PAYMENT_ID || process.env.GOOGLE_SHEETS_ID;
const PAYMENT_SHEET_NAME = 'Payments';
const PAYMENT_SHEET_RANGE = `${PAYMENT_SHEET_NAME}!1:10000`;

/**
 * Column Header Keys (used in the spreadsheet)
 * These must match exactly with the header row in Google Sheets
 */
const COLUMN_KEYS = {
  // Primary Identifiers
  PAYMENT_ID: 'paymentId',
  REFERENCE_NUMBER: 'referenceNumber',
  TIMESTAMP: 'timestamp',
  
  // Foreign Keys
  APPLICATION_ID: 'applicationId',
  STUDENT_ID: 'studentId',
  
  // Student Info
  STUDENT_NAME: 'studentName',
  EMAIL: 'email',
  MOBILE: 'mobile',
  COURSE: 'course',
  BRANCH: 'branch',
  
  // Payment Context
  PAYMENT_TYPE: 'paymentType',
  ACADEMIC_YEAR: 'academicYear',
  SEMESTER: 'semester',
  ROLL_NUMBER: 'rollNumber',
  
  // Additional Student Info
  FATHER_NAME: 'fatherName',
  CATEGORY: 'category',
  
  // Fee Breakdown
  TUITION_FEE: 'tuitionFee',
  AMALGAMATED_FUND: 'amalgamatedFund',
  SPORTS_FEE: 'sportsFee',
  CAUTION_MONEY: 'cautionMoney',
  TRANSFER_CERT_FEE: 'transferCertificateFee',
  LIBRARY_CARD_FEE: 'libraryCardReissueFee',
  PENALTY_FEE: 'penaltyFee',
  OTHER_FEES: 'otherFees',
  TRANSACTION_CHARGES: 'transactionCharges',
  
  // Payment Totals
  TOTAL_AMOUNT: 'totalAmount',
  AMOUNT_IN_WORDS: 'amountInWords',
  
  // Payment Status
  PAYMENT_STATUS: 'paymentStatus',
  PAYMENT_METHOD: 'paymentMethod',
  
  // Razorpay Integration
  RAZORPAY_LINK_ID: 'razorpayLinkId',
  RAZORPAY_PAYMENT_ID: 'razorpayPaymentId',
  RAZORPAY_ORDER_ID: 'razorpayOrderId',
  RAZORPAY_SHORT_URL: 'razorpayShortUrl',
  
  // Transaction Details
  TRANSACTION_ID: 'transactionId',
  PAYMENT_DATE: 'paymentDate',
  
  // Audit Fields
  CREATED_BY: 'createdBy',
  CREATED_DATE: 'createdDate',
  UPDATED_BY: 'updatedBy',
  UPDATED_DATE: 'updatedDate',
  
  // Additional Data
  RECEIPT_URL: 'receiptUrl',
  NOTES: 'notes',
  REMARKS: 'remarks',
  
  // Email tracking
  EMAIL_SENT: 'emailSent',
} as const;

// Cache for column index mapping
let columnIndexCache: Record<string, number> | null = null;

/**
 * Get Google Sheets Auth Client
 */
function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  if (!PAYMENT_SHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

/**
 * Get Google Sheets API client
 */
async function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Build column index mapping from header row
 * This allows columns to be reordered without breaking the code
 */
async function getColumnIndexMapping(forceRefresh = false): Promise<Record<string, number>> {
  if (columnIndexCache && !forceRefresh) {
    return columnIndexCache;
  }

  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: PAYMENT_SHEET_ID!,
    range: `${PAYMENT_SHEET_NAME}!1:1`,
  });

  const headers = response.data.values?.[0] || [];
  const mapping: Record<string, number> = {};

  headers.forEach((header: string, index: number) => {
    // Use header as-is if it's already in the correct format
    // Otherwise try to normalize it
    const trimmedHeader = header.trim();
    
    // Store the exact header value (should be camelCase)
    mapping[trimmedHeader] = index;
    
    // Also store a fully lowercase version as fallback
    const lowercaseKey = trimmedHeader.toLowerCase();
    if (!mapping[lowercaseKey]) {
      mapping[lowercaseKey] = index;
    }
  });

  columnIndexCache = mapping;
  return mapping;
}

/**
 * Generate unique Payment ID with timestamp to avoid duplicates
 * Format: PAY-YYYY-MMDD-HHMMSS-RND
 * Example: PAY-2025-1117-143052-892
 */
function generatePaymentId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  
  return `PAY-${year}-${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

/**
 * Generate display reference number
 * Format: DUL + 7 random digits
 */
function generateReferenceNumber(): string {
  const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
  return `DUL${randomDigits}`;
}

/**
 * Convert Payment object to Google Sheets row object (key-value pairs)
 */
async function paymentToRowObject(payment: Payment): Promise<Record<string, any>> {
  return {
    [COLUMN_KEYS.PAYMENT_ID]: payment.id,
    [COLUMN_KEYS.REFERENCE_NUMBER]: payment.referenceNumber,
    [COLUMN_KEYS.TIMESTAMP]: payment.timestamp,
    
    [COLUMN_KEYS.APPLICATION_ID]: payment.studentInfo.applicationId || '',
    [COLUMN_KEYS.STUDENT_ID]: payment.studentInfo.studentId || '',
    
    [COLUMN_KEYS.STUDENT_NAME]: payment.studentInfo.studentName,
    [COLUMN_KEYS.EMAIL]: payment.studentInfo.email,
    [COLUMN_KEYS.MOBILE]: payment.studentInfo.mobile,
    [COLUMN_KEYS.COURSE]: payment.studentInfo.course,
    [COLUMN_KEYS.BRANCH]: payment.studentInfo.branch,
    
    [COLUMN_KEYS.PAYMENT_TYPE]: payment.paymentType,
    [COLUMN_KEYS.ACADEMIC_YEAR]: payment.academicYear || '',
    [COLUMN_KEYS.SEMESTER]: payment.semester || '',
    [COLUMN_KEYS.ROLL_NUMBER]: payment.studentInfo.rollNumber || '',
    
    [COLUMN_KEYS.FATHER_NAME]: payment.studentInfo.fatherName,
    [COLUMN_KEYS.CATEGORY]: payment.studentInfo.category,
    
    [COLUMN_KEYS.TUITION_FEE]: payment.feeBreakdown.tuitionFee,
    [COLUMN_KEYS.AMALGAMATED_FUND]: payment.feeBreakdown.amalgamatedFund,
    [COLUMN_KEYS.SPORTS_FEE]: payment.feeBreakdown.sportsFeeUniversityShare,
    [COLUMN_KEYS.CAUTION_MONEY]: payment.feeBreakdown.cautionMoney,
    [COLUMN_KEYS.TRANSFER_CERT_FEE]: payment.feeBreakdown.transferCertificateFee,
    [COLUMN_KEYS.LIBRARY_CARD_FEE]: payment.feeBreakdown.libraryCardReissueFee,
    [COLUMN_KEYS.PENALTY_FEE]: payment.feeBreakdown.penaltyFee,
    [COLUMN_KEYS.OTHER_FEES]: payment.feeBreakdown.otherFees,
    [COLUMN_KEYS.TRANSACTION_CHARGES]: payment.feeBreakdown.transactionCharges,
    
    [COLUMN_KEYS.TOTAL_AMOUNT]: payment.totalAmount,
    [COLUMN_KEYS.AMOUNT_IN_WORDS]: payment.amountInWords,
    
    [COLUMN_KEYS.PAYMENT_STATUS]: payment.paymentStatus,
    [COLUMN_KEYS.PAYMENT_METHOD]: payment.paymentMethod,
    
    [COLUMN_KEYS.RAZORPAY_LINK_ID]: payment.razorpayPaymentLinkId || '',
    [COLUMN_KEYS.RAZORPAY_PAYMENT_ID]: payment.razorpayPaymentId || '',
    [COLUMN_KEYS.RAZORPAY_ORDER_ID]: payment.razorpayOrderId || '',
    [COLUMN_KEYS.RAZORPAY_SHORT_URL]: payment.razorpayShortUrl || '',
    
    [COLUMN_KEYS.TRANSACTION_ID]: payment.transactionId || '',
    [COLUMN_KEYS.PAYMENT_DATE]: payment.paymentDate || '',
    
    [COLUMN_KEYS.CREATED_BY]: payment.createdBy,
    [COLUMN_KEYS.CREATED_DATE]: payment.createdDate,
    [COLUMN_KEYS.UPDATED_BY]: payment.updatedBy || '',
    [COLUMN_KEYS.UPDATED_DATE]: payment.updatedDate || '',
    
    [COLUMN_KEYS.RECEIPT_URL]: payment.receiptUrl || '',
    [COLUMN_KEYS.NOTES]: payment.notes || '',
    [COLUMN_KEYS.REMARKS]: payment.remarks || '',
    [COLUMN_KEYS.EMAIL_SENT]: 'FALSE', // Ensure App Script triggers email
  };
}

/**
 * Convert row object to Payment array for Google Sheets API
 */
async function rowObjectToArray(rowObject: Record<string, any>): Promise<any[]> {
  const mapping = await getColumnIndexMapping();
  const row: any[] = [];
  
  // Find the maximum column index
  const maxIndex = Math.max(...Object.values(mapping));
  
  // Initialize array with empty strings
  for (let i = 0; i <= maxIndex; i++) {
    row[i] = '';
  }
  
  // Fill in values based on mapping
  for (const [key, value] of Object.entries(rowObject)) {
    const index = mapping[key];
    if (index !== undefined) {
      row[index] = value;
    }
  }
  
  return row;
}

/**
 * Parse Google Sheets row to Payment object
 */
/**
 * Convert Google Sheets row array to Payment object
 * @param row - Array of cell values
 * @param rowNumber - Row number in sheet (for reference)
 * @param mapping - Pre-fetched column index mapping (optional, will fetch if not provided)
 */
async function rowToPayment(row: any[], rowNumber: number, mapping?: Record<string, number>): Promise<Payment> {
  // Use provided mapping or fetch it (cached)
  const columnMapping = mapping || await getColumnIndexMapping();
  
  const getValue = (key: string) => {
    const index = columnMapping[key];
    return index !== undefined ? row[index] : undefined;
  };
  
  return {
    id: getValue(COLUMN_KEYS.PAYMENT_ID) || '',
    referenceNumber: getValue(COLUMN_KEYS.REFERENCE_NUMBER) || '',
    timestamp: getValue(COLUMN_KEYS.TIMESTAMP) || '',
    
    paymentType: getValue(COLUMN_KEYS.PAYMENT_TYPE) as any || 'other',
    academicYear: getValue(COLUMN_KEYS.ACADEMIC_YEAR) || undefined,
    semester: getValue(COLUMN_KEYS.SEMESTER) ? Number(getValue(COLUMN_KEYS.SEMESTER)) : undefined,
    
    studentInfo: {
      applicationId: getValue(COLUMN_KEYS.APPLICATION_ID) || undefined,
      studentId: getValue(COLUMN_KEYS.STUDENT_ID) || undefined,
      studentName: getValue(COLUMN_KEYS.STUDENT_NAME) || '',
      email: getValue(COLUMN_KEYS.EMAIL) || '',
      mobile: getValue(COLUMN_KEYS.MOBILE) || '',
      course: getValue(COLUMN_KEYS.COURSE) || '',
      branch: getValue(COLUMN_KEYS.BRANCH) || '',
      rollNumber: getValue(COLUMN_KEYS.ROLL_NUMBER) || undefined,
      fatherName: getValue(COLUMN_KEYS.FATHER_NAME) || '',
      category: getValue(COLUMN_KEYS.CATEGORY) || '',
      semester: getValue(COLUMN_KEYS.SEMESTER) ? Number(getValue(COLUMN_KEYS.SEMESTER)) : undefined,
      academicYear: getValue(COLUMN_KEYS.ACADEMIC_YEAR) || undefined,
    },
    
    feeBreakdown: {
      tuitionFee: Number(getValue(COLUMN_KEYS.TUITION_FEE)) || 0,
      amalgamatedFund: Number(getValue(COLUMN_KEYS.AMALGAMATED_FUND)) || 0,
      sportsFeeUniversityShare: Number(getValue(COLUMN_KEYS.SPORTS_FEE)) || 0,
      cautionMoney: Number(getValue(COLUMN_KEYS.CAUTION_MONEY)) || 0,
      transferCertificateFee: Number(getValue(COLUMN_KEYS.TRANSFER_CERT_FEE)) || 0,
      libraryCardReissueFee: Number(getValue(COLUMN_KEYS.LIBRARY_CARD_FEE)) || 0,
      penaltyFee: Number(getValue(COLUMN_KEYS.PENALTY_FEE)) || 0,
      otherFees: Number(getValue(COLUMN_KEYS.OTHER_FEES)) || 0,
      transactionCharges: Number(getValue(COLUMN_KEYS.TRANSACTION_CHARGES)) || 0,
    },
    
    totalAmount: Number(getValue(COLUMN_KEYS.TOTAL_AMOUNT)) || 0,
    amountInWords: getValue(COLUMN_KEYS.AMOUNT_IN_WORDS) || '',
    
    paymentStatus: getValue(COLUMN_KEYS.PAYMENT_STATUS) as any || 'unpaid',
    paymentMethod: getValue(COLUMN_KEYS.PAYMENT_METHOD) as any || 'razorpay',
    
    razorpayPaymentLinkId: getValue(COLUMN_KEYS.RAZORPAY_LINK_ID) || undefined,
    razorpayPaymentId: getValue(COLUMN_KEYS.RAZORPAY_PAYMENT_ID) || undefined,
    razorpayOrderId: getValue(COLUMN_KEYS.RAZORPAY_ORDER_ID) || undefined,
    razorpayShortUrl: getValue(COLUMN_KEYS.RAZORPAY_SHORT_URL) || undefined,
    
    transactionId: getValue(COLUMN_KEYS.TRANSACTION_ID) || undefined,
    paymentDate: getValue(COLUMN_KEYS.PAYMENT_DATE) || undefined,
    
    createdBy: getValue(COLUMN_KEYS.CREATED_BY) || '',
    createdDate: getValue(COLUMN_KEYS.CREATED_DATE) || '',
    updatedBy: getValue(COLUMN_KEYS.UPDATED_BY) || undefined,
    updatedDate: getValue(COLUMN_KEYS.UPDATED_DATE) || undefined,
    
    receiptUrl: getValue(COLUMN_KEYS.RECEIPT_URL) || undefined,
    notes: getValue(COLUMN_KEYS.NOTES) || undefined,
    remarks: getValue(COLUMN_KEYS.REMARKS) || undefined,
    
    rowNumber,
  };
}

/**
 * Fetch all payments from Google Sheets
 */
export async function fetchAllPayments(): Promise<Payment[]> {
  try {
    const sheets = await getSheetsClient();
    
    // Fetch column mapping ONCE before processing rows
    const columnMapping = await getColumnIndexMapping();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: PAYMENT_SHEET_ID!,
      range: PAYMENT_SHEET_RANGE,
    });
    
    const rows = response.data.values || [];
    if (rows.length === 0) return [];
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    // Parse each row, passing the pre-fetched mapping
    const payments = await Promise.all(
      dataRows.map((row, index) => rowToPayment(row as any[], index + 2, columnMapping)) // +2 because row 1 is header
    );
    
    // Filter out empty rows
    const validPayments = payments.filter(payment => payment.id);

    return validPayments;
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    throw error;
  }
}

/**
 * Create new payment record in Google Sheets
 */
export async function createPaymentRecord(payment: Omit<Payment, 'id' | 'referenceNumber' | 'rowNumber'>): Promise<Payment> {
  try {
    // Fetch existing data to determine row number
    const existingPayments = await fetchAllPayments();
    const nextRowNumber = existingPayments.length + 2; // +2 because row 1 is header
    
    // Generate IDs (timestamp-based to avoid duplicates)
    const paymentId = generatePaymentId();
    const referenceNumber = generateReferenceNumber();
    
    // Create complete payment object
    const completePayment: Payment = {
      ...payment,
      id: paymentId,
      referenceNumber,
      rowNumber: nextRowNumber,
    };
    
    // Convert to row format
    const rowObject = await paymentToRowObject(completePayment);
    const rowData = await rowObjectToArray(rowObject);
    
    // Append to sheet
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: PAYMENT_SHEET_ID!,
      range: PAYMENT_SHEET_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });
    
    console.log(`✅ Created payment record: ${paymentId} (Row ${nextRowNumber})`);
    return completePayment;
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    throw error;
  }
}

/**
 * Fetch payment by ID
 */
export async function fetchPaymentById(paymentId: string): Promise<Payment | null> {
  try {
    const payments = await fetchAllPayments();
    const payment = payments.find(p => p.id === paymentId);
    return payment || null;
  } catch (error) {
    console.error('❌ Error fetching payment by ID:', error);
    throw error;
  }
}

/**
 * Update existing payment record
 */
export async function updatePaymentRecord(
  paymentId: string,
  updates: Partial<Payment>
): Promise<void> {
  try {
    // Fetch payment to get row number
    const payment = await fetchPaymentById(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }
    
    await updatePaymentRecordDirect(payment, updates);
  } catch (error) {
    console.error('❌ Error updating payment record:', error);
    throw error;
  }
}

/**
 * Update existing payment record directly (when you already have the payment object)
 */
export async function updatePaymentRecordDirect(
  payment: Payment,
  updates: Partial<Payment>
): Promise<void> {
  try {
    // Merge updates
    const updatedPayment: Payment = {
      ...payment,
      ...updates,
      updatedDate: new Date().toISOString(),
    };
    
    // Convert to row format
    const rowObject = await paymentToRowObject(updatedPayment);
    const rowData = await rowObjectToArray(rowObject);
    
    // Calculate column range based on actual data length
    const lastColumnIndex = rowData.length - 1;
    let lastColumn: string;
    
    // Handle columns beyond Z (AA, AB, etc.)
    if (lastColumnIndex < 26) {
      lastColumn = String.fromCharCode(65 + lastColumnIndex);
    } else {
      const firstLetter = String.fromCharCode(65 + Math.floor(lastColumnIndex / 26) - 1);
      const secondLetter = String.fromCharCode(65 + (lastColumnIndex % 26));
      lastColumn = firstLetter + secondLetter;
    }
    
    // Update sheet row using batchUpdate to trigger Apps Script onEdit
    const sheets = await getSheetsClient();
    const range = `${PAYMENT_SHEET_NAME}!A${payment.rowNumber}:${lastColumn}${payment.rowNumber}`;
    
    // Use batchUpdate instead of values.update to trigger Apps Script triggers
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: PAYMENT_SHEET_ID!,
      requestBody: {
        data: [{
          range,
          values: [rowData],
        }],
        valueInputOption: 'RAW',
      },
    });
    
    console.log(`✅ Updated payment record: ${payment.id}`);
  } catch (error) {
    console.error('❌ Error updating payment record:', error);
    throw error;
  }
}

/**
 * Fetch payments by application ID
 */
export async function fetchPaymentsByApplicationId(applicationId: string): Promise<Payment[]> {
  try {
    const payments = await fetchAllPayments();
    return payments.filter(p => p.studentInfo.applicationId === applicationId);
  } catch (error) {
    console.error('❌ Error fetching payments by application ID:', error);
    throw error;
  }
}

/**
 * Fetch payments by student email
 */
export async function fetchPaymentsByEmail(email: string): Promise<Payment[]> {
  try {
    const payments = await fetchAllPayments();
    return payments.filter(p => p.studentInfo.email.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error('❌ Error fetching payments by email:', error);
    throw error;
  }
}

/**
 * Fetch payments with filters
 */
export async function fetchPaymentsWithFilters(filters: PaymentFilters): Promise<Payment[]> {
  try {
    let payments = await fetchAllPayments();
    
    // Apply filters
    if (filters.applicationId) {
      payments = payments.filter(p => p.studentInfo.applicationId === filters.applicationId);
    }
    
    if (filters.studentId) {
      payments = payments.filter(p => p.studentInfo.studentId === filters.studentId);
    }
    
    if (filters.email) {
      payments = payments.filter(p => 
        p.studentInfo.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }
    
    if (filters.course) {
      payments = payments.filter(p => p.studentInfo.course === filters.course);
    }
    
    if (filters.branch) {
      payments = payments.filter(p => p.studentInfo.branch === filters.branch);
    }
    
    if (filters.paymentType) {
      payments = payments.filter(p => p.paymentType === filters.paymentType);
    }
    
    if (filters.paymentStatus) {
      payments = payments.filter(p => p.paymentStatus === filters.paymentStatus);
    }
    
    if (filters.paymentMethod) {
      payments = payments.filter(p => p.paymentMethod === filters.paymentMethod);
    }
    
    if (filters.semester) {
      payments = payments.filter(p => p.semester === filters.semester);
    }
    
    if (filters.academicYear) {
      payments = payments.filter(p => p.academicYear === filters.academicYear);
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      payments = payments.filter(p =>
        p.studentInfo.studentName.toLowerCase().includes(query) ||
        p.studentInfo.email.toLowerCase().includes(query) ||
        p.referenceNumber.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }
    
    return payments;
  } catch (error) {
    console.error('❌ Error fetching payments with filters:', error);
    throw error;
  }
}

/**
 * Update payment status (for webhook updates)
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['paymentStatus'],
  razorpayData?: {
    paymentId?: string;
    orderId?: string;
    transactionId?: string;
    paymentDate?: string;
  }
): Promise<void> {
  try {
    const updates: Partial<Payment> = {
      paymentStatus: status,
      ...razorpayData,
    };
    
    await updatePaymentRecord(paymentId, updates);
    console.log(`✅ Updated payment status: ${paymentId} -> ${status}`);
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw error;
  }
}
