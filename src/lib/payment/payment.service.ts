/**
 * Payment Service Layer
 * Business logic for payment operations
 * Integrates with Razorpay and Google Sheets
 */

import type { CreatePaymentParams, Payment, FeeBreakdown } from '@/types/payment';
import { createPaymentRecord, updatePaymentRecord } from '@/lib/google/sheets.payment';
import { createPaymentLink } from '@/lib/payment/razorpay.service';
import { sendPaymentConfirmationEmail } from '@/lib/email/mailer';

/**
 * Calculate total amount from fee breakdown
 */
export function calculateTotalAmount(feeBreakdown: FeeBreakdown): number {
  let total = 0;
  console.log('Calculating total amount from fee breakdown:', feeBreakdown);
  if ('roomFee' in feeBreakdown || 'messFee' in feeBreakdown) {
    total =
      (feeBreakdown.roomFee || 0) +
      (feeBreakdown.messFee || 0) +
      (feeBreakdown.otherFees || 0) +
      (feeBreakdown.transactionCharges || 0);
  } else {
    total =
      (feeBreakdown.tuitionFee || 0) +
      (feeBreakdown.amalgamatedFund || 0) +
      (feeBreakdown.sportsFeeUniversityShare || 0) +
      (feeBreakdown.cautionMoney || 0) +
      (feeBreakdown.transferCertificateFee || 0) +
      (feeBreakdown.libraryCardReissueFee || 0) +
      (feeBreakdown.penaltyFee || 0) +
      (feeBreakdown.otherFees || 0) +
      (feeBreakdown.transactionCharges || 0);
  }

  console.log('Calculated total amount from fee breakdown:', total);
  return total;
}

/**
 * Calculate transaction charges based on payment method
 * Razorpay charges ~2% for online payments
 */
export function calculateTransactionCharges(
  amount: number,
  paymentMethod: 'razorpay' | 'cash' | 'bank_transfer' | 'cheque'
): number {
  if (paymentMethod === 'razorpay') {
    // 2% + GST for Razorpay
    return Math.round(amount * 0.0236); // 2% + 18% GST
  }
  return 0; // No charges for cash/bank/cheque
}

/**
 * Convert number to words (Indian numbering system)
 * Example: 2750 -> "Rupees Two Thousand Seven Hundred Fifty Only"
 */
export function convertAmountToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
  }
  
  function convertIndianNumbering(n: number): string {
    if (n === 0) return '';
    
    // Crores
    if (n >= 10000000) {
      const crores = Math.floor(n / 10000000);
      const remainder = n % 10000000;
      return convertIndianNumbering(crores) + ' Crore' + (remainder > 0 ? ' ' + convertIndianNumbering(remainder) : '');
    }
    
    // Lakhs
    if (n >= 100000) {
      const lakhs = Math.floor(n / 100000);
      const remainder = n % 100000;
      return convertLessThanThousand(lakhs) + ' Lakh' + (remainder > 0 ? ' ' + convertIndianNumbering(remainder) : '');
    }
    
    // Thousands
    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      return convertLessThanThousand(thousands) + ' Thousand' + (remainder > 0 ? ' ' + convertLessThanThousand(remainder) : '');
    }
    
    return convertLessThanThousand(n);
  }
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let words = 'Rupees ' + convertIndianNumbering(rupees);
  
  if (paise > 0) {
    words += ' and ' + convertLessThanThousand(paise) + ' Paise';
  }
  
  return words + ' Only';
}

/**
 * Validate fee breakdown
 */
