import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CreatePaymentSheet } from "@/components/payment/CreatePaymentSheet";
import { PaymentReceiptDialog } from "@/components/payment/PaymentReceiptDialog";
import { HostelApplication } from "@/types/hostel";
import type { Payment } from "@/types/payment";


interface HostelPaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  application: HostelApplication | null;
  onPaymentSuccess: () => void;
}

export function HostelPaymentDrawer({ open, onClose, application, onPaymentSuccess }: HostelPaymentDrawerProps) {
  // All hooks at the top
  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [payment, setPayment] = React.useState<Payment | null>(null);

  // Fallback UI if no application is provided
  if (!application) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b">
            <SheetHeader className="space-y-3">
              <SheetTitle className="text-2xl font-bold">Hostel Payment Details</SheetTitle>
              <SheetDescription className="text-base">
                Review and generate payment link for hostel allocation
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="text-center text-muted-foreground py-12">No application selected.</div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Main drawer UI when application is present
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b">
          <SheetHeader className="space-y-3">
            <SheetTitle className="text-2xl font-bold">Hostel Payment Details</SheetTitle>
            <SheetDescription className="text-base">
              Review and generate payment link for hostel allocation
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* Hostel Application Info */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-2">
              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Student ID</div>
                  <div className="font-semibold">{application.studentId}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Name</div>
                  <div className="font-semibold">{application.fullName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Email</div>
                  <div className="font-semibold">{application.email}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Contact</div>
                  <div className="font-semibold">{application.contactNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Gender</div>
                  <div className="font-semibold capitalize">{application.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Category</div>
                  <div className="font-semibold">{application.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Room</div>
                  <div className="font-semibold">{application.roomNumber || '-'}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Payment Sheet for Hostel */}
          <CreatePaymentSheet
            open={open}
            onOpenChange={onClose}
            paymentType="hostel"
            paymentContext="hostel"
            contextData={application}
            createdBy={application?.email || "system"}
            onSuccess={() => {
              onPaymentSuccess();
            }}
          />
        </div>
        <div className="h-6" />
      </SheetContent>
    </Sheet>
  );
}
