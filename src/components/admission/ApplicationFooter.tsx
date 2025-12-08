/**
 * Application Footer Component
 * Navigation buttons for multi-step form
 */

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationFooterProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave?: () => void;
  isLocked?: boolean;
  isNextDisabled?: boolean;
  nextLabel?: string;
  showSave?: boolean;
}

export function ApplicationFooter({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  isLocked = false,
  isNextDisabled = false,
  nextLabel,
  showSave = true,
}: ApplicationFooterProps) {
  const isPreviousDisabled = currentStep === 1 || isLocked;
  const isLastStep = currentStep === totalSteps;

  const defaultNextLabel = isLastStep ? "Complete & Lock" : "Next Step";

  return (
    <div className={cn(
      "flex items-center justify-between mt-8 pt-4 border-t",
      isLocked && "opacity-60 pointer-events-none"
    )}>
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous Step
      </Button>

      <div className="flex gap-2">
        {showSave && !isLocked && onSave && (
          <Button variant="secondary" onClick={onSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={isNextDisabled || isLocked}
          className="gap-2"
        >
          {nextLabel || defaultNextLabel}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
