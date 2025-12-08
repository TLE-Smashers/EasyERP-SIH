"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import { format } from "date-fns";
import { Check, X, Eye, Loader2, Calendar, Clock, FileText } from "lucide-react";
import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/faculty/leaveActions";
import { toast } from "sonner";

interface LeaveRequestsTableProps {
    requests: LeaveRequest[];
    filterStatus?: LeaveStatus | "All";
}

export function LeaveRequestsTable({ requests, filterStatus = "All" }: LeaveRequestsTableProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const filteredRequests = filterStatus === "All"
        ? requests
        : requests.filter(r => r.status === filterStatus);

    const getStatusBadge = (status: LeaveStatus) => {
        const variants: Record<LeaveStatus, "default" | "secondary" | "destructive" | "outline"> = {
            "pending": "secondary",
            "approved": "default",
            "rejected": "destructive",
            "cancelled": "outline",
        };

        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    const handleApprove = async (request: LeaveRequest) => {
        setProcessingId(request.id);
        try {
            const result = await approveLeaveRequest(request.id, request.facultyId);

            if (result.success) {
                toast.success(`Leave request for ${request.facultyName} has been approved`);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to approve leave request");
            }
        } catch (error) {
            console.error("Approve error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setProcessingId(selectedRequest.id);
        try {
            const result = await rejectLeaveRequest(selectedRequest.id, "Admin", rejectionReason);

            if (result.success) {
                toast.success(`Leave request for ${selectedRequest.facultyName} has been rejected`);
                setIsRejectDialogOpen(false);
                setRejectionReason("");
                setSelectedRequest(null);
                router.refresh();
            } else {
                toast.error(result.message || "Failed to reject leave request");
            }
        } catch (error) {
            console.error("Reject error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setProcessingId(null);
        }
    };

    if (filteredRequests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>
                        {filterStatus === "All" ? "All leave requests" : `${filterStatus} leave requests`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                        <p className="text-sm text-muted-foreground">
                            {filterStatus === "pending"
                                ? "There are no pending leave requests to review"
                                : `No ${filterStatus.toLowerCase()} leave requests found`}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>
                        {filteredRequests.length} {filterStatus === "All" ? "" : filterStatus.toLowerCase()} request(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{request.facultyName}</span>
                                                <span className="text-xs text-muted-foreground">{request.facultyId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {request.leaveType}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{format(new Date(request.startDate), "MMM dd, yyyy")}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    to {format(new Date(request.endDate), "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{request.totalDays}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(request.appliedOn), "MMM dd")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {request.status === "pending" && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleApprove(request)}
                                                            disabled={processingId === request.id}
                                                        >
                                                            {processingId === request.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Check className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setIsRejectDialogOpen(true);
                                                            }}
                                                            disabled={processingId === request.id}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Leave Request Details</DialogTitle>
                                                            <DialogDescription>
                                                                Request ID: {request.id}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-sm font-medium">Faculty Name</Label>
                                                                    <p className="text-sm text-muted-foreground">{request.facultyName}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Email</Label>
                                                                    <p className="text-sm text-muted-foreground">{request.facultyId}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-sm font-medium">Leave Type</Label>
                                                                    <p className="text-sm text-muted-foreground">{request.leaveType}</p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">Duration</Label>
                                                                    <p className="text-sm text-muted-foreground">{request.duration}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label className="text-sm font-medium">Start Date</Label>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {format(new Date(request.startDate), "PPP")}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-sm font-medium">End Date</Label>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {format(new Date(request.endDate), "PPP")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm font-medium">Total Days</Label>
                                                                <p className="text-sm text-muted-foreground">{request.totalDays} day(s)</p>
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm font-medium">Reason</Label>
                                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm font-medium">Status</Label>
                                                                <div className="mt-1">{getStatusBadge(request.status)}</div>
                                                            </div>
                                                            {request.rejectionReason && (
                                                                <div>
                                                                    <Label className="text-sm font-medium">Rejection Reason</Label>
                                                                    <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this leave request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={processingId !== null || !rejectionReason.trim()}
                        >
                            {processingId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reject Leave
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
