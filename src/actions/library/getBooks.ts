/**
 * Get Books Action
 * Fetch all books with filtering and search
 */

"use server";

import { fetchAllBooks } from "@/lib/google/sheets.library";
import { Book, BookFilters, LibraryApiResponse } from "@/types/library";

/**
 * Get all books
 */
export async function getBooks(): Promise<LibraryApiResponse<Book[]>> {
  try {
    const books = await fetchAllBooks();
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    return {
      success: false,
      error: "Failed to fetch books",
    };
  }
}

/**
 * Get available books only
 */
export async function getAvailableBooks(): Promise<LibraryApiResponse<Book[]>> {
  try {
    const books = await fetchAllBooks();
    const availableBooks = books.filter(book => book.availableCopies > 0);
    
    return {
      success: true,
      data: availableBooks,
    };
  } catch (error) {
    console.error("Error fetching available books:", error);
    return {
      success: false,
      error: "Failed to fetch available books",
    };
  }
}

/**
 * Search books with filters
 */
export async function searchBooks(filters: BookFilters): Promise<LibraryApiResponse<Book[]>> {
  try {
    let books = await fetchAllBooks();
    
    // Filter by category
    if (filters.category) {
      books = books.filter(book => book.category === filters.category);
    }
    
    // Filter by subject
    if (filters.subject) {
      books = books.filter(book => 
        book.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      );
    }
    
    // Filter by language
    if (filters.language) {
      books = books.filter(book => book.language === filters.language);
    }
    
    // Filter by availability
    if (filters.available !== undefined) {
      if (filters.available) {
        books = books.filter(book => book.availableCopies > 0);
      } else {
        books = books.filter(book => book.availableCopies === 0);
      }
    }
    
    // Search by title, author, ISBN
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      books = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      );
    }
    
    return {
      success: true,
      data: books,
    };
  } catch (error) {
    console.error("Error searching books:", error);
    return {
      success: false,
      error: "Failed to search books",
    };
  }
}

/**
 * Get book by ID
 */
export async function getBookById(bookId: string): Promise<LibraryApiResponse<Book>> {
  try {
    const books = await fetchAllBooks();
    const book = books.find(b => b.bookId === bookId);
    
    if (!book) {
      return {
        success: false,
        error: "Book not found",
      };
    }
    
    return {
      success: true,
      data: book,
    };
  } catch (error) {
    console.error("Error fetching book:", error);
    return {
      success: false,
      error: "Failed to fetch book",
    };
  }
}

/**
 * Get library stats
 */
export async function getLibraryStats() {
  try {
    const books = await fetchAllBooks();
    
    const stats = {
      totalBooks: books.length,
      totalCopies: books.reduce((sum, book) => sum + book.totalCopies, 0),
      availableCopies: books.reduce((sum, book) => sum + book.availableCopies, 0),
      issuedCopies: books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0),
    };
    
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching library stats:", error);
    return {
      success: false,
      error: "Failed to fetch library stats",
    };
  }
}
