/**
 * Application Stepper Component
 * Horizontal step indicator for multi-step application process
 */

"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  GraduationCap, 
  FileCheck, 
  CreditCard, 
  CheckCircle,
  Circle,
  CheckCircle2
} from "lucide-react";
import { ApplicationStatus } from "@/types/admission";

interface Step {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "current" | "pending";
}

interface ApplicationStepperProps {
  currentStep: number;
  applicationStatus: ApplicationStatus;
  locked: boolean;
  onStepClick?: (step: number) => void;
}

export function ApplicationStepper({
  currentStep,
  applicationStatus,
  locked,
  onStepClick,
}: ApplicationStepperProps) {
  
  // Determine step statuses based on application status
  const getStepStatus = (stepNumber: number): "completed" | "current" | "pending" => {
    if (locked && stepNumber <= 5) return "completed";
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  const steps: Step[] = [
    {
      number: 1,
      title: "Personal Info",
      icon: User,
      status: getStepStatus(1),
    },
    {
      number: 2,
      title: "Academic Details",
      icon: GraduationCap,
      status: getStepStatus(2),
    },
    {
      number: 3,
      title: "Documents",
      icon: FileCheck,
      status: getStepStatus(3),
    },
    {
      number: 4,
      title: "Payment",
      icon: CreditCard,
      status: getStepStatus(4),
    },
    {
      number: 5,
      title: "Complete",
      icon: CheckCircle,
      status: getStepStatus(5),
    },
  ];

  return (
    <div className="w-full py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between relative">
          {/* Steps */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isClickable = step.status === "completed" && !locked;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center flex-1 relative"
              >
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-1/2 top-6 w-full h-0.5 -z-10">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        step.status === "completed" 
                          ? "bg-green-500 dark:bg-green-400" 
                          : "bg-gray-300 dark:bg-gray-700"
                      )}
                    />
                  </div>
                )}

                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick?.(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-lg z-10",
                    "bg-background",
                    {
                      // Completed - Green
                      "border-green-500 bg-green-500 text-white dark:border-green-400 dark:bg-green-400": 
                        step.status === "completed",
                      // Current - Blue with ring
                      "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 ring-4 ring-blue-500/20": 
                        step.status === "current",
                      // Pending - Gray
                      "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600": 
                        step.status === "pending",
                      // Clickable hover effect
                      "cursor-pointer hover:scale-110 hover:shadow-xl": isClickable,
                      "cursor-not-allowed": !isClickable && step.status !== "current",
                    }
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </button>

                {/* Step Label */}
                <div className="flex flex-col items-center mt-3 gap-1">
                  <span
                    className={cn(
                      "text-sm font-semibold text-center whitespace-nowrap",
                      {
                        "text-blue-600 dark:text-blue-400": step.status === "current",
                        "text-green-600 dark:text-green-400": step.status === "completed",
                        "text-gray-400 dark:text-gray-600": step.status === "pending",
                      }
                    )}
                  >
                    {step.title}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      {
                        "text-blue-500 dark:text-blue-400": step.status === "current",
                        "text-green-500 dark:text-green-400": step.status === "completed",
                        "text-gray-400 dark:text-gray-600": step.status === "pending",
                      }
                    )}
                  >
                    {step.status === "completed" && "Completed"}
                    {step.status === "current" && "In Progress"}
                    {step.status === "pending" && "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked Badge */}
        {locked && (
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium border border-green-500/20 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              Application Completed & Locked
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
