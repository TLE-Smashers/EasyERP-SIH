"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, XCircle, IndianRupee, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/lib/dateUtils";
import { useSession } from "next-auth/react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  verifyApplication,
  rejectApplication,
  updateApplication,
} from "@/actions/admission/updateApplication";
import { CreatePaymentSheet } from "@/components/payment/CreatePaymentSheet";
import { PaymentReceiptDialog } from "@/components/payment/PaymentReceiptDialog";
import { getDefaultAdmissionFeeBreakdown } from "@/lib/payment/payment.service";
import { fetchPaymentsByApplicationIdAction } from "@/actions/payment/paymentActions";
import type { Application } from "./ApplicationsTable";
import type { Payment } from "@/types/payment";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  course: z.string().min(1, "Course is required"),
  status: z.enum(["pending", "documents_verified", "payment_pending", "paid", "completed", "rejected"]),
  paymentStatus: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApplicationDrawerProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ApplicationDrawer({
  application,
  open,
  onOpenChange,
  onUpdate,
}: ApplicationDrawerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = React.useState(false);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = React.useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);
  const [paymentRecord, setPaymentRecord] = React.useState<Payment | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: application.name,
      email: application.email,
      phone: application.phone,
      course: application.course,
      status: application.status,
      paymentStatus: application.paymentStatus,
    },
  });

  // Reset form when application changes
  React.useEffect(() => {
    form.reset({
      name: application.name,
      email: application.email,
      phone: application.phone,
      course: application.course,
      status: application.status,
      paymentStatus: application.paymentStatus,
    });
  }, [application, form]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      await updateApplication(`APP-${application.id}`, {
        personalDetails: {
          fullName: data.name,
          email: data.email,
          mobileNumber: data.phone,
        },
        academicDetails: {
          course: data.course,
        },
        applicationStatus: ['pending', 'documents_verified', 'completed', 'rejected'].includes(data.status)
          ? (data.status as any)
          : undefined,
        paymentStatus: data.paymentStatus && ['paid', 'unpaid'].includes(data.paymentStatus)
          ? (data.paymentStatus as 'paid' | 'unpaid')
          : undefined,
      });

      toast.success("Application updated successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update application");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify() {
    setIsLoading(true);
    try {
      await verifyApplication(application.id);
      toast.success("Application verified successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to verify application");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowVerifyDialog(false);
    }
  }

  async function handleReject() {
    setIsLoading(true);
    try {
      await rejectApplication(application.id);
      toast.error("Application rejected");
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to reject application");
      console.error(error);
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background px-6 pt-6 pb-4 border-b">
            <SheetHeader className="space-y-3">
              <SheetTitle className="text-2xl font-bold">Application Details</SheetTitle>
              <SheetDescription className="text-base">
                Review and manage applicant information and status
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Application Meta */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Application ID
                    </p>
                    <p className="text-sm font-semibold">{application.id}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted On
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDateForDisplay(application.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Personal Information
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 000-0000"
                              className="h-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Course</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Computer Science"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Application Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Application Status
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="verified">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  Verified
                                </div>
                              </SelectItem>
                              <SelectItem value="rejected">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  Rejected
                                </div>
                              </SelectItem>
                              <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                  Completed
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="paid">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                  Paid
                                </div>
                              </SelectItem>
                              <SelectItem value="failed">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-red-500" />
                                  Failed
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t mt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 font-medium"
                    size="lg"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>

                  {application.status === "pending" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="default"
                        className="h-11 font-medium"
                        onClick={() => setShowVerifyDialog(true)}
                        disabled={isLoading}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-11 font-medium"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={isLoading}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Payment Button - Show if documents verified */}
                  {application.documentsVerified && application.paymentStatus === "unpaid" && (
                    <Button
                      type="button"
                      variant="default"
                      className="h-11 font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => setShowPaymentSheet(true)}
                      disabled={isLoading}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  )}

                  {/* Payment Status Display */}
                  {application.paymentStatus === "paid" && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Payment Completed</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Admission fee has been paid successfully.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
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
                          }}
                          className="shrink-0"
                        >
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Bottom padding for scroll spacing */}
          <div className="h-6" />
        </SheetContent>
      </Sheet>

      {/* Verify Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this application? This action will mark the
              application as verified and record your information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerify} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this application? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Sheet */}
      <CreatePaymentSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        contextData={{
          applicationId: application.id,
          studentName: application.name,
          email: application.email,
          mobile: application.phone,
          course: application.course,
          branch: application.course, // You may want to add branch field to Application type
          category: 'General', // You may want to add category field to Application type
        }}
        defaultFeeBreakdown={getDefaultAdmissionFeeBreakdown(application.course, application.course)}
        paymentType="admission"
        createdBy={session?.user?.email || 'system'}
        onSuccess={(result) => {
          toast.success('Payment created successfully!', {
            description: result?.paymentLink ? 'Payment link has been generated.' : 'Payment recorded.',
          });
          router.refresh();
          onUpdate();
        }}
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
