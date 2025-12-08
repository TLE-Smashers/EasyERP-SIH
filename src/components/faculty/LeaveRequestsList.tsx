"use client";

import { useState } from "react";
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
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import { format } from "date-fns";
import { Calendar, Clock, FileText, X, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelLeave } from "@/actions/faculty/leaveActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LeaveRequestsListProps {
    requests: LeaveRequest[];
}

export function LeaveRequestsList({ requests }: LeaveRequestsListProps) {
    const router = useRouter();
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const getStatusBadge = (status: LeaveStatus) => {
        const variants: Record<LeaveStatus, "default" | "secondary" | "destructive" | "outline"> = {
            "pending": "secondary",
            "approved": "default",
            "rejected": "destructive",
            "cancelled": "outline",
        };

        return (
            <Badge variant={variants[status]}>
                {status}
            </Badge>
        );
    };

    const handleCancel = async (requestId: string) => {
        setCancellingId(requestId);
        try {
            const result = await cancelLeave(requestId);

            if (result.success) {
                toast.success("Your leave request has been cancelled successfully");
                router.refresh();
            } else {
                toast.error(result.message || "Failed to cancel leave request");
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setCancellingId(null);
        }
    };

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Leave Requests</CardTitle>
                    <CardDescription>View all your leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No leave requests found</h3>
                        <p className="text-sm text-muted-foreground">
                            You haven't submitted any leave requests yet
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Leave Requests</CardTitle>
                <CardDescription>View and manage your leave requests</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">
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
                                        {format(new Date(request.appliedOn), "MMM dd, yyyy")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.status === "pending" && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={cancellingId === request.id}
                                                    >
                                                        {cancellingId === request.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <X className="h-4 w-4 mr-1" />
                                                                Cancel
                                                            </>
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this leave request? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleCancel(request.id)}>
                                                            Yes, Cancel Leave
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        {request.status === "approved" && (
                                            <Badge variant="outline" className="text-green-600">Approved</Badge>
                                        )}
                                        {request.status === "rejected" && request.rejectionReason && (
                                            <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={request.rejectionReason}>
                                                Reason: {request.rejectionReason}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
