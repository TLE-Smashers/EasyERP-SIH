/**
 * Faculty Personal Attendance Page
 * View personal attendance records and monthly reports
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Calendar, TrendingUp, Camera } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyAttendanceCalendar } from "@/components/faculty/MyAttendanceCalendar";
import { MonthlyAttendanceSummary } from "@/components/faculty/MonthlyAttendanceSummary";
import { AttendanceHistory } from "@/components/faculty/AttendanceHistory";
import { getFacultyAttendance, getMonthlyAttendance } from "@/actions/faculty/attendanceActions";

export const metadata: Metadata = {
    title: "My Attendance | Faculty Portal",
    description: "View your attendance records and monthly reports",
};

export default async function MyAttendancePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "faculty") {
        redirect("/login");
    }

    const facultyId = session.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Fetch attendance records
    const recordsResult = await getFacultyAttendance(facultyId);
    const allRecords = recordsResult.success ? recordsResult.data : [];

    // Fetch monthly summary
    const summaryResult = await getMonthlyAttendance(facultyId, currentMonth);
    const monthlySummary = summaryResult.success ? summaryResult.data : null;

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
                    <p className="text-muted-foreground mt-1">
                        View your attendance records and performance
                    </p>
                </div>
                <Link href="/faculty/attendance">
                    <Button size="lg" className="gap-2">
                        <Camera className="h-5 w-5" />
                        📸 Mark Attendance
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Monthly Summary
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Attendance Calendar</CardTitle>
                                <CardDescription>
                                    Your attendance records displayed in calendar format
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MyAttendanceCalendar records={allRecords || []} currentMonth={new Date()} />
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Recent Attendance</CardTitle>
                                <CardDescription>
                                    Your recent attendance records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AttendanceHistory records={allRecords || []} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Attendance Summary</CardTitle>
                            <CardDescription>
                                Detailed monthly attendance report and statistics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthlySummary ? (
                                <MonthlyAttendanceSummary summary={monthlySummary} />
                            ) : (
                                <p className="text-muted-foreground">No attendance data for this month</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
