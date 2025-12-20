/**
 * Faculty Individual Leave Balance Page
 * View personal leave balance details
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LeaveBalanceCard } from "@/components/faculty/LeaveBalanceCard";
import { getFacultyLeaveBalance } from "@/actions/faculty/leaveActions";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
    title: "My Leave Balance | Faculty Portal",
    description: "View your leave balance details",
};

export default async function MyLeaveBalancePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "faculty") {
        redirect("/login");
    }

    // Fetch faculty details
    const facultyRecord = await getFacultyByEmail(session.user.email!);

    if (!facultyRecord) {
        redirect("/login");
    }

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Fetch leave balance
    const balanceResult = await getFacultyLeaveBalance(facultyRecord.id, academicYear);
    const leaveBalance = balanceResult.success ? balanceResult.data : null;

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            <PageHeader
                title="My Leave Balance"
                description={`Academic Year ${academicYear}`}
                backLabel="Back to Leave"
                backHref="/dashboard/faculty/leave"
            />

            {/* Main Balance Card */}
            <LeaveBalanceCard balance={leaveBalance ?? null} />

            {/* Detailed Breakdown */}
            {leaveBalance && (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Casual Leave */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Casual Leave</CardTitle>
                            <CardDescription>For personal reasons and planned activities</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className="font-medium">
                                        {leaveBalance.casualLeave.used} / {leaveBalance.casualLeave.allocated}
                                    </span>
                                </div>
                                <Progress
                                    value={(leaveBalance.casualLeave.used / leaveBalance.casualLeave.allocated) * 100}
                                    className="h-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {leaveBalance.casualLeave.allocated}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Allocated</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {leaveBalance.casualLeave.used}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Used</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {leaveBalance.casualLeave.remaining}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Remaining</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sick Leave */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sick Leave</CardTitle>
                            <CardDescription>For illness and medical appointments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className="font-medium">
                                        {leaveBalance.sickLeave.used} / {leaveBalance.sickLeave.allocated}
                                    </span>
                                </div>
                                <Progress
                                    value={(leaveBalance.sickLeave.used / leaveBalance.sickLeave.allocated) * 100}
                                    className="h-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {leaveBalance.sickLeave.allocated}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Allocated</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {leaveBalance.sickLeave.used}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Used</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {leaveBalance.sickLeave.remaining}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Remaining</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Earned Leave */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Earned Leave</CardTitle>
                            <CardDescription>Accumulated leave for vacation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Used</span>
                                    <span className="font-medium">
                                        {leaveBalance.earnedLeave.used} / {leaveBalance.earnedLeave.allocated}
                                    </span>
                                </div>
                                <Progress
                                    value={(leaveBalance.earnedLeave.used / leaveBalance.earnedLeave.allocated) * 100}
                                    className="h-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {leaveBalance.earnedLeave.allocated}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Allocated</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {leaveBalance.earnedLeave.used}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Used</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {leaveBalance.earnedLeave.remaining}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Remaining</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!leaveBalance && (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">
                            No leave balance found for the current academic year.
                            <br />
                            Please contact the administrator to initialize your leave balance.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
