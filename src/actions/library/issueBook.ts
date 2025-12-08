/**
 * Issue Book Action
 * Student enters code to issue book
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { 
  fetchAllRequests,
  fetchRequestById,
  updateRequest,
  addIssue,
  fetchBookById,
  updateBook
} from "@/lib/google/sheets.library";
import { LibraryApiResponse, IssuedBook } from "@/types/library";
import { revalidatePath } from "next/cache";

/**
 * Calculate due date (15 days from issue date)
 */
function getDueDate(issueDate: Date): string {
  const due = new Date(issueDate);
  due.setDate(due.getDate() + 15);
  return due.toISOString();
}

/**
 * Issue book using code
 */
export async function issueBookWithCode(
  code: string,
  studentId: string
): Promise<LibraryApiResponse<{ issueId: string; dueDate: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Find request with this code
    const requests = await fetchAllRequests();
    const request = requests.find(
      req => req.issueCode === code && req.status === 'approved'
    );

    if (!request) {
      return {
        success: false,
        error: "Invalid or expired code",
      };
    }

    // Verify student ID matches
    if (request.studentId !== studentId) {
      return {
        success: false,
        error: "This code is not assigned to you",
      };
    }

    // Check if code is expired
    if (request.codeExpiryDate) {
      const expiryDate = new Date(request.codeExpiryDate);
      if (new Date() > expiryDate) {
        // Mark as expired
        if (request.rowNumber) {
          await updateRequest(request.rowNumber, { status: 'expired' });
        }
        return {
          success: false,
          error: "Code has expired. Please contact librarian.",
        };
      }
    }

    // Get book details
    const book = await fetchBookById(request.bookId);
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is no longer available",
      };
    }

    const now = new Date();
    const issueDate = now.toISOString();
    const dueDate = getDueDate(now);

    // Create issue record
    const issueData: Omit<IssuedBook, 'issueId' | 'rowNumber'> = {
      requestId: request.requestId,
      bookId: book.bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      isbn: book.isbn,
      studentId: request.studentId,
      studentName: request.studentName,
      email: request.email,
      rollNumber: request.rollNumber,
      course: request.course,
      branch: request.branch,
      year: request.year,
      mobile: request.mobile,
      issueDate,
      dueDate,
      status: 'issued',
      daysOverdue: 0,
      fineAmount: 0,
      finePaid: false,
      issuedBy: session.user.email,
      condition: 'good',
    };

    const issueId = await addIssue(issueData);

    // Update request status
    if (request.rowNumber) {
      await updateRequest(request.rowNumber, {
        status: 'completed',
        completedDate: issueDate,
      });
    }

    // Decrease available copies
    if (book.rowNumber) {
      await updateBook(book.rowNumber, {
        availableCopies: book.availableCopies - 1,
        lastUpdated: issueDate,
        updatedBy: session.user.email,
      });
    }

    // TODO: Send issue confirmation email with receipt
    // await sendBookIssuedEmail(
    //   request.email,
    //   request.studentName,
    //   book.title,
    //   issueId,
    //   issueDate,
    //   dueDate
    // );

    revalidatePath("/dashboard/student/library");
    revalidatePath("/dashboard/library/issues");
    revalidatePath("/dashboard/library/books");

    return {
      success: true,
      data: { issueId, dueDate },
      message: "Book issued successfully!",
    };
  } catch (error) {
    console.error("Error issuing book:", error);
    return {
      success: false,
      error: "Failed to issue book",
    };
  }
}

/**
 * Librarian issues book directly (without code - for walk-ins)
 */
export async function issueBookDirect(
  bookId: string,
  studentId: string,
  studentName: string,
  email: string,
  mobile: string,
  course: string,
  branch: string,
  year: string,
  rollNumber?: string,
  notes?: string
): Promise<LibraryApiResponse<{ issueId: string; dueDate: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get book details
    const book = await fetchBookById(bookId);
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available",
      };
    }

    const now = new Date();
    const issueDate = now.toISOString();
    const dueDate = getDueDate(now);

    // Create issue record
    const issueData: Omit<IssuedBook, 'issueId' | 'rowNumber'> = {
      requestId: 'DIRECT',
      bookId: book.bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      isbn: book.isbn,
      studentId,
      studentName,
      email,
      rollNumber,
      course,
      branch,
      year,
      mobile,
      issueDate,
      dueDate,
      status: 'issued',
      daysOverdue: 0,
      fineAmount: 0,
      finePaid: false,
      issuedBy: session.user.email,
      issueNotes: notes,
      condition: 'good',
    };

    const issueId = await addIssue(issueData);

    // Decrease available copies
    if (book.rowNumber) {
      await updateBook(book.rowNumber, {
        availableCopies: book.availableCopies - 1,
        lastUpdated: issueDate,
        updatedBy: session.user.email,
      });
    }

    revalidatePath("/dashboard/library/issues");
    revalidatePath("/dashboard/library/books");

    return {
      success: true,
      data: { issueId, dueDate },
      message: "Book issued successfully!",
    };
  } catch (error) {
    console.error("Error issuing book:", error);
    return {
      success: false,
      error: "Failed to issue book",
    };
  }
}

/**
 * Get student's issued books
 */
export async function getStudentIssuedBooks(studentId: string): Promise<LibraryApiResponse> {
  try {
    const { fetchAllIssues } = await import("@/lib/google/sheets.library");
    const issues = await fetchAllIssues();
    
    const studentIssues = issues.filter(
      issue => issue.studentId === studentId && issue.status === 'issued'
    );
    
    return {
      success: true,
      data: studentIssues,
    };
  } catch (error) {
    console.error("Error fetching student issued books:", error);
    return {
      success: false,
      error: "Failed to fetch your issued books",
    };
  }
}

/**
 * Get all issued books
 */
export async function getAllIssuedBooks(): Promise<LibraryApiResponse> {
  try {
    const { fetchAllIssues } = await import("@/lib/google/sheets.library");
    const issues = await fetchAllIssues();
    
    const issuedBooks = issues.filter(issue => issue.status === 'issued');
    
    return {
      success: true,
      data: issuedBooks,
    };
  } catch (error) {
    console.error("Error fetching issued books:", error);
    return {
      success: false,
      error: "Failed to fetch issued books",
    };
  }
}

/**
 * Get overdue books
 */
export async function getOverdueBooks(): Promise<LibraryApiResponse> {
  try {
    const { fetchAllIssues } = await import("@/lib/google/sheets.library");
    const issues = await fetchAllIssues();
    
    const now = new Date();
    const overdueBooks = issues.filter(issue => {
      if (issue.status !== 'issued') return false;
      const dueDate = new Date(issue.dueDate);
      return now > dueDate;
    });
    
    return {
      success: true,
      data: overdueBooks,
    };
  } catch (error) {
    console.error("Error fetching overdue books:", error);
    return {
      success: false,
      error: "Failed to fetch overdue books",
    };
  }
}
