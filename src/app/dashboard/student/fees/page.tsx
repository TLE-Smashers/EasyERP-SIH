"use client";

import * as React from "react";
import {
  Wallet,
  Calendar,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentProfile } from "@/hooks/use-student-profile";
import { CreatePaymentSheet } from "@/components/payment/CreatePaymentSheet";
import { fetchStudentPaymentPeriodsAction, fetchAllPeriodsAction } from "@/actions/paymentPeriod/paymentPeriodActions";
import { useSession } from "next-auth/react";
import type { PaymentPeriod } from "@/types/paymentPeriod";



export default function StudentFeeStatusPage() {
  const { student, isLoading, error } = useStudentProfile();
  const { data: session } = useSession();
  const [paymentPeriods, setPaymentPeriods] = React.useState<PaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = React.useState(true);
  const [showPaymentSheet, setShowPaymentSheet] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState<PaymentPeriod | null>(null);

  // Fetch active payment periods
  React.useEffect(() => {
    const fetchPeriods = async () => {
      // Wait for student profile loading to complete
      if (isLoading) return;
      
      try {
        // If student profile exists, fetch targeted periods
        if (student?.academicInfo?.course && student?.academicInfo?.branch) {
          const result = await fetchStudentPaymentPeriodsAction(
            student.academicInfo.course,
            student.academicInfo.branch,
            student.academicInfo.year || 1
          );
          
          if (result.success) {
            setPaymentPeriods(result.periods || []);
          }
        } else {
          // If no student profile, fetch ALL periods and filter for enabled ones
          const result = await fetchAllPeriodsAction();
          
          if (result.success) {
            // Filter for enabled periods only
            const now = new Date();
            const activePeriods = (result.periods || []).filter((period) => {
              if (period.status !== 'enabled') return false;
              const startDate = new Date(period.startDate);
              const endDate = new Date(period.endDate);
              return now >= startDate && now <= endDate;
            });
            setPaymentPeriods(activePeriods);
          }
        }
      } catch (error) {
        console.error('Error fetching payment periods:', error);
      } finally {
        setLoadingPeriods(false);
      }
    };

    fetchPeriods();
  }, [student, isLoading]);



  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  // Don't block the page if student profile is not found - payment periods can still be shown
  // We'll just not show the CreatePaymentSheet which requires full student profile

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Status</h1>
        <p className="text-muted-foreground">
          Real-time snapshot of your academic dues and payments
        </p>
      </div>

      {/* Profile Warning */}
      {!student && !isLoading && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                  Profile Not Found
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
                  {error || "Your student profile is not set up yet. You can view available payment periods below, but you'll need to complete your profile to make payments. Please contact the accounts team."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Payment Periods */}
      {!loadingPeriods && paymentPeriods.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Available Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paymentPeriods.map((period) => {
                const daysLeft = Math.ceil(
                  (new Date(period.endDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={period.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="capitalize mb-2">
                            {period.type}
                          </Badge>
                          <CardTitle className="text-lg">{period.title}</CardTitle>
                        </div>
                      </div>
                      {period.description && (
                        <p className="text-sm text-muted-foreground">
                          {period.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <span className="text-2xl font-bold">
                            ₹{period.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Academic Year: {period.academicYear}</span>
                          {period.semester && <span>Semester: {period.semester}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          Due: {new Date(period.endDate).toLocaleDateString('en-IN')}
                          {daysLeft > 0 && ` (${daysLeft} days left)`}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedPeriod(period);
                          setShowPaymentSheet(true);
                        }}
                      >
                        Pay Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingPeriods && paymentPeriods.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active payment periods available at the moment</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Sheet */}
      {selectedPeriod && (
        <CreatePaymentSheet
          open={showPaymentSheet}
          onOpenChange={setShowPaymentSheet}
          paymentType={selectedPeriod.type as any}
          paymentContext="admission"
          defaultFeeBreakdown={{
            tuitionFee: selectedPeriod.tuitionFee,
            amalgamatedFund: selectedPeriod.amalgamatedFund,
            sportsFeeUniversityShare: selectedPeriod.sportsFee,
            cautionMoney: selectedPeriod.cautionMoney,
            transferCertificateFee: selectedPeriod.transferCertificateFee,
            libraryCardReissueFee: selectedPeriod.libraryCardReissueFee,
            penaltyFee: selectedPeriod.penaltyFee,
            otherFees: selectedPeriod.otherFees,
            transactionCharges: selectedPeriod.transactionCharges,
          }}
          contextData={{
            studentName: student?.personalInfo?.fullName || session?.user?.name || '',
            fatherName: student?.personalInfo?.guardianName || '',
            email: student?.personalInfo?.email || session?.user?.email || '',
            mobile: student?.personalInfo?.mobileNumber || '',
            rollNumber: student?.academicInfo?.rollNumber || '',
            course: student?.academicInfo?.course || '',
            branch: student?.academicInfo?.branch || '',
            category: 'General',
            academicYear: selectedPeriod.academicYear,
            semester: selectedPeriod.semester,
            periodId: selectedPeriod.id,
            studentId: student?.academicInfo?.studentId || '',
          }}
          createdBy={session?.user?.email || 'student'}
          onSuccess={() => {
            setShowPaymentSheet(false);
            setSelectedPeriod(null);
          }}
        />
      )}
    </div>
  );
}

