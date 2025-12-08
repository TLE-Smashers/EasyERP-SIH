/**
 * Payment Callback Handler (Legacy - for payment links)
 * Note: New checkout flow uses /api/payment/verify instead
 * This handles redirect after payment completion via payment links
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentLinkStatus } from '@/lib/payment/razorpay.service';
import { updatePaymentFromWebhook } from '@/lib/payment/payment.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentLinkId = searchParams.get('razorpay_payment_link_id');
    const paymentId = searchParams.get('razorpay_payment_id');
    const referenceId = searchParams.get('razorpay_payment_link_reference_id');
    const paymentStatus = searchParams.get('razorpay_payment_link_status');

    console.log('💳 Payment callback received (legacy):', {
      paymentLinkId,
      paymentId,
      referenceId,
      status: paymentStatus,
    });

    if (!paymentLinkId) {
      // Return simple success page for new checkout flow
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Payment Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .success { color: #22c55e; }
    .error { color: #ef4444; }
    .icon { font-size: 48px; margin-bottom: 1rem; }
    h1 { font-size: 24px; margin: 0 0 0.5rem 0; }
    p { color: #666; margin: 0 0 1.5rem 0; }
    button {
      background: #3399cc;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #2980b9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">⚠️</div>
    <h1>Invalid Payment</h1>
    <p>No payment information received. Please try again.</p>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Fetch payment link status to get the applicationId from notes
    const paymentLink = await getPaymentLinkStatus(paymentLinkId);

    if (paymentLink.status === 'paid' && paymentId) {
      // Update payment record in database
      try {
        await updatePaymentFromWebhook(paymentLinkId, {
          paymentId: paymentId,
          orderId: paymentLinkId, // Use paymentLinkId as orderId
          status: 'paid',
          method: 'razorpay',
        });
        console.log('✅ Payment status updated from callback');
      } catch (updateError) {
        console.error('⚠️ Failed to update payment from callback:', updateError);
        
        // Fallback: Try to update application directly using notes
        if (paymentLink.notes?.applicationId) {
          try {
            const { updateApplication } = await import('@/lib/google/sheets.admission');
            const rowNumber = parseInt(paymentLink.notes.applicationId.replace('APP-', ''));
            
            if (!isNaN(rowNumber)) {
              await updateApplication(rowNumber, {
                paymentStatus: 'paid',
              });
              console.log(`✅ Fallback: Updated application ${paymentLink.notes.applicationId} payment status`);
            }
          } catch (fallbackError) {
            console.error('❌ Fallback update also failed:', fallbackError);
          }
        }
      }
      
      // Return success page instead of redirect
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Payment Successful</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .success { color: #22c55e; }
    .icon { font-size: 48px; margin-bottom: 1rem; }
    h1 { font-size: 24px; margin: 0 0 0.5rem 0; }
    p { color: #666; margin: 0 0 1.5rem 0; }
    button {
      background: #22c55e;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover { background: #16a34a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon success">✓</div>
    <h1 class="success">Payment Successful!</h1>
    <p>Your payment has been received and recorded successfully.</p>
    <p style="font-size: 14px; color: #999;">Payment ID: ${paymentId}</p>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      // Return error page instead of redirect
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Payment Failed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .error { color: #ef4444; }
    .icon { font-size: 48px; margin-bottom: 1rem; }
    h1 { font-size: 24px; margin: 0 0 0.5rem 0; }
    p { color: #666; margin: 0 0 1.5rem 0; }
    button {
      background: #ef4444;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon error">✗</div>
    <h1 class="error">Payment Failed</h1>
    <p>Your payment was not successful. Please try again.</p>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Payment Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .error { color: #ef4444; }
    .icon { font-size: 48px; margin-bottom: 1rem; }
    h1 { font-size: 24px; margin: 0 0 0.5rem 0; }
    p { color: #666; margin: 0 0 1.5rem 0; }
    button {
      background: #ef4444;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover { background: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon error">⚠️</div>
    <h1 class="error">Payment Error</h1>
    <p>An error occurred while processing your payment. Please contact support.</p>
    <button onclick="window.close()">Close</button>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Force Node.js runtime
export const runtime = 'nodejs';
