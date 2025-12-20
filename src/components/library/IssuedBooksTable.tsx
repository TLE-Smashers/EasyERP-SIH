"use client";

import { IssuedBook } from "@/types/library";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { returnBook } from "@/actions/library/returnBook";
import { formatDateForDisplay } from "@/lib/dateUtils";

interface IssuedBooksTableProps {
  issuedBooks: IssuedBook[];
  onUpdate: () => void;
}

export function IssuedBooksTable({ issuedBooks, onUpdate }: IssuedBooksTableProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssuedBook | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [condition, setCondition] = useState<'good' | 'fair' | 'damaged' | 'lost'>('good');
  const [returnNotes, setReturnNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const exportToCSV = () => {
    const headers = ['Issue ID', 'Student Name', 'Roll Number', 'Book Title', 'Book Author', 'Issue Date', 'Due Date', 'Status', 'Fine Amount', 'Fine Paid'];
    const csvRows = [
      headers.join(','),
      ...issuedBooks.map(issue =>
        [
          `"${issue.issueId}"`,
          `"${issue.studentName}"`,
          `"${issue.rollNumber || issue.studentId}"`,
          `"${issue.bookTitle}"`,
          `"${issue.bookAuthor}"`,
          `"${formatDateForDisplay(issue.issueDate)}"`,
          `"${formatDateForDisplay(issue.dueDate)}"`,
          `"${issue.status}"`,
          `"${issue.fineAmount}"`,
          `"${issue.finePaid ? 'Yes' : 'No'}"`
        ].join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issued-books-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleReturnClick = (issue: IssuedBook) => {
    setSelectedIssue(issue);
    setShowReturnDialog(true);
    setCondition('good');
    setReturnNotes("");
  };

  const handleReturnSubmit = async () => {
    if (!selectedIssue) return;

    setLoading(true);
    try {
      const result = await returnBook(selectedIssue.issueId, condition, returnNotes);
      if (result.success) {
        toast.success(result.message || "Book returned successfully!");
        setShowReturnDialog(false);
        setSelectedIssue(null);
        onUpdate();
      } else {
        toast.error(result.error || "Failed to return book");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (issue: IssuedBook) => {
    const now = new Date();
    const due = new Date(issue.dueDate);

    if (issue.status === 'returned') {
      return <Badge variant="outline">Returned</Badge>;
    }

    if (now > due) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    return <Badge variant="default">Issued</Badge>;
  };

  if (issuedBooks.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No issued books</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{issuedBooks.length} Issued Book(s)</h3>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fine</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issuedBooks.map((issue) => (
              <TableRow key={issue.issueId}>
                <TableCell className="font-mono text-sm">
                  {issue.issueId}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{issue.studentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.rollNumber || issue.studentId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{issue.bookTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.bookAuthor}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDateForDisplay(issue.issueDate)}</TableCell>
                <TableCell>{formatDateForDisplay(issue.dueDate)}</TableCell>
                <TableCell>{getStatusBadge(issue)}</TableCell>
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
                <TableCell className="text-right">
                  {issue.status === 'issued' && (
                    <Button
                      size="sm"
                      onClick={() => handleReturnClick(issue)}
                      disabled={loading}
                    >
                      Return Book
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Record the book return and assess its condition
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedIssue && (
              <>
                <div className="text-sm space-y-2 pb-4 border-b">
                  <div>
                    <span className="font-medium">Student:</span> {selectedIssue.studentName}
                  </div>
                  <div>
                    <span className="font-medium">Book:</span> {selectedIssue.bookTitle}
                  </div>
                  <div>
                    <span className="font-medium">Due Date:</span>{" "}
                    {formatDateForDisplay(selectedIssue.dueDate)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Book Condition</Label>
                  <Select value={condition} onValueChange={(value: any) => setCondition(value)}>
                    <SelectTrigger id="condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Good - No damage</SelectItem>
                      <SelectItem value="fair">Fair - Minor wear</SelectItem>
                      <SelectItem value="damaged">Damaged - Significant wear</SelectItem>
                      <SelectItem value="lost">Lost - Not returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about the return..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {(() => {
                  const now = new Date();
                  const due = new Date(selectedIssue.dueDate);
                  const isOverdue = now > due;
                  const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
                  const fine = isOverdue ? daysOverdue * 5 : 0;

                  return isOverdue ? (
                    <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                            Book is {daysOverdue} day(s) overdue
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                            Fine: ₹{fine} (₹5 per day)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        ✓ Book is being returned on time. No fine applicable.
                      </p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReturnDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleReturnSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
