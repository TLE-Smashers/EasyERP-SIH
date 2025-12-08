/**
 * Request Book Action
 * Student requests a book for issue
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { addRequest, fetchAllRequests } from "@/lib/google/sheets.library";
import { fetchBookById, updateBook } from "@/lib/google/sheets.library";
import { LibraryApiResponse, BookRequest } from "@/types/library";
import { revalidatePath } from "next/cache";

interface RequestBookParams {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  studentId: string;
  studentName: string;
  email: string;
  rollNumber?: string;
  course: string;
  branch: string;
  year: string;
  mobile: string;
}

/**
 * Submit a book request
 */
export async function requestBook(params: RequestBookParams): Promise<LibraryApiResponse<{ requestId: string; position: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if book exists and has available copies
    const book = await fetchBookById(params.bookId);
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }

    // Check for existing pending request by this student for this book
    const existingRequests = await fetchAllRequests();
    const hasPendingRequest = existingRequests.some(
      req => 
        req.bookId === params.bookId &&
        req.studentId === params.studentId &&
        (req.status === 'pending' || req.status === 'approved')
    );

    if (hasPendingRequest) {
      return {
        success: false,
        error: "You already have a pending request for this book",
      };
    }

    // Create request
    const requestData: Omit<BookRequest, 'requestId' | 'rowNumber'> = {
      requestDate: new Date().toISOString(),
      bookId: params.bookId,
      bookTitle: params.bookTitle,
      bookAuthor: params.bookAuthor,
      studentId: params.studentId,
      studentName: params.studentName,
      email: params.email,
      rollNumber: params.rollNumber,
      course: params.course,
      branch: params.branch,
      year: params.year,
      mobile: params.mobile,
      status: 'pending',
    };

    const requestId = await addRequest(requestData);

    // Calculate position in queue for this book
    const bookRequests = existingRequests.filter(
      req => req.bookId === params.bookId && req.status === 'pending'
    );
    const position = bookRequests.length + 1;

    revalidatePath("/dashboard/student/library");
    revalidatePath("/dashboard/library/requests");

    return {
      success: true,
      data: { requestId, position },
      message: `Request submitted successfully. You are #${position} in queue.`,
    };
  } catch (error) {
    console.error("Error requesting book:", error);
    return {
      success: false,
      error: "Failed to submit book request",
    };
  }
}

/**
 * Get student's book requests
 */
export async function getStudentRequests(studentId: string): Promise<LibraryApiResponse<BookRequest[]>> {
  try {
    const requests = await fetchAllRequests();
    const studentRequests = requests.filter(req => req.studentId === studentId);
    
    // Sort by date (newest first)
    studentRequests.sort((a, b) => 
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );
    
    return {
      success: true,
      data: studentRequests,
    };
  } catch (error) {
    console.error("Error fetching student requests:", error);
    return {
      success: false,
      error: "Failed to fetch your requests",
    };
  }
}

/**
 * Get queue position for a request
 */
export async function getQueuePosition(requestId: string): Promise<LibraryApiResponse<number>> {
  try {
    const requests = await fetchAllRequests();
    const request = requests.find(r => r.requestId === requestId);
    
    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Get all pending requests for the same book that were made before this one
    const bookRequests = requests.filter(
      req => 
        req.bookId === request.bookId &&
        req.status === 'pending' &&
        new Date(req.requestDate).getTime() <= new Date(request.requestDate).getTime()
    );

    const position = bookRequests.length;

    return {
      success: true,
      data: position,
    };
  } catch (error) {
    console.error("Error getting queue position:", error);
    return {
      success: false,
      error: "Failed to get queue position",
    };
  }
}