export function validateFeeBreakdown(feeBreakdown: FeeBreakdown): { valid: boolean; error?: string } {
  // Check for negative values
  const values = Object.values(feeBreakdown);
  if (values.some(v => v < 0)) {
    return { valid: false, error: 'Fee amounts cannot be negative' };
  }

  // Check if at least one fee is non-zero (hostel or admission)
  let total = 0;
  if ('roomFee' in feeBreakdown || 'messFee' in feeBreakdown) {
    total = (feeBreakdown.roomFee || 0) + (feeBreakdown.messFee || 0) + (feeBreakdown.otherFees || 0) + (feeBreakdown.transactionCharges || 0);
  } else {
    total = (feeBreakdown.tuitionFee || 0) + (feeBreakdown.amalgamatedFund || 0) + (feeBreakdown.sportsFeeUniversityShare || 0) + (feeBreakdown.cautionMoney || 0) + (feeBreakdown.transferCertificateFee || 0) + (feeBreakdown.libraryCardReissueFee || 0) + (feeBreakdown.penaltyFee || 0) + (feeBreakdown.otherFees || 0) + (feeBreakdown.transactionCharges || 0);
  }
  if (total === 0) {
    return { valid: false, error: 'Total amount must be greater than zero' };
  }

  // Check for reasonable maximum (e.g., 10 lakhs)
  if (total > 1000000) {
    return { valid: false, error: 'Total amount exceeds maximum allowed limit' };
  }

  return { valid: true };
}

/**
 * Create a new payment record
 * Main function called by admission staff or student
 */
export async function createPayment(params: CreatePaymentParams): Promise<Payment> {
  try {
    // Calculate total amount
      // Debug: log the received feeBreakdown
      console.log('[DEBUG] Received feeBreakdown in createPayment:', params.feeBreakdown);
      const totalAmount = params.totalAmount || calculateTotalAmount(params.feeBreakdown);
      console.log('[DEBUG] Calculated totalAmount in createPayment:', totalAmount);
    // Convert amount to words
    const amountInWords = params.amountInWords || convertAmountToWords(totalAmount);
    // Validate fee breakdown
    const validation = validateFeeBreakdown(params.feeBreakdown);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Fetch all payments
    const { applicationId, studentId, email } = params.studentInfo;
    const payments = await import('@/lib/google/sheets.payment').then(m => m.fetchAllPayments());
    // Find existing payment row by applicationId, studentId, or email
    const existingPayment = payments.find(p =>
      (applicationId && p.studentInfo.applicationId === applicationId) ||
      (studentId && p.studentInfo.studentId === studentId) ||
      (email && p.studentInfo.email.toLowerCase() === email.toLowerCase())
    );

    if (existingPayment) {
      // Merge studentInfo fields to avoid overwriting with empty values
      const mergedStudentInfo = {
        ...existingPayment.studentInfo,
        ...Object.fromEntries(
          Object.entries(params.studentInfo).filter(([_, v]) => v !== undefined && v !== '')
        ),
      };
      await updatePaymentRecord(existingPayment.id, {
        paymentType: params.paymentType,
        academicYear: params.academicYear,
        semester: params.semester,
        studentInfo: mergedStudentInfo,
        feeBreakdown: params.feeBreakdown,
        totalAmount,
        amountInWords,
        paymentStatus: 'unpaid',
        paymentMethod: params.paymentMethod,
        updatedBy: params.createdBy,
        notes: params.notes,
        remarks: params.remarks,
      });
      // Refetch and return the updated payment
      const updatedPayments = await import('@/lib/google/sheets.payment').then(m => m.fetchAllPayments());
      const updatedPayment = updatedPayments.find(p => p.id === existingPayment.id);
      console.log(`✅ Updated payment: ${existingPayment.id}`);
      return updatedPayment!;
    } else {
      // Fallback: create new (should not happen as per your note)
      const payment = await createPaymentRecord({
        timestamp: new Date().toISOString(),
        paymentType: params.paymentType,
        academicYear: params.academicYear,
        semester: params.semester,
        studentInfo: params.studentInfo,
        feeBreakdown: params.feeBreakdown,
        totalAmount,
        amountInWords,
        paymentStatus: 'unpaid',
        paymentMethod: params.paymentMethod,
        createdBy: params.createdBy,
        createdDate: new Date().toISOString(),
        notes: params.notes,
        remarks: params.remarks,
      });
      console.log(`✅ Created payment: ${payment.id}`);
      return payment;
    }
  } catch (error) {
    console.error('❌ Error creating/updating payment:', error);
    throw error;
  }
}

