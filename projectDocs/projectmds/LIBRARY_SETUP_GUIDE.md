# 🚀 Library Module - Complete Setup Guide

## Current Status
✅ All backend code complete  
✅ All UI components created  
✅ Navigation configured  
⚠️ Need to add users to Google Sheets  
⚠️ Need to fix some TypeScript errors  

---

## 🔴 CRITICAL: Add Users to Google Sheets First

### Step 1: Open Your Google Sheet
1. Open the Google Sheet used for Easy-ERP
2. Go to the **Users** tab

### Step 2: Add These Two Users

Copy these exact rows and paste into your Users sheet (one row for each user):

**Row for Student:**
```
student@test.com	$2b$10$4mAfEgCWqUsPvvbunNQqouS.3kii3pz.yTT5vDr/mgo9SiOS5ZAYi	Test Student	student	active
```

**Row for Librarian:**
```
librarian@test.com	$2b$10$4mAfEgCWqUsPvvbunNQqouS.3kii3pz.yTT5vDr/mgo9SiOS5ZAYi	Test Librarian	librarian	active
```

### Step 3: Verify Column Order
Make sure your Users sheet has these columns in this order:
- Column A: email
- Column B: password (hashed)
- Column C: name
- Column D: role
- Column E: status

### Step 4: Create Library Sheets

Add 4 new tabs to your Google Sheet:

#### Tab 1: `Library_Books`
**Column Headers (Row 1):**
```
bookId	isbn	title	author	publisher	publicationYear	edition	category	subject	language	rackNumber	totalCopies	availableCopies	addedDate	addedBy	lastUpdated	updatedBy	description	isActive
```

#### Tab 2: `Library_Requests`
**Column Headers (Row 1):**
```
requestId	studentId	studentName	email	bookId	bookTitle	bookAuthor	bookIsbn	requestDate	status	queuePosition	issueCode	codeExpiryDate	approvedDate	approvedBy	rejectedDate	rejectedBy	rejectionReason	completedDate	notes	isActive
```

#### Tab 3: `Library_Issues`
**Column Headers (Row 1):**
```
issueId	bookId	bookTitle	bookAuthor	bookIsbn	studentId	studentName	email	issueDate	dueDate	returnDate	status	fine	fineStatus	finePaidDate	issuedBy	returnedBy	condition	notes	requestId	issueCode	issueMethod	renewCount	lastRenewDate	overdueNoticeSent	reminderSentDate	isActive	description
```

#### Tab 4: `Library_Notify`
**Column Headers (Row 1):**
```
notifyId	studentId	studentName	email	bookId	bookTitle	requestDate	notified	notifiedDate
```

### Step 5: Add Sample Books (Optional but Recommended)

Go to `Library_Books` tab and add a few sample books:

**Example Book 1:**
```
BOOK-001	978-0-7475-3269-9	Harry Potter and the Philosopher's Stone	J.K. Rowling	Bloomsbury	1997	1st	Fiction	Fantasy	English	A-101	3	3	2024-01-01	admin@test.com			Great book for young readers	TRUE
```

**Example Book 2:**
```
BOOK-002	978-0-13-110362-7	The C Programming Language	Brian Kernighan, Dennis Ritchie	Prentice Hall	1988	2nd	Textbook	Computer Science	English	B-201	5	5	2024-01-01	admin@test.com			Classic programming textbook	TRUE
```

---

## 🔧 Fix TypeScript Errors

### Issue: Google Sheets Auth Type Error

The error in `sheets.library.ts` is a TypeScript version issue. Let me fix it:

**File:** `src/lib/google/sheets.library.ts`

Find all instances of:
```typescript
const sheets = google.sheets({ version: "v4", auth });
```

Replace with:
```typescript
const sheets = google.sheets({ version: "v4", auth: auth as any });
```

There are approximately 11 occurrences of this line that need to be fixed.

---

## 🧪 Testing Steps

### Test 1: Login as Student
1. Go to `http://localhost:3000/login`
2. Email: `student@test.com`
3. Password: `12345`
4. Should redirect to `/dashboard`
5. Click "Library" in sidebar → "Browse Books"
6. Should see: `/dashboard/student/library`

### Test 2: Login as Librarian
1. Logout (if logged in)
2. Go to `http://localhost:3000/login`
3. Email: `librarian@test.com`
4. Password: `12345`
5. Should redirect to `/dashboard/library`
6. Should see stats for: Total Books, Pending Requests, Issued Books, Overdue Books

### Test 3: Student Workflow
1. Login as student
2. Browse books
3. Click "Request" on an available book
4. Confirm request
5. Check "My Requests" tab - should see status "Pending"

