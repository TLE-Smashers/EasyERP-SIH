/**
 * Step 5: Complete & Lock
 * Final review and completion of admission process
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/types/admission";
import { completeAdmission } from "@/actions/admission/completeAdmission";
import { fetchPaymentsByApplicationIdAction } from "@/actions/payment/paymentActions";
import { formatDateForDisplay, formatDateTimeForDisplay } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { Payment } from "@/types/payment";
import { 
  Loader2, 
  Lock,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  CreditCard,
  FileCheck,
  PartyPopper,
  Printer,
  Eye,
} from "lucide-react";

interface Step5CompleteProps {
  application: Application;
}

export function Step5Complete({ application }: Step5CompleteProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isPaymentReceived, setIsPaymentReceived] = useState(false);

  // Check payment status from Payments sheet
  useEffect(() => {
    const checkPayment = async () => {
      try {
        const result = await fetchPaymentsByApplicationIdAction(application.id);
        if (result.success && result.payments.length > 0) {
          const hasPaidPayment = result.payments.some((p: Payment) => p.paymentStatus === "paid");
          setIsPaymentReceived(hasPaidPayment);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    };
    
    checkPayment();
  }, [application.id]);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    const result = await completeAdmission(application.id, {
      finalRemarks: "",
    });

    setIsCompleting(false);

    if (result.success) {
      toast.success("Admission completed successfully! Student will receive confirmation email.");
      setShowSuccessScreen(true);
    } else {
      toast.error(result.error || "Failed to complete admission");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewFullApplication = () => {
    router.push(`/dashboard/admission/application-form-preview/${application.id}`);
  };

  const isLocked = application.locked;
  
  // Check if all previous steps are completed
  const isDocsVerified = application.documentsVerified;
  const canComplete = isDocsVerified && isPaymentReceived && !isLocked;

  // Show success screen if locked OR if completion was just triggered
  if (isLocked || showSuccessScreen) {
    return (
      <div className="space-y-6">
        {/* Success Banner with Animation */}
        <Card className="border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
                  <div className="relative bg-green-500 text-white rounded-full p-6">
                    <PartyPopper className="h-12 w-12" />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 Admission Completed!
                </h2>
                <p className="text-lg text-muted-foreground">
                  The admission process has been successfully completed and locked.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Details Summary */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.personalDetails.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.personalDetails.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mobile</p>
                <p className="font-medium">{application.personalDetails.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Application ID</p>
                <p className="font-medium">{application.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Assignment */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{application.academicDetails.course}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{application.academicDetails.branch}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Final Remarks</p>
                <p className="font-medium">
                  {application.completionDetails?.finalRemarks || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completion Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Documents Verified</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Payment Received</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {isPaymentReceived ? "Paid" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Application Locked</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>
            </div>

            {application.lockedBy && application.lockedDate && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Locked by <strong>{application.lockedBy}</strong> on{" "}
                  {formatDateTimeForDisplay(application.lockedDate)}
                </p>
              </div>
            )}

            {application.completionDetails?.finalRemarks && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Final Remarks:</p>
                <p className="text-sm">{application.completionDetails.finalRemarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Actions */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">What's next?</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={handleViewFullApplication}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Full Application
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Application
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Notification Status */}
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            📧 A confirmation email has been sent to <strong>{application.personalDetails.email}</strong> with
            all the admission details including reporting date, assigned batch, and section.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Locked Banner */}
      {isLocked && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            This application is completed and locked. Locked by{" "}
            <strong>{application.lockedBy}</strong> on{" "}
            {formatDateForDisplay(application.lockedDate!)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Completion Summary */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">🎓 Application Summary</h3>
          
          <div className="space-y-4">
            {/* Student Info */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{application.personalDetails.fullName}</p>
                <p className="text-sm text-muted-foreground">{application.personalDetails.email}</p>
                <p className="text-sm text-muted-foreground">{application.personalDetails.mobileNumber}</p>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{application.academicDetails.course}</p>
                <p className="text-sm text-muted-foreground">{application.academicDetails.branch}</p>
              </div>
            </div>

            {/* Document Status */}
            <div className="flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Documents</p>
                {isDocsVerified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Payment</p>
                {isPaymentReceived ? (
                  <>
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Received
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Payment: {isPaymentReceived ? "Completed" : "Pending"}
                    </p>
                  </>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Not Received
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites Check */}
      {/* Prerequisites Check */}
      {!canComplete && !isLocked && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cannot complete admission:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {!isDocsVerified && <li>Documents not verified</li>}
              {!isPaymentReceived && <li>Payment not received</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Complete Button */}
      {canComplete && !isLocked && (
        <>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Completing this application will lock it and prevent
              further modifications. The student will receive a confirmation email.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              size="lg"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Complete & Lock Application
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
