"use client";

import { useState } from "react";
import { Book } from "@/types/library";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestBook } from "@/actions/library/requestBook";

interface RequestBookDialogProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  studentInfo: {
    studentId: string;
    studentName: string;
    email: string;
    rollNumber?: string;
    course: string;
    branch: string;
    year: string;
    mobile: string;
  };
  onSuccess: () => void;
}

export function RequestBookDialog({
  book,
  open,
  onClose,
  studentInfo,
  onSuccess,
}: RequestBookDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!book) return;

    setLoading(true);
    try {
      const result = await requestBook({
        bookId: book.bookId,
        bookTitle: book.title,
        bookAuthor: book.author,
        ...studentInfo,
      });

      if (result.success) {
        toast.success(result.message || "Request submitted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred while submitting request");
    } finally {
      setLoading(false);
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Request Book</DialogTitle>
          <DialogDescription>
            Submit a request to borrow this book. You will receive a code when approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Book Details */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Book Title</Label>
              <p className="text-sm text-muted-foreground mt-1">{book.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Author</Label>
              <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ISBN</Label>
                <p className="text-sm text-muted-foreground mt-1">{book.isbn}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm text-muted-foreground mt-1">{book.category}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Available Copies</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {book.availableCopies} of {book.totalCopies} copies available
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold">Your Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="text-sm">{studentInfo.studentName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Roll Number</Label>
                <p className="text-sm">{studentInfo.rollNumber || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Course</Label>
                <p className="text-sm">{studentInfo.course}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Branch</Label>
                <p className="text-sm">{studentInfo.branch}</p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📋 What happens next?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Your request will be reviewed by the librarian</li>
              <li>• If approved, you'll receive a 6-digit code via email</li>
              <li>• Visit the library and enter the code to collect the book</li>
              <li>• Code is valid for 24 hours</li>
              <li>• Requests are processed on first-come-first-serve basis</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