/**
 * Initiate Razorpay payment (for online payments)
 * Generates payment link and updates payment record
 */
export async function initiateRazorpayPayment(payment: Payment): Promise<string> {
  try {
    if (payment.paymentStatus === 'paid') {
      throw new Error('Payment already completed');
    }
    
    // Create Razorpay payment link
    const razorpayLink = await createPaymentLink({
      amount: payment.totalAmount * 100, // Convert to paise
      currency: 'INR',
      description: `${payment.paymentType.toUpperCase()} Fee - ${payment.studentInfo.course} ${payment.studentInfo.branch}`,
      customerName: payment.studentInfo.studentName,
      customerEmail: payment.studentInfo.email,
      customerContact: payment.studentInfo.mobile,
      referenceId: payment.id,
      notes: {
        paymentId: payment.id,
        applicationId: payment.studentInfo.applicationId || '',
        paymentType: payment.paymentType,
      },
    });
    
    // Update payment record with Razorpay details (use direct update to avoid fetching)
    const { updatePaymentRecordDirect } = await import('@/lib/google/sheets.payment');
    await updatePaymentRecordDirect(payment, {
      razorpayPaymentLinkId: razorpayLink.id,
      razorpayShortUrl: razorpayLink.short_url,
      updatedBy: payment.createdBy,
    });
    
    console.log(`✅ Razorpay payment link created: ${razorpayLink.short_url}`);
    return razorpayLink.short_url;
  } catch (error) {
    console.error('❌ Error initiating Razorpay payment:', error);
    throw error;
  }
}

/**
 * Record manual payment (cash/bank/cheque)
 * Called by staff when student pays offline
 */
export async function recordManualPayment(
  paymentId: string,
  transactionId: string,
  paymentDate: string,
  updatedBy: string
): Promise<void> {
  try {
    // Update payment status to trigger Apps Script email
    await updatePaymentRecord(paymentId, {
      paymentStatus: 'paid',
      transactionId,
      paymentDate,
      updatedBy,
      updatedDate: new Date().toISOString(),
    });
    
    // Fetch payment to get application details
    const { fetchPaymentById } = await import('@/lib/google/sheets.payment');
    const payment = await fetchPaymentById(paymentId);
    
    if (payment) {
      // Update application status
      if (payment.studentInfo.applicationId) {
        const { updateApplication } = await import('@/lib/google/sheets.admission');
        const rowNumber = parseInt(payment.studentInfo.applicationId.replace('APP-', ''));
        
        if (!isNaN(rowNumber)) {
          await updateApplication(rowNumber, {
            paymentStatus: 'paid',
          });
          console.log(`✅ Updated application ${payment.studentInfo.applicationId} payment status to paid`);
        }
      }
      
      // Send confirmation email
      await sendPaymentConfirmationEmail(
        payment.studentInfo.email,
        payment.studentInfo.studentName,
        payment.studentInfo.applicationId || payment.id,
        payment.referenceNumber,
        payment.totalAmount
      );
    }
    
    console.log(`✅ Manual payment recorded: ${paymentId}`);
  } catch (error) {
    console.error('❌ Error recording manual payment:', error);
    throw error;
  }
}

/**
 * Update payment status from Razorpay webhook
 * Called automatically when payment is completed
 */
