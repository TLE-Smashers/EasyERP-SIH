/**
 * Create Payment Dialog/Sheet Component
 * Wrapper around PaymentForm for creating new payments
 * Used by admission staff in the ApplicationDrawer
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PaymentForm } from './PaymentForm';
import { createPaymentAction } from '@/actions/payment/paymentActions';
import type { CreatePaymentParams, FeeBreakdown } from '@/types/payment';

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreatePaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Context type: 'admission' | 'hostel' | ...
  paymentType?: 'admission' | 'semester' | 'exam' | 'hostel' | 'library' | 'other';
  // Context fields: controls which fields to show and how to structure the response
  paymentContext?: 'admission' | 'hostel';
  // Pre-filled data for the context
  contextData?: any;
  defaultFeeBreakdown?: Partial<FeeBreakdown>;
  createdBy: string;
  // Callback after successful payment
  onSuccess?: (result: any) => void;
}

export function CreatePaymentSheet({
  open,
  onOpenChange,
  paymentType = 'admission',
  paymentContext = 'admission',
  contextData,
  defaultFeeBreakdown,
  createdBy,
  onSuccess,
}: CreatePaymentSheetProps) {
  const router = useRouter();
  const [paymentLinkUrl, setPaymentLinkUrl] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [razorpayKey, setRazorpayKey] = React.useState<string>('');

  // Fetch Razorpay key on mount
  React.useEffect(() => {
    const fetchKey = async () => {
      try {
        const response = await fetch('/api/payment/config');
        const data = await response.json();
        if (data.keyId) {
          setRazorpayKey(data.keyId);
        }
      } catch (error) {
        console.error('Failed to fetch Razorpay key:', error);
      }
    };
    
    if (open) {
      fetchKey();
    }
  }, [open]);

  const handleRazorpayCheckout = async (
    razorpayOrder: any,
    payment: any
  ) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded', {
        description: 'Please refresh the page and try again.',
      });
      return;
    }

    if (!razorpayKey) {
      toast.error('Razorpay configuration error', {
        description: 'Please contact support.',
      });
      console.error('Razorpay key ID is missing');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Easy ERP',
      description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} Fee Payment`,
      order_id: razorpayOrder.id,
      prefill: {
        name: payment?.studentInfo?.studentName || '',
        email: payment?.studentInfo?.email || '',
        contact: payment?.studentInfo?.mobile || '',
      },
      theme: {
        color: '#3399cc',
      },
      handler: async function (response: any) {
        setIsProcessing(true);
        try {
          // Verify payment on server
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              paymentRecordId: payment.id,
              applicationId: payment?.studentInfo?.applicationId,
              paymentContext,
              studentId: payment?.studentInfo?.studentId,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Payment successful!', {
              description: 'Payment has been recorded successfully.',
            });
            
            onSuccess?.(payment.id);
            
            // Refresh to show updated status
            router.refresh();
            
            // Close sheet after a short delay
            setTimeout(() => {
              onOpenChange(false);
            }, 1500);
          } else {
            toast.error('Payment verification failed', {
              description: verifyData.error || 'Please contact support.',
            });
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed', {
            description: 'Please contact support with your payment details.',
          });
        } finally {
          setIsProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
          toast.info('Payment cancelled', {
            description: 'You can retry the payment anytime.',
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (data: CreatePaymentParams) => {
    // Debug: log the feeBreakdown being sent
    console.log('Submitting payment with feeBreakdown:', data.feeBreakdown);

    // For hostel, ensure defaultFeeBreakdown is enforced if not present
    if (paymentContext === 'hostel') {
      if (!data.feeBreakdown || typeof data.feeBreakdown.roomFee !== 'number') {
        data.feeBreakdown = {
          roomFee: 2000,
          messFee: 1000,
          otherFees: 0,
          tuitionFee: 0,
          amalgamatedFund: 0,
          sportsFeeUniversityShare: 0,
          cautionMoney: 0,
          transferCertificateFee: 0,
          libraryCardReissueFee: 0,
          penaltyFee: 0,
          transactionCharges: 0,
        };
      }
      if (typeof data.feeBreakdown.messFee !== 'number') {
        data.feeBreakdown.messFee = 0;
      }
    }

    console.log('🔗 Generating payment link with data:', data);
    const result = await createPaymentAction(data);

    if (result.success && result.payment) {
      // For Razorpay, open checkout modal
      if (data.paymentMethod === 'razorpay' && result.razorpayOrder) {
        toast.success('Payment initiated!', {
          description: 'Opening payment gateway...',
        });
        // Close the Sheet before opening Razorpay modal
        onOpenChange(false);
        setTimeout(() => {
          handleRazorpayCheckout(result.razorpayOrder, result.payment);
        }, 300);
      } 
      // For manual payments (cash, bank, cheque)
      else {
        toast.success('Payment created successfully!', {
          description: `Payment ID: ${result.payment.id}`,
        });
        
        onSuccess?.(result.payment.id);
        router.refresh();
        onOpenChange(false);
      }
    } else {
      toast.error('Failed to create payment', {
        description: result.error || 'An error occurred while creating the payment.',
      });
    }
  };

  const handleClose = () => {
    if (isProcessing) {
      toast.warning('Payment in progress', {
        description: 'Please complete or cancel the payment first.',
      });
      return;
    }
    setPaymentLinkUrl('');
    onOpenChange(false);
  };

  // Determine which fields to show based on context
  let initialData = {};
  let applicationId = undefined;
  let studentId = undefined;
  let showStudentFields = true;
  if (paymentContext === 'admission') {
    initialData = {
      studentName: contextData?.studentName || '',
      fatherName: contextData?.fatherName || '',
      email: contextData?.email || '',
      mobile: contextData?.mobile || '',
      rollNumber: contextData?.rollNumber,
      course: contextData?.course || '',
      branch: contextData?.branch || '',
      category: contextData?.category || 'General',
      paymentType,
    };
    applicationId = contextData?.applicationId;
    studentId = contextData?.studentId;
    showStudentFields = true;
  } else if (paymentContext === 'hostel') {
    initialData = {
      studentName: contextData?.fullName || '',
      email: contextData?.email || '',
      mobile: contextData?.contactNumber || '',
      category: contextData?.category || 'General',
      paymentType,
    };
    applicationId = contextData?.studentId;
    studentId = contextData?.studentId;
    showStudentFields = false; // Only show summary, not editable fields
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <SheetHeader className="px-6 py-5 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-xl">Create Payment</SheetTitle>
          <SheetDescription className="text-sm mt-1">
            {isProcessing 
              ? 'Processing payment...' 
              : 'Enter payment details and select payment method.'}
          </SheetDescription>
        </SheetHeader>

        {isProcessing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm font-medium">Verifying payment...</p>
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          {/* Hostel summary if context is hostel */}
          {paymentContext === 'hostel' && (
            <div className="mb-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 space-y-2">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Student ID</div>
                    <div className="font-semibold">{contextData?.studentId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Name</div>
                    <div className="font-semibold">{contextData?.fullName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Email</div>
                    <div className="font-semibold">{contextData?.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Contact</div>
                    <div className="font-semibold">{contextData?.contactNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Gender</div>
                    <div className="font-semibold capitalize">{contextData?.gender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Category</div>
                    <div className="font-semibold">{contextData?.category}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Room</div>
                    <div className="font-semibold">{contextData?.roomNumber || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <PaymentForm
            mode="create"
            initialData={initialData}
            applicationId={applicationId}
            studentId={studentId}
            defaultFeeBreakdown={defaultFeeBreakdown}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            allowedPaymentTypes={[paymentType]}
            showStudentFields={showStudentFields}
            createdBy={createdBy}
            paymentContext={paymentContext}
          />

          {paymentLinkUrl && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                ✅ Payment Link Generated Successfully!
              </p>
              <div className="space-y-2">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Share this link with the student:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={paymentLinkUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-900"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentLinkUrl);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(paymentLinkUrl, '_blank')}
                    className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Open
                  </button>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  The student can pay using UPI, Cards, Net Banking, or other online methods.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
