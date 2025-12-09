"use client";

import { useState } from "react";
import { BookRequest } from "@/types/library";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { approveRequest, rejectRequest } from "@/actions/library/approveRequest";
import { formatDateForDisplay } from "@/lib/dateUtils";

interface PendingRequestsTableProps {
  requests: BookRequest[];
  onUpdate: () => void;
}

export function PendingRequestsTable({ requests, onUpdate }: PendingRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [approvedCode, setApprovedCode] = useState<string | null>(null);

  const exportToCSV = () => {
    const headers = ['Request ID', 'Student Name', 'Roll Number', 'Email', 'Book Title', 'Book Author', 'Request Date', 'Course', 'Branch', 'Year'];
    const csvRows = [
      headers.join(','),
      ...requests.map(request =>
        [
          `"${request.requestId}"`,
          `"${request.studentName}"`,
          `"${request.rollNumber || request.studentId}"`,
          `"${request.email}"`,
          `"${request.bookTitle}"`,
          `"${request.bookAuthor}"`,
          `"${formatDateForDisplay(request.requestDate)}"`,
          `"${request.course}"`,
          `"${request.branch}"`,
          `"${request.year}"`
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pending-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleApprove = async (request: BookRequest) => {
    setLoading(true);
    try {
      const result = await approveRequest(request.requestId);
      if (result.success) {
        toast.success(result.message || "Request approved successfully!");
        setApprovedCode(result.data?.issueCode || null);
        setTimeout(() => setApprovedCode(null), 5000);
        onUpdate();
      } else {
        toast.error(result.error || "Failed to approve request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = (request: BookRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setLoading(true);
    try {
      const result = await rejectRequest(selectedRequest.requestId, rejectionReason);
      if (result.success) {
        toast.success(result.message || "Request rejected");
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedRequest(null);
        onUpdate();
      } else {
        toast.error(result.error || "Failed to reject request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending requests</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{requests.length} Pending Request(s)</h3>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.requestId}>
                <TableCell className="font-mono text-sm">
                  {request.requestId}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.studentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.rollNumber || request.studentId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.bookTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.bookAuthor}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDateForDisplay(request.requestDate)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{request.course}</div>
                    <div className="text-muted-foreground">
                      {request.branch} • Year {request.year}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectClick(request)}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. The student will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Student:</span> {selectedRequest.studentName}
                </div>
                <div>
                  <span className="font-medium">Book:</span> {selectedRequest.bookTitle}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Book is reserved, Student has unpaid fines, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog for Approved Code */}
      {approvedCode && (
        <Dialog open={!!approvedCode} onOpenChange={() => setApprovedCode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Approved!</DialogTitle>
              <DialogDescription>
                Issue code generated. Share this with the student.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Issue Code</p>
                <p className="text-4xl font-mono font-bold text-green-700 dark:text-green-300">
                  {approvedCode}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Valid for 24 hours
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setApprovedCode(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
