/**
 * Faculty Leave Application Page
 * Allows faculty to apply for leave
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Calendar, Clock, FileText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveApplicationForm } from "@/components/faculty/LeaveApplicationForm";
import { LeaveRequestsList } from "@/components/faculty/LeaveRequestsList";
import { LeaveBalanceCard } from "@/components/faculty/LeaveBalanceCard";
import { getFacultyLeaveBalance, getFacultyLeaveRequests } from "@/actions/faculty/leaveActions";

export const metadata: Metadata = {
    title: "Apply Leave | Faculty Portal",
    description: "Apply for leave and view leave requests",
};

export default async function FacultyLeavePage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "faculty") {
        redirect("/login");
    }

    // In a real application, you would fetch faculty details from the database
    const facultyDetails = {
        id: session.user.id,
        name: session.user.name || "Faculty Name",
        employeeId: "FAC001", // This should come from database
        department: "Computer Science", // This should come from database
    };

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Fetch leave balance
    const balanceResult = await getFacultyLeaveBalance(facultyDetails.id, academicYear);
    const leaveBalance = balanceResult.success ? balanceResult.data : null;

    // Fetch leave requests
    const requestsResult = await getFacultyLeaveRequests(facultyDetails.id);
    const leaveRequests = requestsResult.success ? requestsResult.data : [];

    return (
        <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <p className="text-muted-foreground mt-1">
                    Apply for leave and manage your leave requests
                </p>
            </div>

            {/* Leave Balance Summary */}
            <LeaveBalanceCard balance={leaveBalance ?? null} />

            {/* Main Content */}
            <Tabs defaultValue="apply" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="apply">
                        <FileText className="mr-2 h-4 w-4" />
                        Apply Leave
                    </TabsTrigger>
                    <TabsTrigger value="requests">
                        <Clock className="mr-2 h-4 w-4" />
                        My Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="apply" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apply for Leave</CardTitle>
                            <CardDescription>
                                Submit a new leave request for approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveApplicationForm
                                facultyEmail={facultyDetails.id}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Leave Requests</CardTitle>
                            <CardDescription>
                                View and manage your submitted leave requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LeaveRequestsList requests={leaveRequests || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
