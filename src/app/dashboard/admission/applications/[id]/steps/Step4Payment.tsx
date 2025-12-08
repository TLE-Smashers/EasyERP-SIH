/**
 * Step 4: Payment Recording
 * Razorpay payment link generation and receipt management
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/types/admission";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { 
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2
} from "lucide-react";
import { CreatePaymentSheet } from "@/components/payment/CreatePaymentSheet";
import { PaymentReceiptDialog } from "@/components/payment/PaymentReceiptDialog";
import { getDefaultAdmissionFeeBreakdown } from "@/lib/payment/payment.utils";
import { fetchPaymentsByApplicationIdAction } from "@/actions/payment/paymentActions";
import type { Payment } from "@/types/payment";

interface Step4PaymentProps {
  application: Application;
  onPaymentRecorded?: () => void;
}

export function Step4Payment({ application, onPaymentRecorded }: Step4PaymentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<Payment | null>(null);
  const [existingPayments, setExistingPayments] = useState<Payment[]>([]);

  const isLocked = application.locked;
  // Check if payment is recorded by checking the payment records from Payments sheet
  const isPaymentRecorded = 
    paymentRecord?.paymentStatus === "paid" || 
    existingPayments.some(p => p.paymentStatus === "paid");

  // Fetch existing payments on mount
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const result = await fetchPaymentsByApplicationIdAction(application.id);
        if (result.success && result.payments.length > 0) {
          setExistingPayments(result.payments);
          setPaymentRecord(result.payments[0]);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchPayments();
  }, [application.id]);

  const handleViewReceipt = async () => {
    if (paymentRecord) {
      setShowReceiptDialog(true);
    } else {
      // Try to fetch payment again
      try {
        const result = await fetchPaymentsByApplicationIdAction(application.id);
        if (result.success && result.payments.length > 0) {
          setPaymentRecord(result.payments[0]);
          setShowReceiptDialog(true);
        } else {
          toast.error('Payment receipt not found');
        }
      } catch (error) {
        toast.error('Failed to load payment receipt');
      }
    }
  };

  const handlePaymentSuccess = (paymentId: string, paymentLink?: string) => {
    toast.success('Payment created successfully!', {
      description: paymentLink ? 'Payment link has been generated and sent.' : 'Payment recorded.',
    });
    
    // Refresh payments
    fetchPaymentsByApplicationIdAction(application.id).then((result) => {
      if (result.success && result.payments.length > 0) {
        setExistingPayments(result.payments);
        setPaymentRecord(result.payments[0]);
      }
    });
    
    router.refresh();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Payment Status Banner */}
        {isPaymentRecorded && paymentRecord && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-600">Payment Completed</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: <strong>₹{paymentRecord.totalAmount.toLocaleString('en-IN')}</strong>
                      {paymentRecord.razorpayPaymentId && (
                        <> • Payment ID: <strong>{paymentRecord.razorpayPaymentId}</strong></>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleViewReceipt}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Creation Section */}
        {!isLocked && !isPaymentRecorded && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Record Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a payment record with fee breakdown and generate a Razorpay payment link
                for the student, or record a manual payment.
              </p>

              <Button
                onClick={() => setShowPaymentSheet(true)}
                size="lg"
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Create Payment
              </Button>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Enter fee breakdown and student details</li>
                  <li>• Generate Razorpay payment link (or record manual payment)</li>
                  <li>• Payment link will be sent to student's email</li>
                  <li>• Professional receipt generated automatically</li>
                  <li>• Payment tracked in Google Sheets</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue to Next Step */}
        {isPaymentRecorded && !isLocked && (
          <div className="flex justify-end">
            <Button onClick={onPaymentRecorded} size="lg">
              Continue to Final Step →
            </Button>
          </div>
        )}

        {/* Locked Message */}
        {isLocked && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                This application is locked. Payment details cannot be modified.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Creation Sheet */}
      <CreatePaymentSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        paymentType="admission"
        paymentContext="admission"
        contextData={{
          studentName: application.personalDetails.fullName,
          fatherName: application.personalDetails.guardianName,
          email: application.personalDetails.email,
          mobile: application.personalDetails.mobileNumber,
          course: application.academicDetails.course,
          branch: application.academicDetails.branch,
          applicationId: application.id,
        }}
        defaultFeeBreakdown={getDefaultAdmissionFeeBreakdown(
          application.academicDetails.course, 
          application.academicDetails.branch
        )}
        createdBy={session?.user?.email || 'system'}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payment Receipt Dialog */}
      <PaymentReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        payment={paymentRecord}
      />
    </>
  );
}