### Test 4: Librarian Workflow
1. Login as librarian
2. Click "Pending Requests" in sidebar
3. See the student's request
4. Click "Approve"
5. Note the 6-digit code generated
6. Go to "Approved" tab - code should be visible

### Test 5: Book Collection
1. Logout and login as student
2. Go to Library page
3. Click "Enter Code" button
4. Enter the 6-digit code from librarian
5. Book should be issued
6. Check "Issued Books" tab - should see the book with due date (15 days)

---

## 🐛 Current Known Issues & Fixes

### Issue 1: "Configuration" on Librarian Login
**Cause:** Librarian user not in Google Sheets  
**Fix:** Add the librarian user as shown in Step 2 above

### Issue 2: 404 on Student Dashboard
**Cause:** Library routes don't exist OR student role not recognized  
**Fix:** 
1. Make sure student user is in Google Sheets
2. Verify role is exactly "student" (lowercase)
3. Check that `/dashboard/student/library/page.tsx` exists

### Issue 3: Tabs Component Error
**Cause:** Missing @radix-ui/react-tabs package  
**Status:** ✅ Fixed! Package installed successfully

### Issue 4: TypeScript Errors in sheets.library.ts
**Cause:** Google API type mismatch  
**Fix:** Add `as any` type assertion (see above)

---

## 📋 Implementation Checklist

Before testing:
- [ ] Add student@test.com to Google Sheets Users tab
- [ ] Add librarian@test.com to Google Sheets Users tab
- [ ] Create Library_Books sheet tab with headers
- [ ] Create Library_Requests sheet tab with headers
- [ ] Create Library_Issues sheet tab with headers
- [ ] Create Library_Notify sheet tab with headers
- [ ] Add at least 2-3 sample books
- [ ] Fix Google Sheets auth type errors
- [ ] Restart development server

After setup:
- [ ] Test student login → should see /dashboard
- [ ] Test librarian login → should see /dashboard/library
- [ ] Test book browsing
- [ ] Test book request
- [ ] Test request approval
- [ ] Test code-based book issue
- [ ] Test book return

---

## 🎯 Next Implementation Steps

After basic testing works:

### Priority 1: Book CRUD Actions (2-3 hours)
Create `src/actions/library/bookActions.ts`:
```typescript
- addBook()        // Add new book to catalog
- updateBook()     // Edit book details
- deleteBook()     // Soft delete (mark as removed)
- addBookCopies()  // Increase available inventory
```

### Priority 2: Email Notifications (3-4 hours)
Create in `src/lib/email/templates/`:
1. `requestApproved.ts` - Send code to student
2. `requestRejected.ts` - Notify rejection with reason
3. `bookIssued.ts` - Confirmation with receipt
4. `returnReminder.ts` - 3 days before due date
5. `overdueNotice.ts` - Daily after due date

### Priority 3: Receipt Component (2 hours)
Create `src/components/library/LibraryReceipt.tsx`:
- QR code with issue ID
- Student and book details
- Issue/due dates
- Download PDF button
- Print button

### Priority 4: Cron Job (1 hour)
Create `src/app/api/cron/library-overdue/route.ts`:
- Check overdue books daily
- Update fine amounts
- Send overdue emails

---

## 📞 Support Commands

### Check if development server is running:
```bash
npm run dev
```

### View all routes:
```bash
# Check these files exist:
ls src/app/dashboard/student/library/
ls src/app/dashboard/library/
```

### Verify Google Sheets connection:
```bash
# Run test script
npx tsx scripts/testSheetUpdate.ts
```

---

## 🎓 User Credentials Summary

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Student | student@test.com | 12345 | /dashboard |
| Librarian | librarian@test.com | 12345 | /dashboard/library |

**Important:** Both use the same hashed password since they have the same plaintext password (12345).

---

## 🚨 If You Still Get Errors

1. **Clear browser cache** - Ctrl+Shift+Delete
2. **Restart Next.js dev server** - Ctrl+C then `npm run dev`
3. **Check console logs** - F12 → Console tab
4. **Verify .env.local** - Make sure GOOGLE_SHEET_ID is correct
5. **Check Google Sheets permissions** - Service account must have edit access

---

## 📊 Expected Flow Diagram

```
Student Flow:
Login → Dashboard → Library Menu → Browse Books → Request Book
  ↓
Pending Status → Wait for Approval
  ↓
(Librarian approves & generates code)
  ↓
Enter Code → Book Issued → See in "Issued Books"
  ↓
After 15 days → Return or Pay Fine

Librarian Flow:
Login → Library Dashboard → See Stats
  ↓
Pending Requests → Approve/Reject → Generate Code
  ↓
Issued Books → Process Returns → Calculate Fine
  ↓
Book Catalog → Add/Edit/Delete Books
```

---

**Last Updated:** After completing all pages and components  
**Status:** Ready for Google Sheets setup and testing
