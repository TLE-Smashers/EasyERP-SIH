/**
 * Approve/Reject Request Action
 * Librarian approves or rejects book requests and generates issue codes
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { 
  fetchRequestById, 
  updateRequest, 
  fetchBookById,
  fetchAllRequests 
} from "@/lib/google/sheets.library";
import { LibraryApiResponse } from "@/types/library";
import { revalidatePath } from "next/cache";

/**
 * Generate 6-digit issue code
 */
function generateIssueCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate code expiry date (24 hours from now)
 */
function getCodeExpiryDate(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry.toISOString();
}

/**
 * Approve book request and generate issue code
 */
export async function approveRequest(requestId: string): Promise<LibraryApiResponse<{ issueCode: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if user is librarian
    // TODO: Add role check when role management is implemented
    // if (session.user.role !== 'librarian' && session.user.role !== 'admin') {
    //   return { success: false, error: "Only librarians can approve requests" };
    // }

    const request = await fetchRequestById(requestId);
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: `Request is already ${request.status}`,
      };
    }

    // Check if book has available copies
    const book = await fetchBookById(request.bookId);
    if (!book || book.availableCopies <= 0) {
      return {
        success: false,
        error: "Book is not available",
      };
    }

    // Check how many approved but not yet issued requests exist for this book
    const allRequests = await fetchAllRequests();
    const approvedCount = allRequests.filter(
      req => req.bookId === request.bookId && req.status === 'approved'
    ).length;

    if (approvedCount >= book.availableCopies) {
      return {
        success: false,
        error: "All available copies are already allocated",
      };
    }

    // Generate unique issue code
    let issueCode = generateIssueCode();
    let codeExists = true;
    
    // Ensure code is unique
    while (codeExists) {
      const existingRequest = allRequests.find(r => r.issueCode === issueCode);
      if (!existingRequest) {
        codeExists = false;
      } else {
        issueCode = generateIssueCode();
      }
    }

    const now = new Date().toISOString();
    const expiryDate = getCodeExpiryDate();

    // Update request with approval
    if (request.rowNumber) {
      await updateRequest(request.rowNumber, {
        status: 'approved',
        issueCode,
        codeGeneratedDate: now,
        codeExpiryDate: expiryDate,
        processedBy: session.user.email,
        processedDate: now,
      });
    }

    // TODO: Send approval email with code
    // await sendRequestApprovedEmail(
    //   request.email,
    //   request.studentName,
    //   request.bookTitle,
    //   issueCode,
    //   expiryDate
    // );

    revalidatePath("/dashboard/library/requests");
    revalidatePath("/dashboard/student/library");

    return {
      success: true,
      data: { issueCode },
      message: "Request approved successfully. Issue code generated.",
    };
  } catch (error) {
    console.error("Error approving request:", error);
    return {
      success: false,
      error: "Failed to approve request",
    };
  }
}

/**
 * Reject book request
 */
export async function rejectRequest(
  requestId: string, 
  reason: string
): Promise<LibraryApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const request = await fetchRequestById(requestId);
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        error: `Request is already ${request.status}`,
      };
    }

    const now = new Date().toISOString();

    // Update request with rejection
    if (request.rowNumber) {
      await updateRequest(request.rowNumber, {
        status: 'rejected',
        rejectionReason: reason,
        processedBy: session.user.email,
        processedDate: now,
      });
    }

    // TODO: Send rejection email
    // await sendRequestRejectedEmail(
    //   request.email,
    //   request.studentName,
    //   request.bookTitle,
    //   reason
    // );

    revalidatePath("/dashboard/library/requests");
    revalidatePath("/dashboard/student/library");

    return {
      success: true,
      message: "Request rejected successfully.",
    };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      success: false,
      error: "Failed to reject request",
    };
  }
}

/**
 * Get all pending requests
 */
export async function getPendingRequests(): Promise<LibraryApiResponse> {
  try {
    const requests = await fetchAllRequests();
    const pendingRequests = requests.filter(req => req.status === 'pending');
    
    // Sort by date (oldest first - FIFO)
    pendingRequests.sort((a, b) => 
      new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime()
    );
    
    return {
      success: true,
      data: pendingRequests,
    };
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return {
      success: false,
      error: "Failed to fetch pending requests",
    };
  }
}

/**
 * Get all approved requests (waiting for collection)
 */
export async function getApprovedRequests(): Promise<LibraryApiResponse> {
  try {
    const requests = await fetchAllRequests();
    const approvedRequests = requests.filter(req => req.status === 'approved');
    
    // Sort by code generation date
    approvedRequests.sort((a, b) => 
      new Date(a.codeGeneratedDate || '').getTime() - new Date(b.codeGeneratedDate || '').getTime()
    );
    
    return {
      success: true,
      data: approvedRequests,
    };
  } catch (error) {
    console.error("Error fetching approved requests:", error);
    return {
      success: false,
      error: "Failed to fetch approved requests",
    };
  }
}

/**
 * Bulk approve multiple requests (FIFO based on available copies)
 */
export async function bulkApproveRequests(bookId: string): Promise<LibraryApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const book = await fetchBookById(bookId);
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    const allRequests = await fetchAllRequests();
    
    // Get pending requests for this book (sorted by date - FIFO)
    const pendingRequests = allRequests
      .filter(req => req.bookId === bookId && req.status === 'pending')
      .sort((a, b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime());

    // Get already approved requests count
    const alreadyApprovedCount = allRequests.filter(
      req => req.bookId === bookId && req.status === 'approved'
    ).length;

    const availableSlots = book.availableCopies - alreadyApprovedCount;

    if (availableSlots <= 0) {
      return {
        success: false,
        error: "No available copies to approve more requests",
      };
    }

    // Approve up to available slots
    const toApprove = pendingRequests.slice(0, availableSlots);
    let successfullyApproved = 0;

    for (const request of toApprove) {
      const result = await approveRequest(request.requestId);
      if (result.success) {
        successfullyApproved++;
      }
    }

    revalidatePath("/dashboard/library/requests");

    return {
      success: true,
      message: `Approved ${successfullyApproved} request(s) successfully.`,
    };
  } catch (error) {
    console.error("Error bulk approving requests:", error);
    return {
      success: false,
      error: "Failed to bulk approve requests",
    };
  }
}
