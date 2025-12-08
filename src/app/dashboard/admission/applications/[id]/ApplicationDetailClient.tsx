/**
 * Application Detail Client Component
 * Handles client-side step navigation and rendering
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Application } from "@/types/admission";
import { ApplicationHeader } from "@/components/admission/ApplicationHeader";
import { ApplicationStepper } from "@/components/admission/ApplicationStepper";
import { ApplicationFooter } from "@/components/admission/ApplicationFooter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { toast } from "sonner";

// Step components
import { Step1PersonalInfo } from "./steps/Step1PersonalInfo";
import { Step2AcademicDetails } from "./steps/Step2AcademicDetails";
import { Step3DocumentReview } from "./steps/Step3DocumentReview";
import { Step4Payment } from "./steps/Step4Payment";
import { Step5Complete } from "./steps/Step5Complete";

interface ApplicationDetailClientProps {
  application: Application;
  currentStep: number;
  paymentStatus?: string;
}

export function ApplicationDetailClient({
  application,
  currentStep,
  paymentStatus,
}: ApplicationDetailClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Show payment success toast
  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment Successful! 🎉', {
        description: 'Your payment has been confirmed. Please complete the final step.',
        duration: 5000,
      });
      
      // Remove payment status from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      router.replace(url.pathname + url.search);
    } else if (paymentStatus === 'failed') {
      toast.error('Payment Failed', {
        description: 'The payment was not completed. Please try again.',
        duration: 5000,
      });
      
      // Remove payment status from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      router.replace(url.pathname + url.search);
    }
  }, [paymentStatus, router]);

  const goToStep = (step: number) => {
    router.push(`/dashboard/admission/applications/${application.id}?step=${step}`);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      goToStep(currentStep + 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Auto-save functionality will be handled by individual step components
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo application={application} />;
      case 2:
        return <Step2AcademicDetails application={application} />;
      case 3:
        return <Step3DocumentReview application={application} onVerified={handleNext} />;
      case 4:
        return <Step4Payment application={application} onPaymentRecorded={handleNext} />;
      case 5:
        return <Step5Complete application={application} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-8">
      {/* Header */}
      <ApplicationHeader
        applicationId={application.id}
        status={application.applicationStatus}
        submissionDate={application.timestamp}
        studentName={application.personalDetails.fullName}
      />

      {/* Stepper */}
      <ApplicationStepper
        currentStep={currentStep}
        applicationStatus={application.applicationStatus}
        locked={application.locked}
        onStepClick={goToStep}
      />

      {/* Locked Alert */}
      {application.locked && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            🔒 This application is locked and cannot be modified. Locked by{" "}
            <strong>{application.lockedBy}</strong> on{" "}
            {formatDateForDisplay(application.lockedDate!)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="bg-background rounded-lg border shadow-sm">
        <div className="p-6 md:p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Navigation */}
      {/* Hide footer on steps with custom navigation (Step 3, 4, 5) */}
      {currentStep !== 3 && currentStep !== 4 && currentStep !== 5 && (
        <ApplicationFooter
          currentStep={currentStep}
          totalSteps={5}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={handleSave}
          isLocked={application.locked}
          showSave={currentStep <= 2} // Only show save on editable steps
        />
      )}
    </div>
  );
}
