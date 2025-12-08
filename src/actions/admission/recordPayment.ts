/**
 * @deprecated Record Payment Action - DEPRECATED
 * 
 * This file is deprecated. Payment recording is now handled by the separate payment module.
 * Use src/actions/payment/paymentActions.ts instead.
 * 
 * Payment tracking is now separate from admission tracking:
 * - Admissions sheet: Student admission data and document verification
 * - Payments sheet: All payment transactions and receipts
 * 
 * Migration: Use createPaymentAction() from @/actions/payment/paymentActions
 */

"use server";

import { ApiResponse } from "@/types/admission";

/**
 * @deprecated Use createPaymentAction from @/actions/payment/paymentActions
 */
export async function recordPayment(
  applicationId: string,
  paymentData: any
): Promise<ApiResponse<{ receiptId: string }>> {
  throw new Error("recordPayment is deprecated. Use createPaymentAction from @/actions/payment/paymentActions instead.");
}
