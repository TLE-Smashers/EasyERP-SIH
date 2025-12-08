/**
 * Payment Config API
 * Returns public Razorpay configuration
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    
    if (!razorpayKeyId) {
      return NextResponse.json(
        { error: 'Razorpay not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error('Error fetching payment config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

// Force Node.js runtime
export const runtime = 'nodejs';