export async function updatePaymentFromWebhook(
  razorpayPaymentLinkId: string,
  razorpayData: {
    paymentId: string;
    orderId?: string;
    status: string;
    method?: string;
  }
): Promise<void> {
  try {
    console.log('🔄 Starting payment update from webhook:', {
      razorpayPaymentLinkId,
      status: razorpayData.status,
      paymentId: razorpayData.paymentId,
    });

    // Find payment by Razorpay link ID
    const { fetchAllPayments } = await import('@/lib/google/sheets.payment');
    const payments = await fetchAllPayments();
    const payment = payments.find(p => p.razorpayPaymentLinkId === razorpayPaymentLinkId);
    
    if (!payment) {
      console.warn(`⚠️ Payment not found for Razorpay link: ${razorpayPaymentLinkId}`);
      console.warn(`Searched ${payments.length} payments`);
      return;
    }
    
    console.log('✅ Found payment record:', {
      paymentId: payment.id,
      applicationId: payment.studentInfo.applicationId,
      currentStatus: payment.paymentStatus,
    });
    
    // Map Razorpay status to our status
    let paymentStatus: Payment['paymentStatus'] = 'unpaid';
    if (razorpayData.status === 'paid' || razorpayData.status === 'captured') {
      paymentStatus = 'paid';
    } else if (razorpayData.status === 'failed') {
      paymentStatus = 'failed';
    }
    
    console.log(`🔄 Updating payment record to status: ${paymentStatus}`);
    
    // Update payment record
    const updateData: Partial<Payment> = {
      paymentStatus,
      razorpayPaymentId: razorpayData.paymentId,
      razorpayOrderId: razorpayData.orderId,
      transactionId: razorpayData.paymentId,
      paymentDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };
    
    await updatePaymentRecord(payment.id, updateData);
    
    console.log('✅ Payment record updated successfully');
    
    // Update application status if payment successful
    if (paymentStatus === 'paid' && payment.studentInfo.applicationId) {
      try {
        const { updateApplication } = await import('@/lib/google/sheets.admission');
        const rowNumber = parseInt(payment.studentInfo.applicationId.replace('APP-', ''));
        
        if (isNaN(rowNumber)) {
          console.error(`❌ Invalid row number from applicationId: ${payment.studentInfo.applicationId}`);
          return;
        }
        
        console.log(`🔄 Updating application row ${rowNumber} in Admissions sheet (column AH)...`);
        
        await updateApplication(rowNumber, {
          paymentStatus: 'paid',
        });
        
        console.log(`✅ Successfully updated application ${payment.studentInfo.applicationId} payment status to 'paid' in column AH`);
      } catch (appUpdateError) {
        console.error('❌ Error updating application payment status:', appUpdateError);
        // Log the full error for debugging
        console.error('Error details:', {
          message: appUpdateError instanceof Error ? appUpdateError.message : 'Unknown error',
          stack: appUpdateError instanceof Error ? appUpdateError.stack : undefined,
        });
      }
    } else {
      console.log(`ℹ️ Skipping application update: status=${paymentStatus}, applicationId=${payment.studentInfo.applicationId}`);
    }
    
    // Send confirmation email if payment successful
    if (paymentStatus === 'paid') {
      await sendPaymentConfirmationEmail(
        payment.studentInfo.email,
        payment.studentInfo.studentName,
        payment.studentInfo.applicationId || payment.id,
        payment.referenceNumber,
        payment.totalAmount
      );
    }
    
    console.log(`✅ Payment updated from webhook: ${payment.id} -> ${paymentStatus}`);
  } catch (error) {
    console.error('❌ Error updating payment from webhook:', error);
    throw error;
  }
}

/**
 * Get default admission fee structure
 * Can be customized based on course/branch
 */
export function getDefaultAdmissionFeeBreakdown(course: string, branch: string): FeeBreakdown {
  // This can be made dynamic based on course/branch
  // For now, returning a default structure
  return {
    tuitionFee: 0,
    amalgamatedFund: 2500,
    sportsFeeUniversityShare: 250,
    cautionMoney: 0,
    transferCertificateFee: 0,
    libraryCardReissueFee: 0,
    penaltyFee: 0,
    otherFees: 0,
    transactionCharges: 0,
  };
}

/**
 * Get default semester fee structure
 * Can be customized based on course/branch/semester
 */
export function getDefaultSemesterFeeBreakdown(
  course: string,
  branch: string,
  semester: number
): FeeBreakdown {
  // This can be made dynamic based on course/branch/semester
  // For now, returning a default structure
  return {
    tuitionFee: 50000,
    amalgamatedFund: 1000,
    sportsFeeUniversityShare: 500,
    cautionMoney: 0,
    transferCertificateFee: 0,
    libraryCardReissueFee: 0,
    penaltyFee: 0,
    otherFees: 0,
    transactionCharges: 0,
  };
}
