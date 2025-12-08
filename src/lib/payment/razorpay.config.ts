/**
 * Razorpay Configuration
 * Centralized configuration for Razorpay payment gateway
 */

export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET!,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  baseUrl: 'https://api.razorpay.com/v1',
};

/**
 * Razorpay API credentials validation
 */
export function validateRazorpayConfig(): boolean {
  console.log('Validating Razorpay config:', {
    keyId: razorpayConfig.keyId ? `${razorpayConfig.keyId.slice(0, 8)}...` : 'undefined',
    keySecret: razorpayConfig.keySecret ? 'set' : 'undefined',
  });
  
  if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
    console.error('Razorpay credentials are not configured');
    return false;
  }
  return true;
}

/**
 * Get Basic Auth header for Razorpay API
 */
export function getRazorpayAuthHeader(): string {
  const credentials = `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}
