# Book CRUD Implementation - Testing Guide

## ✅ Implementation Complete (Updated)

The Book Management CRUD operations have been successfully implemented with all requested fixes:

### Recent Fixes Applied

1. **Delete Book - Hard Delete** ✅
   - Now actually removes the entire book row from Google Sheets
   - Previous: Soft delete (set copies to 0)
   - Now: Complete row deletion using Google Sheets API

2. **Missing Form Fields Added** ✅
   - Added: Subject field
   - Added: Edition field
   - Added: Rack Number field
   - Added: Cover Image URL field
   - All fields now sync with Google Sheets columns

3. **User Attribution Fixed** ✅
   - Previous: Used email (e.g., "librarian@test.com")
   - Now: Uses user's name (e.g., "Test Librarian")
   - Applies to: addedBy and updatedBy columns

### Features Implemented

1. **Add Book**
   - Full form with all fields:
     - Title, Author, ISBN, Category (required)
     - Total Copies (required)
     - Publisher, Publication Year
     - **Subject** (new)
     - **Edition** (new, defaults to "1st")
     - **Rack Number** (new)
     - **Cover Image URL** (new)
     - Description
   - Server-side validation for required fields
   - Authentication check
   - Auto-generates bookId (BOOK-001, BOOK-002, etc.)
   - Sets initial available copies = total copies
   - Tracks who added the book and when (using user's name)

2. **Edit Book**
   - Pre-fills form with selected book data (all fields)
   - Updates only changed fields
   - Adjusts available copies when total copies change
   - Tracks who updated and when (using user's name)
   - Validates bookId exists

3. **Delete Book**
   - Confirmation dialog before deletion
   - **Hard delete - completely removes row from Google Sheets**
   - Checks if any copies are currently issued
   - Prevents deletion if books are issued
   - Shows clear error message with count of issued copies

### Files Modified

- ✅ `src/actions/library/bookActions.ts` - Server actions for CRUD operations
- ✅ `src/app/dashboard/library/books/page.tsx` - Connected actions to UI
- ✅ No TypeScript errors

## Testing Steps

### 1. Add a New Book

1. Login as librarian: `librarian@test.com` / `12345`
2. Navigate to Library → Book Catalog
3. Click "Add Book" button
4. Fill in the form:
   - Title: "Clean Code"
   - Author: "Robert C. Martin"
   - ISBN: "978-0132350884"
   - Category: "Textbook"
   - Total Copies: 3
   - Publisher: "Prentice Hall"
   - Publication Year: "2008"
   - Subject: "Software Engineering"
   - Edition: "1st"
   - Rack Number: "A-12"
   - Cover Image URL: (leave empty or add a URL)
   - Description: "A handbook of agile software craftsmanship"
5. Click "Add Book"
6. Should see success toast: "Book added successfully"
7. Book should appear in the table

**Verify in Google Sheet:**
- Open Library_Books sheet
- New row should be added with BOOK-00X ID
- All fields should match form data (including subject, edition, rack number, cover image URL)
- Available Copies should equal Total Copies
- **Added By** should show "Test Librarian" (or your user's name), not email
- **Updated By** should show "Test Librarian" (or your user's name), not email

### 2. Edit a Book

1. Find the book you just added in the table
2. Click the pencil (Edit) icon
3. Edit dialog should open with pre-filled data
4. Change some fields:
   - Title: "Clean Code: Revised Edition"
   - Total Copies: 5 (increase from 3)
5. Click "Update Book"
6. Should see success toast: "Book updated successfully"
7. Changes should reflect in the table

**Verify in Google Sheet:**
- Title should be updated
- Total Copies should be 5
- Available Copies should be 5 (increased by 2)
- Last Updated timestamp should be updated
- **Updated By should show "Test Librarian" (or your user's name), not email**

### 3. Delete a Book (Success Case)

1. Find a book with all copies available (no issued copies)
2. Click the trash (Delete) icon
3. Confirmation dialog should appear
4. Click "Delete"
5. Should see success toast: "Book deleted successfully"
6. Book should disappear from the table

**Verify in Google Sheet:**
- **Row should be completely removed from Library_Books sheet (hard delete)**
- No trace of the book should remain

### 4. Delete a Book (Failure Case - Issued Copies)

1. Manually mark a book as having issued copies in Google Sheet:
   - Set Total Copies = 5
   - Set Available Copies = 3 (means 2 copies are issued)
2. Try to delete this book
3. Should see error toast: "Cannot delete book. 2 copies are currently issued."
4. Book should remain in the table

### 5. Search and Filter

1. Use the search bar to search for book titles
2. Try category filter dropdown
3. Click "Refresh" to reload data from Google Sheets

## Expected Behavior

### Success Cases
- ✅ Add book → Success toast + new row in sheet + refreshed table
- ✅ Edit book → Success toast + updated row in sheet + refreshed table
- ✅ Delete book (no issues) → Success toast + row removed + refreshed table

### Error Cases
- ❌ Add book without required fields → "Title, Author, and ISBN are required"
- ❌ Edit non-existent book → "Book not found"
- ❌ Delete book with issued copies → "Cannot delete book. X copies are currently issued."
- ❌ Not logged in → "Unauthorized"

## Technical Details

### Authentication
- All actions check for valid session using NextAuth
- Returns "Unauthorized" error if session missing

### Data Flow
1. **Add**: Form Data → bookActions.ts → sheets.library.ts → Google Sheets
2. **Edit**: Form Data + bookId → Find by bookId → Update by rowNumber → Google Sheets
3. **Delete**: bookId → Find by bookId → Check issued copies → Delete by rowNumber → Google Sheets

### Book ID Generation
- Format: BOOK-001, BOOK-002, etc.
- Generated in sheets.library.ts based on current book count

### Available Copies Logic
- On Add: Available Copies = Total Copies
- On Edit: If Total Copies increase by N, Available Copies increase by N
- On Edit: If Total Copies decrease by N, Available Copies decrease by N
- On Delete: Check if (Total Copies - Available Copies) > 0 (issued copies exist)

## What's Next?

After testing these CRUD operations, we can move to:

1. **Request Management**
   - View pending requests
   - Approve requests (generate 6-digit codes)
   - Bulk approve multiple requests
   - Reject requests with reason

2. **Issue/Return Management**
   - View issued books
   - Mark books as returned
   - Track overdue books
   - Handle late fees

3. **Student Features**
   - Browse available books
   - Request books
   - View issued books
   - Request notifications for unavailable books

4. **Reports & Analytics**
   - Popular books
   - Overdue reports
   - Issue history
   - Request statistics
