"use client";

import React from "react";
import { IssuedBook } from "@/types/library";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { formatDateForDisplay } from "@/lib/dateUtils";

interface StudentIssuedBooksProps {
  issuedBooks: IssuedBook[];
  onViewReceipt: (issueId: string) => void;
}

export function StudentIssuedBooks({ issuedBooks, onViewReceipt }: StudentIssuedBooksProps) {
  const calculateDaysRemaining = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDueDateBadge = (dueDate: string, status: string) => {
    if (status === 'returned') {
      return (
        <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3" />
          Returned
        </Badge>
      );
    }

    if (status === 'lost') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Lost
        </Badge>
      );
    }

    const daysRemaining = calculateDaysRemaining(dueDate);

    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {Math.abs(daysRemaining)} days overdue
        </Badge>
      );
    } else if (daysRemaining <= 3) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {daysRemaining} days left
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="gap-1">
          <Calendar className="h-3 w-3" />
          {daysRemaining} days left
        </Badge>
      );
    }
  };

  if (issuedBooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No books currently issued</p>
          <p className="text-sm text-muted-foreground mt-2">
            Request a book from the library to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Issued Books</CardTitle>
        <CardDescription>
          Books currently borrowed • Return within 15 days to avoid fines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Details</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issuedBooks.map((issue) => (
                <>
                  <TableRow key={issue.issueId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{issue.bookTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.bookAuthor}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ISBN: {issue.isbn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateForDisplay(issue.issueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateForDisplay(issue.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDueDateBadge(issue.dueDate, issue.status)}
                    </TableCell>
                    <TableCell>
                      {issue.fineAmount > 0 ? (
                        <div>
                          <div className="font-medium text-destructive">
                            ₹{issue.fineAmount}
                          </div>
                          {!issue.finePaid && (
                            <Badge variant="destructive" className="mt-1">
                              Unpaid
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewReceipt(issue.issueId)}
                      >
                        View Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                  {issue.status === 'returned' && issue.returnNotes && (
                    <TableRow key={`${issue.issueId}-notes`}>
                      <TableCell colSpan={6} className="bg-green-50 dark:bg-green-950/30">
                        <div className="flex items-start gap-2 p-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                              Librarian Notes:
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                              {issue.returnNotes}
                            </p>
                            {issue.returnDate && (
                              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Returned on: {formatDateForDisplay(issue.returnDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Warning for overdue books */}
        {issuedBooks.some((book) => calculateDaysRemaining(book.dueDate) < 0) && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-destructive">
                  Overdue Books Detected
                </h4>
                <p className="text-sm text-destructive/90 mt-1">
                  You have overdue books. Please return them to the library as soon as possible.
                  Fine: ₹5 per day.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
