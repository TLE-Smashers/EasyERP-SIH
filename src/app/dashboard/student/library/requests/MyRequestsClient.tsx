"use client";

import { useState } from "react";
import { BookRequest } from "@/types/library";
import { Button } from "@/components/ui/button";
import { StudentRequests } from "@/components/library/StudentRequests";
import { IssueBookForm } from "@/components/library/IssueBookForm";
import { getStudentRequests } from "@/actions/library/requestBook";
import { RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";

interface MyRequestsClientProps {
  initialRequests: BookRequest[];
  studentId: string;
}

export function MyRequestsClient({ initialRequests, studentId }: MyRequestsClientProps) {
  const [requests, setRequests] = useState<BookRequest[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await getStudentRequests(studentId);
      if (result.success && result.data) {
        setRequests(result.data);
        toast.success("Requests refreshed");
      } else {
        toast.error(result.error || "Failed to refresh requests");
      }
    } catch (error) {
      toast.error("Failed to refresh requests");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSuccess = () => {
    setShowIssueForm(false);
    handleRefresh();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIssueForm(true)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Enter Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <StudentRequests requests={requests} />
      </div>

      <IssueBookForm
        open={showIssueForm}
        onClose={() => setShowIssueForm(false)}
        studentId={studentId}
        onSuccess={handleIssueSuccess}
      />
    </>
  );
}
