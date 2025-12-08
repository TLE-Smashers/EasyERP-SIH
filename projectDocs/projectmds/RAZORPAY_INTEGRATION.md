# Razorpay Payment Integration Guide

## Overview

This ERP system includes a modular Razorpay payment integration that can be used across different modules. The integration is designed following best practices with proper separation of concerns.

## Architecture

### Directory Structure

```
src/
├── lib/
│   └── payment/
│       ├── razorpay.config.ts    # Configuration
│       └── razorpay.service.ts   # Core service functions
├── types/
│   └── payment.ts                # Type definitions
├── actions/
│   └── payment/
│       └── createPayment.ts      # Server actions
└── app/
    └── api/
        └── payment/
            ├── webhook/
            │   └── route.ts      # Webhook handler
            └── callback/
                └── route.ts      # Callback handler
```

## Setup

### 1. Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Generate Test Mode keys (or Live Mode for production)
4. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret**

### 2. Configure Webhook

1. In Razorpay Dashboard, go to **Settings** → **Webhooks**
2. Create a new webhook with URL: `https://your-domain.com/api/payment/webhook`
3. Select events to listen:
   - `payment_link.paid`
   - `payment_link.cancelled`
   - `payment_link.expired`
4. Copy the **Webhook Secret**

### 3. Environment Variables

Add to your `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

## Usage

### Creating a Payment Link

```typescript
import { createAdmissionPayment } from '@/actions/payment/createPayment';

const result = await createAdmissionPayment({
  applicationId: 'APP-123',
  studentName: 'John Doe',
  studentEmail: 'john@example.com',
  studentPhone: '9876543210',
  amount: 50000, // Amount in rupees
  courseName: 'B.Tech Computer Science',
  rowIndex: 123, // Google Sheet row index
});

if (result.success) {
  console.log('Payment link:', result.data.paymentUrl);
}
```

### Checking Payment Status

```typescript
import { getPaymentStatus } from '@/actions/payment/createPayment';

const status = await getPaymentStatus('plink_xxxxx');
```

## Flow Diagram

```
Document Verification
        ↓
Create Payment Link (Razorpay)
        ↓
Send Email with Payment Link
        ↓
Student Pays via Link
        ↓
Razorpay Webhook Notification
        ↓
Update Sheet + Send Confirmation Email
        ↓
Redirect to Success Page
```

## Admission Module Integration

### Document Verification Flow

When documents are verified in Step 3:

1. **Automatic Payment Link Creation**
   ```typescript
   // In verifyDocuments action
   await createAdmissionPayment({
     applicationId,
     studentName,
     studentEmail,
     studentPhone,
     amount: 50000, // Configure as needed
     courseName,
     rowIndex,
   });
   ```

2. **Email Sent Automatically**
   - Beautiful HTML email with payment link
   - Includes application details
   - Expires in 7 days (configurable)

3. **Student Payment**
   - Student clicks link in email
   - Razorpay hosted payment page
   - Multiple payment methods supported

4. **Webhook Processing**
   - Razorpay sends webhook on payment success
   - Sheet updated automatically
   - Success email sent to student

## Customization

### Changing Payment Amount

Edit in `src/actions/admission/verifyDocuments.ts`:

```typescript
const paymentAmount = 50000; // Change this value
```

Or make it dynamic based on course:

```typescript
const paymentAmounts = {
  'B.Tech': 100000,
  'MBA': 150000,
  'M.Tech': 120000,
};

const paymentAmount = paymentAmounts[application.academicDetails.course] || 50000;
```

### Custom Email Templates

Edit templates in `src/lib/email/payment.templates.ts`:
- `generatePaymentLinkEmail()` - Payment request email
- `generatePaymentSuccessEmail()` - Success confirmation email

### Expiry Time

In `src/lib/payment/razorpay.service.ts`:

```typescript
const payload = {
  // ...
  expire_by: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
};
```

## Using in Other Modules

The payment integration is modular and can be reused:

### Example: Library Fee

```typescript
import { createPaymentLink } from '@/lib/payment/razorpay.service';

const paymentLink = await createPaymentLink({
  amount: 5000 * 100, // Library fee in paise
  description: 'Library Registration Fee',
  customerName: student.name,
  customerEmail: student.email,
  customerContact: student.phone,
  referenceId: `LIB-${student.id}`,
  notes: {
    module: 'library',
    student_id: student.id,
  },
});
```

### Example: Hostel Fee

```typescript
const paymentLink = await createPaymentLink({
  amount: 80000 * 100, // Hostel fee in paise
  description: 'Hostel Fee - Semester 1',
  customerName: student.name,
  customerEmail: student.email,
  customerContact: student.phone,
  referenceId: `HOSTEL-${student.id}`,
  notes: {
    module: 'hostel',
    student_id: student.id,
    semester: '1',
  },
});
```

## Testing

### Test Mode

1. Use test credentials (`rzp_test_`)
2. Use test card numbers:
   - Success: `4111 1111 1111 1111`
   - Failure: `4000 0000 0000 0002`
3. Any CVV and future expiry date

### Webhook Testing

Use [ngrok](https://ngrok.com/) for local testing:

```bash
ngrok http 3000
```

Update Razorpay webhook URL to ngrok URL.

## Security

✅ **Implemented:**
- Webhook signature verification
- Environment variables for secrets
- Server-side API calls only
- HTTPS required for production

⚠️ **Important:**
- Never expose Key Secret in client code
- Always verify webhook signatures
- Use HTTPS in production
- Store secrets in environment variables

## Error Handling

All functions return standardized responses:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
}
```

Example:

```typescript
const result = await createAdmissionPayment(params);

if (!result.success) {
  console.error(result.error);
  // Handle error
}
```

## Monitoring

- Check Razorpay Dashboard for all transactions
- View payment links: Dashboard → Payment Links
- View webhooks: Dashboard → Webhooks → Logs
- Check email logs in your email service

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Configure production webhook URL (HTTPS)
- [ ] Test end-to-end flow
- [ ] Set up proper error monitoring
- [ ] Configure email service for production
- [ ] Test webhook signature verification
- [ ] Set appropriate payment link expiry times
- [ ] Configure proper amount calculations

## Support

For issues:
1. Check Razorpay Dashboard logs
2. Check application server logs
3. Verify webhook is receiving events
4. Check email delivery logs

For Razorpay API documentation: https://razorpay.com/docs/
