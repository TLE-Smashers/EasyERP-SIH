/**
 * Return Book Action
 * Handle book returns and fine calculations
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { 
  fetchIssueById,
  updateIssue,
  fetchBookById,
  updateBook,
  fetchAllIssues
} from "@/lib/google/sheets.library";
import { LibraryApiResponse } from "@/types/library";
import { revalidatePath } from "next/cache";

const FINE_PER_DAY = 5; // ₹5 per day

/**
 * Calculate days overdue and fine amount
 */
function calculateFine(dueDate: string, returnDate: string): { daysOverdue: number; fineAmount: number } {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  // Remove time component for accurate day calculation
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);
  
  const diffTime = returned.getTime() - due.getTime();
  const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const fineAmount = daysOverdue * FINE_PER_DAY;
  
  return { daysOverdue, fineAmount };
}

/**
 * Return book
 */
export async function returnBook(
  issueId: string,
  condition: 'good' | 'fair' | 'damaged' | 'lost',
  notes?: string
): Promise<LibraryApiResponse<{ fineAmount: number; daysOverdue: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get issue record
    const issue = await fetchIssueById(issueId);
    if (!issue) {
      return {
        success: false,
        error: "Issue record not found",
      };
    }

    if (issue.status !== 'issued') {
      return {
        success: false,
        error: "Book is not currently issued",
      };
    }

    const returnDate = new Date().toISOString();
    const { daysOverdue, fineAmount } = calculateFine(issue.dueDate, returnDate);

    // Get book details
    const book = await fetchBookById(issue.bookId);
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    // Update issue record
    if (issue.rowNumber) {
      await updateIssue(issue.rowNumber, {
        returnDate,
        status: 'returned',
        daysOverdue,
        fineAmount,
        finePaid: fineAmount === 0, // Auto-mark paid if no fine
        returnedBy: session.user.email,
        returnNotes: notes,
        condition,
      });
    }

    // Increase available copies (only if not lost)
    if (condition !== 'lost' && book.rowNumber) {
      await updateBook(book.rowNumber, {
        availableCopies: book.availableCopies + 1,
        lastUpdated: returnDate,
        updatedBy: session.user.email,
      });
    } else if (condition === 'lost' && book.rowNumber) {
      // If book is lost, decrease total copies
      await updateBook(book.rowNumber, {
        totalCopies: book.totalCopies - 1,
        lastUpdated: returnDate,
        updatedBy: session.user.email,
      });
    }

    // TODO: If there's a fine, send payment notification
    // if (fineAmount > 0) {
    //   await sendFineNotificationEmail(
    //     issue.email,
    //     issue.studentName,
    //     issue.bookTitle,
    //     fineAmount,
    //     daysOverdue
    //   );
    // }

    // TODO: Check for pending notify requests and send notifications
    // const { fetchPendingNotifyRequests } = await import("@/lib/google/sheets.library");
    // const notifyRequests = await fetchPendingNotifyRequests(book.bookId);
    // for (const notify of notifyRequests) {
    //   await sendBookAvailableEmail(notify.email, notify.studentName, book.title);
    // }

    revalidatePath("/dashboard/library/issues");
    revalidatePath("/dashboard/library/books");
    revalidatePath("/dashboard/student/library");

    return {
      success: true,
      data: { fineAmount, daysOverdue },
      message: fineAmount > 0 
        ? `Book returned. Fine: ₹${fineAmount} for ${daysOverdue} day(s) overdue.`
        : "Book returned successfully!",
    };
  } catch (error) {
    console.error("Error returning book:", error);
    return {
      success: false,
      error: "Failed to return book",
    };
  }
}

/**
 * Mark fine as paid
 */
export async function markFinePaid(
  issueId: string,
  paymentReference: string
): Promise<LibraryApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const issue = await fetchIssueById(issueId);
    if (!issue) {
      return {
        success: false,
        error: "Issue record not found",
      };
    }

    if (issue.finePaid) {
      return {
        success: false,
        error: "Fine is already paid",
      };
    }

    if (issue.rowNumber) {
      await updateIssue(issue.rowNumber, {
        finePaid: true,
        finePaymentDate: new Date().toISOString(),
        finePaymentReference: paymentReference,
      });
    }

    revalidatePath("/dashboard/library/issues");
    revalidatePath("/dashboard/student/library");

    return {
      success: true,
      message: "Fine marked as paid successfully",
    };
  } catch (error) {
    console.error("Error marking fine as paid:", error);
    return {
      success: false,
      error: "Failed to mark fine as paid",
    };
  }
}

/**
 * Update overdue status and fines for all issued books
 * This should be run periodically (e.g., daily cron job)
 */
export async function updateOverdueStatus(): Promise<LibraryApiResponse> {
  try {
    const issues = await fetchAllIssues();
    const now = new Date().toISOString();
    
    let updatedCount = 0;

    for (const issue of issues) {
      if (issue.status === 'issued') {
        const { daysOverdue, fineAmount } = calculateFine(issue.dueDate, now);
        
        // Only update if overdue
        if (daysOverdue > 0 && issue.rowNumber) {
          await updateIssue(issue.rowNumber, {
            status: 'overdue',
            daysOverdue,
            fineAmount,
          });
          updatedCount++;
          
          // TODO: Send overdue reminder email
          // if (daysOverdue === 1 || daysOverdue % 7 === 0) {
          //   await sendOverdueReminderEmail(
          //     issue.email,
          //     issue.studentName,
          //     issue.bookTitle,
          //     daysOverdue,
          //     fineAmount
          //   );
          // }
        }
      }
    }

    if (updatedCount > 0) {
      revalidatePath("/dashboard/library/issues");
    }

    return {
      success: true,
      message: `Updated ${updatedCount} overdue record(s)`,
    };
  } catch (error) {
    console.error("Error updating overdue status:", error);
    return {
      success: false,
      error: "Failed to update overdue status",
    };
  }
}

/**
 * Get total unpaid fines for a student
 */
export async function getStudentFines(studentId: string): Promise<LibraryApiResponse<number>> {
  try {
    const issues = await fetchAllIssues();
    
    const totalFine = issues
      .filter(issue => issue.studentId === studentId && !issue.finePaid && issue.fineAmount > 0)
      .reduce((sum, issue) => sum + issue.fineAmount, 0);
    
    return {
      success: true,
      data: totalFine,
    };
  } catch (error) {
    console.error("Error calculating student fines:", error);
    return {
      success: false,
      error: "Failed to calculate fines",
    };
  }
}
