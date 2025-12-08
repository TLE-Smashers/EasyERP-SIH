/**
 * Server Actions for Payment Module
 * Handles payment creation and management
 */

'use server';

import { revalidatePath } from 'next/cache';
import type { CreatePaymentParams, Payment } from '@/types/payment';
import {
  createPayment,
  initiateRazorpayPayment,
  recordManualPayment,
} from '@/lib/payment/payment.service';

/**
 * Create a new payment record
 */
export async function createPaymentAction(
  params: CreatePaymentParams
): Promise<{ success: boolean; payment?: Payment; paymentLink?: string; razorpayOrder?: any; error?: string }> {
  try {
    // Create payment record
    const payment = await createPayment(params);
    console.log('Payment created with ID:', payment.id);
    
    // If Razorpay payment, generate payment link (legacy) or order (new checkout flow)
    let paymentLink: string | undefined;
    let razorpayOrder: any | undefined;
    
    if (params.paymentMethod === 'razorpay') {
      // Create Razorpay order for checkout instead of payment link
      const { createRazorpayOrder } = await import('@/lib/payment/razorpay.service');
      const { calculateTotalAmount } = await import('@/lib/payment/payment.utils');

      // Use the original params.feeBreakdown from the frontend for total calculation
      console.log('Recalculating total amount for Razorpay order from params.feeBreakdown:', params.feeBreakdown);
      const totalAmount = calculateTotalAmount(params.feeBreakdown);
      console.log('Total amount for Razorpay order (from params.feeBreakdown):', totalAmount);
      const safeAmount = Math.max(1, Math.round(totalAmount * 100)); // At least 1 paise

      razorpayOrder = await createRazorpayOrder({
        amount: safeAmount,
        currency: 'INR',
        receipt: payment.id,
        notes: {
          paymentId: payment.id,
          applicationId: payment.studentInfo.applicationId,
          studentName: payment.studentInfo.studentName,
          paymentType: payment.paymentType,
        },
      });
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard/accounts/payments');
    revalidatePath('/dashboard/admission/applications');

    return {
      success: true,
      payment,
      paymentLink,
      razorpayOrder,
    };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment',
    };
  }
}

/**
 * Record a manual payment (cash/bank/cheque)
 */
export async function recordManualPaymentAction(
  paymentId: string,
  transactionId: string,
  paymentDate: string,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await recordManualPayment(paymentId, transactionId, paymentDate, updatedBy);

    // Revalidate relevant paths
    revalidatePath('/dashboard/accounts/payments');
    revalidatePath('/dashboard/admission/applications');

    return { success: true };
  } catch (error: any) {
    console.error('Error recording manual payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to record payment',
    };
  }
}

/**
 * Fetch all payments
 */
export async function fetchPaymentsAction() {
  try {
    const { fetchAllPayments } = await import('@/lib/google/sheets.payment');
    const payments = await fetchAllPayments();
    return { success: true, payments };
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payments',
      payments: [],
    };
  }
}

/**
 * Fetch payment by ID
 */
export async function fetchPaymentByIdAction(paymentId: string) {
  try {
    const { fetchPaymentById } = await import('@/lib/google/sheets.payment');
    const payment = await fetchPaymentById(paymentId);
    return { success: true, payment };
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payment',
      payment: null,
    };
  }
}

/**
 * Fetch payments by application ID
 */
export async function fetchPaymentsByApplicationIdAction(applicationId: string) {
  try {
    const { fetchPaymentsByApplicationId } = await import('@/lib/google/sheets.payment');
    const payments = await fetchPaymentsByApplicationId(applicationId);
    return { success: true, payments };
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch payments',
      payments: [],
    };
  }
}
