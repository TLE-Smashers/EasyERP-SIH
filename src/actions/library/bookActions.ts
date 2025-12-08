"use server";

import { Book } from "@/types/library";
import { 
  addBook as addBookToSheet, 
  updateBook as updateBookInSheet, 
  deleteBook as deleteBookFromSheet,
  fetchAllBooks
} from "@/lib/google/sheets.library";
import { auth } from "@/lib/auth/auth";

// Form data type matching the books page form
interface AddBookInput {
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  publisher: string;
  publicationYear: string;
  description: string;
  subject: string;
  edition: string;
  rackNumber: string;
  coverImageUrl: string;
}

export async function addBook(data: AddBookInput) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate required fields
    if (!data.title || !data.author || !data.isbn) {
      return {
        success: false,
        error: "Title, Author, and ISBN are required",
      };
    }

    // Map form data to full Book structure
    const now = new Date().toISOString();
    const userName = session.user.name || "Unknown";
    const bookData: Omit<Book, 'bookId' | 'rowNumber'> = {
      isbn: data.isbn,
      title: data.title,
      author: data.author,
      publisher: data.publisher || "Unknown",
      publicationYear: data.publicationYear || new Date().getFullYear().toString(),
      edition: data.edition || "1st",
      category: data.category as any,
      subject: data.subject || data.category,
      language: "English",
      rackNumber: data.rackNumber || "TBD",
      totalCopies: data.totalCopies,
      availableCopies: data.totalCopies,
      addedDate: now,
      addedBy: userName,
      lastUpdated: now,
      updatedBy: userName,
      description: data.description || "",
      coverImageUrl: data.coverImageUrl || "",
    };

    const bookId = await addBookToSheet(bookData);
    
    return {
      success: true,
      message: "Book added successfully",
      data: { bookId },
    };
  } catch (error) {
    console.error("Error adding book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add book",
    };
  }
}

export async function updateBook(bookId: string, data: Partial<AddBookInput>) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all books to find the row number
    const allBooks = await fetchAllBooks();
    const book = allBooks.find(b => b.bookId === bookId);
    
    if (!book || !book.rowNumber) {
      return { success: false, error: "Book not found" };
    }

    // Prepare update data with only changed fields
    const userName = session.user.name || "Unknown";
    const updates: any = {
      lastUpdated: new Date().toISOString(),
      updatedBy: userName,
    };

    if (data.title) updates.title = data.title;
    if (data.author) updates.author = data.author;
    if (data.isbn) updates.isbn = data.isbn;
    if (data.category) updates.category = data.category;
    if (data.publisher) updates.publisher = data.publisher;
    if (data.publicationYear) updates.publicationYear = data.publicationYear;
    if (data.description !== undefined) updates.description = data.description;
    if (data.totalCopies !== undefined) {
      updates.totalCopies = data.totalCopies;
      // Adjust available copies if total changed
      const diff = data.totalCopies - book.totalCopies;
      updates.availableCopies = book.availableCopies + diff;
    }

    await updateBookInSheet(book.rowNumber, updates);
    
    return {
      success: true,
      message: "Book updated successfully",
    };
  } catch (error) {
    console.error("Error updating book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update book",
    };
  }
}

export async function deleteBook(bookId: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!bookId) {
      return {
        success: false,
        error: "Book ID is required",
      };
    }

    // Get all books to find the row number
    const allBooks = await fetchAllBooks();
    const book = allBooks.find(b => b.bookId === bookId);
    
    if (!book || !book.rowNumber) {
      return { success: false, error: "Book not found" };
    }

    // Check if any copies are issued
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (issuedCopies > 0) {
      return {
        success: false,
        error: `Cannot delete book. ${issuedCopies} ${issuedCopies === 1 ? 'copy is' : 'copies are'} currently issued.`,
      };
    }

    await deleteBookFromSheet(book.rowNumber);
    
    return {
      success: true,
      message: "Book deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete book",
    };
  }
}

