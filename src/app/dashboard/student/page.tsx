"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  Bell,
  ArrowRight,
  GraduationCap,
  Clock,
  Award,
  FileText,
  CreditCard,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getStudentAttendanceByEmail } from "@/actions/student/getStudentAttendance";
import { getStudentExamScores } from "@/actions/student/getStudentExamScores";
import { fetchStudentPaymentPeriodsAction } from "@/actions/paymentPeriod/paymentPeriodActions";
import { getStudentProfileByEmail } from "@/actions/student/getStudentProfile";
import type { PaymentPeriod } from "@/types/paymentPeriod";
import JobReferralNotices from "@/components/job-referral-notices";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [attendancePercentage, setAttendancePercentage] = React.useState<number | null>(null);
  const [averagePercentage, setAveragePercentage] = React.useState<number | null>(null);
  const [paymentPeriods, setPaymentPeriods] = React.useState<PaymentPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    loadAttendance();
    loadResults();
    loadPaymentPeriods();
  }, [session]);

  async function loadAttendance() {
    if (!session?.user?.email) return;

    try {
      const result = await getStudentAttendanceByEmail(session.user.email);
      if (result.success && result.data) {
        setAttendancePercentage(result.data.overallPercentage);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  }

  async function loadResults() {
    if (!session?.user?.email) return;

    try {
      const result = await getStudentExamScores(session.user.email);
      if (result.success && result.data) {
        setAveragePercentage(result.data.overallStats.averagePercentage);
      }
    } catch (error) {
      console.error("Error loading results:", error);
    }
  }

  async function loadPaymentPeriods() {
    if (!session?.user?.email) return;
    
    try {
      // Get student profile first
      const profileResult = await getStudentProfileByEmail(session.user.email);
      if (!profileResult.success || !profileResult.data) {
        setLoadingPeriods(false);
        return;
      }

      const student = profileResult.data;
      
      // Fetch payment periods
      const result = await fetchStudentPaymentPeriodsAction(
        student.course || '',
        student.branch || '',
        student.currentYear || 1
      );
      
      if (result.success) {
        setPaymentPeriods(result.periods || []);
      }
    } catch (error) {
      console.error('Error loading payment periods:', error);
    } finally {
      setLoadingPeriods(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title={`Welcome back, ${session?.user?.name || "Student"}!`}
          description="Here's what's happening with your academics today"
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Attendance</CardTitle>
              <div className="h-12 w-12 rounded-full bg-blue-100/10 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold">
                {attendancePercentage !== null ? `${attendancePercentage}%` : "-"}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Overall attendance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Upcoming Exams</CardTitle>
              <div className="h-12 w-12 rounded-full bg-green-100/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold">3</div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Next 2 weeks
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Library Books</CardTitle>
              <div className="h-12 w-12 rounded-full bg-purple-100/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold">2</div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Currently issued
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">New Notices</CardTitle>
              <div className="h-12 w-12 rounded-full bg-orange-100/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold">5</div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Unread notices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Periods Section */}
        {!loadingPeriods && paymentPeriods.length > 0 && (
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pay Your Fees</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {paymentPeriods.length} payment {paymentPeriods.length === 1 ? 'option' : 'options'} available
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/student/fees">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paymentPeriods.slice(0, 3).map((period) => {
                  const daysLeft = Math.ceil(
                    (new Date(period.endDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysLeft <= 7 && daysLeft > 0;
                  const isExpiringSoon = daysLeft <= 14 && daysLeft > 7;

                  return (
                    <Card 
                      key={period.id} 
                      className={`border-2 hover:shadow-lg transition-all ${
                        isUrgent ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' :
                        isExpiringSoon ? 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' :
                        'border-primary/30'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge 
                            variant="outline" 
                            className="capitalize"
                          >
                            {period.type}
                          </Badge>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {isExpiringSoon && !isUrgent && (
                            <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                              Soon
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-1">
                          {period.title}
                        </CardTitle>
                        {period.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {period.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-muted-foreground">Amount</span>
                          <span className="text-xl font-bold text-primary">
                            ₹{period.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Due: {new Date(period.endDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {daysLeft > 0 && (
                          <div className={`text-xs font-medium ${
                            isUrgent ? 'text-red-600 dark:text-red-400' :
                            isExpiringSoon ? 'text-orange-600 dark:text-orange-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                          </div>
                        )}

                        <Button 
                          className="w-full mt-2" 
                          size="sm"
                          variant={isUrgent ? "destructive" : "default"}
                          asChild
                        >
                          <Link href="/dashboard/student/fees">
                            <Wallet className="mr-2 h-4 w-4" />
                            Pay Now
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {paymentPeriods.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/student/fees">
                      View All {paymentPeriods.length} Payment Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Exams Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Upcoming Exams</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student/exams">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Data Structures Mid-Term</p>
                  <p className="text-sm text-muted-foreground">CS201 • 3 hours</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Nov 25, 2025</p>
                  <p className="text-xs text-muted-foreground">10:00 AM</p>
                </div>
              </div>

              <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Database Management Quiz</p>
                  <p className="text-sm text-muted-foreground">CS301 • 1 hour</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Nov 28, 2025</p>
                  <p className="text-xs text-muted-foreground">2:00 PM</p>
                </div>
              </div>

              <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Web Development Final</p>
                  <p className="text-sm text-muted-foreground">CS401 • 3 hours</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Dec 5, 2025</p>
                  <p className="text-xs text-muted-foreground">9:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Library Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle>Library</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student/library">
                    Browse Books <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border-l-2 border-purple-500">
                <div className="space-y-1">
                  <p className="font-medium">Clean Code</p>
                  <p className="text-sm text-muted-foreground">Robert C. Martin</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium text-orange-600">Dec 7, 2025</p>
                </div>
              </div>

              <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border-l-2 border-purple-500">
                <div className="space-y-1">
                  <p className="font-medium">Design Patterns</p>
                  <p className="text-sm text-muted-foreground">Gang of Four</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium text-orange-600">Dec 10, 2025</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/student/library">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Request New Book
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Attendance Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle>Attendance</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student/attendance">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Data Structures</p>
                      <p className="text-xs text-muted-foreground">CS201</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">92%</p>
                    <p className="text-xs text-muted-foreground">23/25 classes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Database Management</p>
                      <p className="text-xs text-muted-foreground">CS301</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">88%</p>
                    <p className="text-xs text-muted-foreground">22/25 classes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Web Development</p>
                      <p className="text-xs text-muted-foreground">CS401</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">76%</p>
                    <p className="text-xs text-muted-foreground">19/25 classes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle>Exam Results</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student/results">
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Overall Average</p>
                <p className="text-3xl font-bold text-green-600">
                  {averagePercentage !== null ? `${averagePercentage}%` : "-"}
                </p>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/student/results">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Results
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Notices Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle>Recent Notices</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/student/notices">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Bell className="h-4 w-4 text-orange-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Mid-term Exam Schedule Released</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your exam timetable for November 2025
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    2 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Bell className="h-4 w-4 text-orange-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Library: New Books Added</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    50+ new technical books are now available
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    5 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Bell className="h-4 w-4 text-orange-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Fee Payment Reminder</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last date: November 30, 2025
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    1 day ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alumni Job Referrals Section */}
        <div className="space-y-4">
          <JobReferralNotices maxDisplay={100} showHeader={true} />
        </div>
      </div>
    </div>
  );
}
