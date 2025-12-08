"use client";

import { useState, useEffect } from "react";
import { BookRequest } from "@/types/library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PendingRequestsTable } from "@/components/library/PendingRequestsTable";
import { getPendingRequests, getApprovedRequests } from "@/actions/library/approveRequest";
import { toast } from "sonner";
import { RefreshCw, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function LibraryRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<BookRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        getPendingRequests(),
        getApprovedRequests(),
      ]);

      if (pendingRes.success) setPendingRequests(pendingRes.data || []);
      if (approvedRes.success) setApprovedRequests(approvedRes.data || []);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="space-y-6">
      <PageHeader
        title="Book Requests"
        description="Review and process student book requests"
        actions={
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved (Waiting Collection)</p>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingRequestsTable requests={pendingRequests} onUpdate={fetchData} />
        </TabsContent>

        <TabsContent value="approved">
          {approvedRequests.length === 0 ? (
            <div className="border rounded-lg p-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No approved requests waiting for collection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.requestId}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold">{request.studentName}</h3>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{request.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">by {request.bookAuthor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-300">
                          {request.issueCode}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Issue Code</p>
                        {request.codeExpiryDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Expires: {new Date(request.codeExpiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
