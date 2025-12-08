/**
 * Razorpay Webhook Handler
 * Handles payment status updates from Razorpay
 * Auto-updates payment records in Google Sheets and sends emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/payment/razorpay.service';
import { updatePaymentFromWebhook } from '@/lib/payment/payment.service';
import type { RazorpayWebhookPayload } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const payload = await request.text();

    // Verify webhook signature
    if (signature && !verifyPaymentSignature(signature, payload)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData: RazorpayWebhookPayload = JSON.parse(payload);
    console.log('📥 Razorpay webhook received:', webhookData.event);

    // Handle payment link paid event
    if (webhookData.event === 'payment_link.paid') {
      const paymentLinkEntity = webhookData.payload.payment_link.entity;
      const paymentEntity = webhookData.payload.payment.entity;

      await updatePaymentFromWebhook(paymentLinkEntity.id, {
        paymentId: paymentEntity.id,
        orderId: paymentEntity.order_id,
        status: 'paid',
        method: paymentEntity.method,
      });

      console.log('✅ Payment link paid:', {
        paymentLinkId: paymentLinkEntity.id,
        paymentId: paymentEntity.id,
        amount: paymentEntity.amount / 100,
      });
    }

    // Handle payment captured events (backup for direct payments)
    if (webhookData.event === 'payment.captured') {
      const paymentEntity = webhookData.payload.payment.entity;

      // Try to update by payment ID
      await updatePaymentFromWebhook(paymentEntity.id, {
        paymentId: paymentEntity.id,
        orderId: paymentEntity.order_id,
        status: 'paid',
        method: paymentEntity.method,
      });

      console.log('✅ Payment captured:', {
        paymentId: paymentEntity.id,
        amount: paymentEntity.amount / 100,
      });
    }

    // Handle payment failed events
    if (webhookData.event === 'payment.failed') {
      const paymentEntity = webhookData.payload.payment.entity as any;

      await updatePaymentFromWebhook(paymentEntity.id, {
        paymentId: paymentEntity.id,
        status: 'failed',
        method: paymentEntity.method,
      });

      console.log('⚠️ Payment failed:', {
        paymentId: paymentEntity.id,
        errorCode: paymentEntity.error_code || 'unknown',
        errorDescription: paymentEntity.error_description || 'No description',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Force Node.js runtime for googleapis
export const runtime = 'nodejs';
