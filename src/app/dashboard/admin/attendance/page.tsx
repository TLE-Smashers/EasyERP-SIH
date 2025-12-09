/**
 * Admin Attendance Approval Page
 * View and approve pending attendance records
 */

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPendingApprovals, bulkApproveAll, autoApproveAttendance } from "@/actions/attendance/autoApprove";
import { BulkApproveButton } from "@/components/attendance/BulkApproveButton";

export const metadata: Metadata = {
    title: "Attendance Approvals | Admin",
    description: "Review and approve pending attendance records",
};

export default async function AdminAttendanceApprovalsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login");
    }

    // Fetch pending approvals
    const pendingResult = await getPendingApprovals();
    const pendingRecords = pendingResult.success ? pendingResult.data : [];
    const pendingCount = pendingResult.count;

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Approvals</h1>
                    <p className="text-muted-foreground">
                        Review and approve pending attendance records
                    </p>
                </div>
                <Badge variant="destructive" className="text-lg px-4 py-2">
                    {pendingCount} Pending
                </Badge>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Auto-Approve Safe Records
                        </CardTitle>
                        <CardDescription>
                            Automatically approve records with minor issues (GPS accuracy, etc.)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BulkApproveButton 
                            action="auto" 
                            adminId={session.user.id}
                            buttonText="Run Auto-Approval"
                            buttonVariant="default"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Approve All Records
                        </CardTitle>
                        <CardDescription>
                            Bulk approve all pending records (use cautiously)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BulkApproveButton 
                            action="bulk" 
                            adminId={session.user.id}
                            buttonText="Approve All"
                            buttonVariant="destructive"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Pending Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approval Records ({pendingCount})</CardTitle>
                    <CardDescription>
                        Records flagged for manual review
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-green-700 mb-2">
                                All Clear!
                            </h3>
                            <p className="text-gray-600">
                                No pending attendance records require approval.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRecords.slice(0, 10).map((record) => (
                                <div 
                                    key={record.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold">{record.facultyName}</h4>
                                                <Badge variant="outline">{record.employeeId}</Badge>
                                                <Badge variant="secondary">{record.department}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                                                <div>
                                                    <span className="font-medium">Date:</span> {record.date}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Check-in:</span>{" "}
                                                    {record.checkInTime 
                                                        ? new Date(record.checkInTime).toLocaleTimeString()
                                                        : "N/A"}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Status:</span>{" "}
                                                    <Badge variant={record.isLate ? "destructive" : "default"}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                                {record.isLate && (
                                                    <div>
                                                        <span className="font-medium">Late by:</span>{" "}
                                                        {record.lateByMinutes} minutes
                                                    </div>
                                                )}
                                            </div>
                                            {record.flags && record.flags.length > 0 && (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-medium text-red-600">Flags:</span>
                                                    {record.flags.map((flag, idx) => (
                                                        <Badge key={idx} variant="destructive" className="text-xs">
                                                            {flag.replace(/_/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingRecords.length > 10 && (
                                <p className="text-center text-gray-500 pt-4">
                                    Showing 10 of {pendingRecords.length} records. Use bulk actions above to approve all.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">How to Handle Approvals</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <p>
                        <strong>Auto-Approve:</strong> Automatically approves records with only minor issues like low GPS accuracy (common indoors) or device changes.
                    </p>
                    <p>
                        <strong>Approve All:</strong> Bulk approves all pending records including those with critical flags. Use this for testing or when you trust all records.
                    </p>
                    <p>
                        <strong>Flags Explained:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>low_gps_accuracy:</strong> GPS accuracy below threshold (common indoors)</li>
                        <li><strong>outside_geofence:</strong> Location outside campus boundary</li>
                        <li><strong>different_device:</strong> Different device used than previously</li>
                        <li><strong>outside_time_window:</strong> Marked outside allowed time window</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
