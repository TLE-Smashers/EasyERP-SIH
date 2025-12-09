/**
 * Admin Leave Balance Management Page
 * View and manage leave balances for all faculty
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Users, TrendingUp, Calendar } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LeaveBalanceTable } from "@/components/faculty/LeaveBalanceTable";
import { getFaculty } from "@/actions/faculty/getFaculty";

export const metadata: Metadata = {
    title: "Leave Balance | Admin",
    description: "View and manage faculty leave balances",
};

export default async function LeaveBalancePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    // Fetch all faculty
    const facultyList = await getFaculty();
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            <PageHeader
                title="Faculty Leave Balance"
                description="View and manage leave balances for all faculty members"
            />

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{facultyList.length}</div>
                        <p className="text-xs text-muted-foreground">Active members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{academicYear}</div>
                        <p className="text-xs text-muted-foreground">Current period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Casual, Sick, Earned</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Balance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Balance Overview</CardTitle>
                    <CardDescription>
                        View leave balance details for all faculty members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaveBalanceTable facultyList={facultyList} academicYear={academicYear} />
                </CardContent>
            </Card>
        </div>
    );
}
