"use client";

import { BookRequest } from "@/types/library";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { formatDateForDisplay } from "@/lib/dateUtils";

interface StudentRequestsProps {
  requests: BookRequest[];
}

export function StudentRequests({ requests }: StudentRequestsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No requests yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Requests</CardTitle>
        <CardDescription>Track the status of your book requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.requestId}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{request.bookTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    by {request.bookAuthor}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Requested:</span>
                  <p className="font-medium">
                    {formatDateForDisplay(request.requestDate)}
                  </p>
                </div>
                {request.processedDate && (
                  <div>
                    <span className="text-muted-foreground">Processed:</span>
                    <p className="font-medium">
                      {formatDateForDisplay(request.processedDate)}
                    </p>
                  </div>
                )}
              </div>

              {request.status === 'approved' && request.issueCode && (
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Request Approved! Your code:
                      </p>
                      <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-300 mt-1">
                        {request.issueCode}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Valid until:{" "}
                        {request.codeExpiryDate &&
                          formatDateForDisplay(request.codeExpiryDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'rejected' && request.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
                  <p className="text-sm text-red-900 dark:text-red-100">
                    <span className="font-semibold">Reason: </span>
                    {request.rejectionReason}
                  </p>
                </div>
              )}

              {request.status === 'completed' && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Book Issued - Check "My Books" section
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
