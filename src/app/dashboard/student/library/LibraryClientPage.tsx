"use client";

import { useState, useEffect } from "react";
import { Book, BookRequest, IssuedBook } from "@/types/library";
import { Button } from "@/components/ui/button";
import { BooksTable } from "@/components/library/BooksTable";
import { RequestBookDialog } from "@/components/library/RequestBookDialog";
import { IssueBookForm } from "@/components/library/IssueBookForm";
import { StudentRequests } from "@/components/library/StudentRequests";
import { StudentIssuedBooks } from "@/components/library/StudentIssuedBooks";
import { getBooks } from "@/actions/library/getBooks";
import { getStudentRequests } from "@/actions/library/requestBook";
import { getStudentIssuedBooks } from "@/actions/library/issueBook";
import { notifyMeWhenAvailable } from "@/actions/library/notifyMe";
import { toast } from "sonner";
import { QrCode, RefreshCw } from "lucide-react";

interface LibraryClientPageProps {
  studentId: string;
  studentEmail: string;
}

export function LibraryClientPage({ studentId, studentEmail }: LibraryClientPageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  // TODO: Get actual student info from database
  const studentInfo = {
    studentId,
    studentName: studentEmail.split('@')[0],
    email: studentEmail,
    rollNumber: undefined,
    course: "B.Tech",
    branch: "Computer Science",
    year: "3",
    mobile: "0000000000",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, requestsRes, issuedRes] = await Promise.all([
        getBooks(),
        getStudentRequests(studentId),
        getStudentIssuedBooks(studentId),
      ]);

      if (booksRes.success) setBooks(booksRes.data || []);
      if (requestsRes.success) setRequests(requestsRes.data || []);
      if (issuedRes.success) setIssuedBooks(issuedRes.data || []);
    } catch (error) {
      toast.error("Failed to load library data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestBook = (book: Book) => {
    setSelectedBook(book);
    setShowRequestDialog(true);
  };

  const handleNotifyMe = async (book: Book) => {
    try {
      const result = await notifyMeWhenAvailable({
        bookId: book.bookId,
        bookTitle: book.title,
        studentId,
        studentName: studentInfo.studentName,
        email: studentEmail,
      });

      if (result.success) {
        toast.success(result.message || "Notification request submitted!");
      } else {
        toast.error(result.error || "Failed to submit notification request");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleRequestSuccess = () => {
    fetchData();
  };

  const handleIssueSuccess = (issueId: string) => {
    toast.success("Book issued successfully!");
    fetchData();
  };

  const handleViewReceipt = (issueId: string) => {
    // TODO: Implement receipt view
    toast.info("Receipt view coming soon!");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
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
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <BooksTable
          books={books}
          onRequestBook={handleRequestBook}
          onNotifyMe={handleNotifyMe}
          studentMode={true}
        />
      </div>

      {/* Dialogs */}
      <RequestBookDialog
        book={selectedBook}
        open={showRequestDialog}
        onClose={() => {
          setShowRequestDialog(false);
          setSelectedBook(null);
        }}
        studentInfo={studentInfo}
        onSuccess={handleRequestSuccess}
      />

      <IssueBookForm
        open={showIssueForm}
        onClose={() => setShowIssueForm(false)}
        studentId={studentId}
        onSuccess={handleIssueSuccess}
      />
    </>
  );
}
