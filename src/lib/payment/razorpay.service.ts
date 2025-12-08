/**
 * Razorpay Service
 * Handles all Razorpay payment operations
 * Modular service that can be used across different modules
 */

import {
  razorpayConfig,
  validateRazorpayConfig,
  getRazorpayAuthHeader,
} from './razorpay.config';
import type {
  CreatePaymentLinkParams,
  RazorpayPaymentLinkResponse,
  PaymentRecord,
} from '@/types/payment';

/**
 * Create a Razorpay Payment Link
 * @param params - Payment link creation parameters
 * @returns Payment link response with short_url
 */
export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<RazorpayPaymentLinkResponse> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  const {
    amount,
    currency = 'INR',
    description,
    customerName,
    customerEmail,
    customerContact,
    referenceId,
    callbackUrl,
    expiresInDays = 7,
    notes = {},
  } = params;

  // Calculate expiry timestamp (current time + days)
  const expireBy = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;

  const payload = {
    amount,
    currency,
    accept_partial: false,
    description,
    customer: {
      name: customerName,
      email: customerEmail,
      contact: customerContact,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    notes: {
      ...notes,
      reference_id: referenceId,
    },
    callback_url: callbackUrl || `${process.env.NEXTAUTH_URL}/api/payment/callback`,
    callback_method: 'get',
    expire_by: expireBy,
    reference_id: referenceId,
  };

  try {
    const authHeader = getRazorpayAuthHeader();
    console.log('Making Razorpay API call with credentials:', {
      keyId: razorpayConfig.keyId,
      authHeaderLength: authHeader.length,
    });
    
    const response = await fetch(`${razorpayConfig.baseUrl}/payment_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Razorpay API Error:', error);
      throw new Error(error.error?.description || 'Failed to create payment link');
    }

    const data: RazorpayPaymentLinkResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
}

/**
 * Create a Razorpay Order for Checkout
 * @param params - Order creation parameters
 * @returns Razorpay order response
 */
export async function createRazorpayOrder(params: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, any>;
}): Promise<{
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, any>;
}> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  const { amount, currency = 'INR', receipt, notes = {} } = params;

  // Razorpay requires minimum 1 paise, but do not enforce any custom minimum in code
  const safeAmount = Math.max(1, Math.round(amount));

  const payload = {
    amount: safeAmount,
    currency,
    receipt,
    notes,
  };

  try {
    const authHeader = getRazorpayAuthHeader();
    console.log('Creating Razorpay order:', { amount, receipt });
    
    const response = await fetch(`${razorpayConfig.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Razorpay API Error:', error);
      throw new Error(error.error?.description || 'Failed to create order');
    }

    const data = await response.json();
    console.log('Razorpay order created:', data.id);
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Fetch Payment Link Status
 * @param paymentLinkId - Razorpay payment link ID
 * @returns Payment link details
 */
export async function getPaymentLinkStatus(
  paymentLinkId: string
): Promise<RazorpayPaymentLinkResponse> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const response = await fetch(
      `${razorpayConfig.baseUrl}/payment_links/${paymentLinkId}`,
      {
        method: 'GET',
        headers: {
          Authorization: getRazorpayAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Razorpay API Error:', error);
      throw new Error(error.error?.description || 'Failed to fetch payment link');
    }

    const data: RazorpayPaymentLinkResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payment link:', error);
    throw error;
  }
}

/**
 * Cancel a Payment Link
 * @param paymentLinkId - Razorpay payment link ID
 * @returns Cancelled payment link details
 */
export async function cancelPaymentLink(
  paymentLinkId: string
): Promise<RazorpayPaymentLinkResponse> {
  if (!validateRazorpayConfig()) {
    throw new Error('Razorpay configuration is invalid');
  }

  try {
    const response = await fetch(
      `${razorpayConfig.baseUrl}/payment_links/${paymentLinkId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: getRazorpayAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Razorpay API Error:', error);
      throw new Error(error.error?.description || 'Failed to cancel payment link');
    }

    const data: RazorpayPaymentLinkResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling payment link:', error);
    throw error;
  }
}

/**
 * Verify Razorpay Payment Signature
 * Used for webhook verification
 * @param signature - Razorpay signature from webhook
 * @param payload - Webhook payload
 * @returns boolean
 */
export function verifyPaymentSignature(signature: string, payload: string): boolean {
  if (!razorpayConfig.webhookSecret) {
    console.warn('Webhook secret not configured, skipping verification');
    return true;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Verify Razorpay Checkout Payment Signature
 * Used for client-side payment verification
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns boolean
 */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!razorpayConfig.keySecret) {
    throw new Error('Razorpay key secret not configured');
  }

  const crypto = require('crypto');
  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.keySecret)
    .update(text)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Convert Razorpay response to PaymentRecord
 * @param paymentLink - Razorpay payment link response
 * @returns PaymentRecord for database storage
 */
export function mapToPaymentRecord(
  paymentLink: RazorpayPaymentLinkResponse
): PaymentRecord {
  const isPaid = paymentLink.status === 'paid';
  const isPartiallyPaid = paymentLink.status === 'partially_paid';
  const isFailed = paymentLink.status === 'expired' || paymentLink.status === 'cancelled';

  let status: PaymentRecord['status'] = 'unpaid';
  if (isPaid) status = 'paid';
  else if (isPartiallyPaid) status = 'partial';
  else if (isFailed) status = 'failed';

  return {
    paymentLinkId: paymentLink.id,
    paymentId: paymentLink.payments?.[0]?.payment_id || undefined,
    referenceId: paymentLink.reference_id,
    amount: paymentLink.amount / 100, // Convert paise to rupees
    currency: paymentLink.currency,
    status,
    method: 'razorpay',
    paidAt: isPaid && paymentLink.payments?.[0]
      ? new Date(paymentLink.payments[0].created_at * 1000).toISOString()
      : undefined,
    metadata: {
      short_url: paymentLink.short_url,
      customer: paymentLink.customer,
      notes: paymentLink.notes,
    },
  };
}
