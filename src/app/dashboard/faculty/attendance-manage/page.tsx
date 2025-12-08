/**
 * Admin Attendance Management Page
 * Mark and manage faculty attendance
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Calendar, ClipboardCheck, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceMarkingForm } from "@/components/faculty/AttendanceMarkingForm";
import { AttendanceStatsCards } from "@/components/faculty/AttendanceStatsCards";
import { DailyAttendanceTable } from "@/components/faculty/DailyAttendanceTable";
import { getDailyAttendanceStats, getAttendanceByDate } from "@/actions/faculty/attendanceActions";

export const metadata: Metadata = {
    title: "Attendance Management | Admin",
    description: "Mark and manage faculty attendance",
};

export default async function AttendanceManagePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch attendance stats
    const statsResult = await getDailyAttendanceStats(today);
    const rawStats = statsResult.success ? statsResult.data : null;
    const stats = rawStats ? {
        total: rawStats.totalMarked || 0,
        present: rawStats.present || 0,
        absent: rawStats.absent || 0,
        late: rawStats.late || 0,
        onLeave: rawStats.onLeave || 0,
        halfDay: rawStats.halfDay || 0,
        wfh: rawStats.wfh || 0,
    } : { total: 0, present: 0, absent: 0, late: 0, onLeave: 0, halfDay: 0, wfh: 0 };

    // Fetch daily attendance records
    const recordsResult = await getAttendanceByDate(today);
    const records = recordsResult.success ? recordsResult.data : [];

    // Mock faculty list - in real app, fetch from database
    const facultyList = [
        { email: "faculty1@example.com", name: "Dr. John Doe", employeeId: "FAC001", department: "CS" },
        { email: "faculty2@example.com", name: "Dr. Jane Smith", employeeId: "FAC002", department: "IT" },
    ];

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
                <p className="text-muted-foreground mt-1">
                    Mark and manage daily faculty attendance
                </p>
            </div>

            {/* Statistics */}
            <AttendanceStatsCards stats={stats} />

            {/* Main Content */}
            <Tabs defaultValue="mark" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="mark">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Mark Attendance
                    </TabsTrigger>
                    <TabsTrigger value="view">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="mark" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mark Attendance</CardTitle>
                            <CardDescription>
                                Mark attendance for today or select a specific date
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceMarkingForm facultyList={facultyList} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="view" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>
                                View and edit attendance records
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyAttendanceTable records={records || []} date={today} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
