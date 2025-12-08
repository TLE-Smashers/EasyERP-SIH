/**
 * Payment Verification Handler
 * Verifies Razorpay checkout payment and updates sheet
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckoutSignature } from '@/lib/payment/razorpay.service';
import { updatePaymentStatus } from '@/lib/google/sheets.payment';
import { updateApplication } from '@/lib/google/sheets.admission';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentId,
      signature,
      paymentRecordId,
      applicationId,
    } = body;

    console.log('💳 Verifying payment:', {
      orderId,
      paymentId,
      paymentRecordId,
      applicationId,
    });

    // Verify signature
    const isValid = verifyCheckoutSignature(orderId, paymentId, signature);

    if (!isValid) {
      console.error('❌ Invalid payment signature');
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    console.log('✅ Payment signature verified');


    // Update payment status in sheet
    if (paymentRecordId) {
      try {
        await updatePaymentStatus(
          paymentRecordId,
          'paid',
          {
            paymentId: paymentId,
            orderId: orderId,
            paymentDate: new Date().toISOString(),
          }
        );
        console.log('✅ Payment status updated in sheet');
      } catch (error) {
        console.error('⚠️ Failed to update payment status:', error);
      }
    }

    // Hostel payment: update hostel application status and paymentConfirmed
    if (body.paymentContext === 'hostel' && body.studentId) {
      try {
        const { confirmHostelPayment } = await import('@/lib/google/hostelSheet');
        await confirmHostelPayment(body.studentId);
        console.log(`✅ Hostel application updated for studentId ${body.studentId}`);
      } catch (error) {
        console.error('⚠️ Failed to update hostel application:', error);
      }
    }

    // Admission payment: update application status if provided
    if (body.paymentContext === 'admission' && applicationId) {
      try {
        const rowNumber = parseInt(applicationId.replace('APP-', ''));
        if (!isNaN(rowNumber)) {
          await updateApplication(rowNumber, {
            paymentStatus: 'paid',
          });
          console.log(`✅ Updated application ${applicationId} payment status`);
        }
      } catch (error) {
        console.error('⚠️ Failed to update application:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

// Force Node.js runtime
export const runtime = 'nodejs';
