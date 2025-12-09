/**
 * Faculty Leave History Page (for individual faculty viewing their own history)
 * View complete leave request history
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LeaveRequestsList } from "@/components/faculty/LeaveRequestsList";
import { getFacultyLeaveRequests } from "@/actions/faculty/leaveActions";
import { getFacultyByEmail } from "@/actions/faculty/getFaculty";

export const metadata: Metadata = {
    title: "Leave History | Faculty Portal",
    description: "View your complete leave request history",
};

export default async function LeaveHistoryPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "faculty") {
        redirect("/login");
    }

    // Fetch faculty details
    const facultyRecord = await getFacultyByEmail(session.user.email!);

    if (!facultyRecord) {
        redirect("/login");
    }

    // Fetch leave requests
    const requestsResult = await getFacultyLeaveRequests(facultyRecord.id);
    const leaveRequests = requestsResult.success ? requestsResult.data : [];

    // Calculate statistics
    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === "pending").length,
        approved: leaveRequests.filter(r => r.status === "approved").length,
        rejected: leaveRequests.filter(r => r.status === "rejected").length,
        cancelled: leaveRequests.filter(r => r.status === "cancelled").length,
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            <PageHeader
                title="My Leave History"
                description="View your complete leave request history and status"
                backLabel="Back to Leave"
                backHref="/dashboard/faculty/leave"
            />

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Leave History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Leave Requests</CardTitle>
                    <CardDescription>
                        Complete history of your leave requests with status and details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaveRequestsList requests={leaveRequests} showAllColumns={true} />
                </CardContent>
            </Card>
        </div>
    );
}
