/**
 * Admin Leave Management Page
 * Manage all faculty leave requests
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { CalendarCheck, CalendarX, Clock, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveRequestsTable } from "@/components/faculty/LeaveRequestsTable";
import { LeaveStatsCards } from "@/components/faculty/LeaveStatsCards";
import { getLeaveRequests } from "@/actions/faculty/leaveActions";

export const metadata: Metadata = {
    title: "Leave Management | Admin",
    description: "Manage faculty leave requests and approvals",
};

export default async function LeaveManagementPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    // Fetch all leave requests
    const requestsResult = await getLeaveRequests();
    const allRequests = requestsResult.success ? requestsResult.data : [];

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <p className="text-muted-foreground mt-1">
                    Manage faculty leave requests and approvals
                </p>
            </div>

            {/* Statistics */}
            <LeaveStatsCards requests={allRequests || []} />

            {/* Leave Requests Table */}
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">
                        <Clock className="mr-2 h-4 w-4" />
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Approved
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        <CalendarX className="mr-2 h-4 w-4" />
                        Rejected
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        <Users className="mr-2 h-4 w-4" />
                        All Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Leave Requests</CardTitle>
                            <CardDescription>
                                Review and approve or reject leave requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveRequestsTable requests={allRequests || []} filterStatus="pending" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approved">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approved Leave Requests</CardTitle>
                            <CardDescription>
                                View all approved leave requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveRequestsTable requests={allRequests || []} filterStatus="approved" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rejected">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rejected Leave Requests</CardTitle>
                            <CardDescription>
                                View all rejected leave requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveRequestsTable requests={allRequests || []} filterStatus="rejected" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Leave Requests</CardTitle>
                            <CardDescription>
                                View complete leave requests history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveRequestsTable requests={allRequests || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
