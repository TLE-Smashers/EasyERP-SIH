"use client";

import { useState } from "react";
import { IssuedBook } from "@/types/library";
import { Button } from "@/components/ui/button";
import { StudentIssuedBooks } from "@/components/library/StudentIssuedBooks";
import { getStudentIssuedBooks } from "@/actions/library/issueBook";
import { RefreshCw, QrCode } from "lucide-react";
import { IssueBookForm } from "@/components/library/IssueBookForm";
import { toast } from "sonner";

interface MyBooksClientProps {
  initialBooks: IssuedBook[];
  studentId: string;
}

export function MyBooksClient({ initialBooks, studentId }: MyBooksClientProps) {
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>(initialBooks);
  const [loading, setLoading] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await getStudentIssuedBooks(studentId);
      if (result.success && result.data) {
        setIssuedBooks(result.data);
        toast.success("Books refreshed");
      } else {
        toast.error(result.error || "Failed to refresh books");
      }
    } catch (error) {
      toast.error("Failed to refresh books");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (issueId: string) => {
    toast.info("Receipt view coming soon!");
  };

  const handleIssueSuccess = () => {
    setShowIssueForm(false);
    handleRefresh();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIssueForm(true)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Enter Code
          </Button> */}
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

        <StudentIssuedBooks
          issuedBooks={issuedBooks}
          onViewReceipt={handleViewReceipt}
        />
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
