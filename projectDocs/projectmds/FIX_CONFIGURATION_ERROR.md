# 🔴 URGENT: Complete These Steps to Fix "Configuration" Error

## The Problem
The librarian user exists in your Users sheet ✅, but the **Library sheets are missing** ❌

When the librarian logs in, the system tries to fetch library data from Google Sheets, but can't find the `Library_Books`, `Library_Requests`, etc. tabs, causing it to fail.

## 🚨 IMMEDIATE FIX - Create 4 Library Sheets

### Step 1: Create Library_Books Tab

1. In your Google Sheet, click the **"+"** button at the bottom to add a new sheet
2. **Right-click the new tab** → **Rename** to exactly: `Library_Books`
3. In **Row 1** (header row), paste these column names in order:

```
bookId	isbn	title	author	publisher	publicationYear	edition	category	subject	language	rackNumber	totalCopies	availableCopies	addedDate	addedBy	lastUpdated	updatedBy	description	isActive
```

**Copy this row for testing (Row 2):**
```
BOOK-001	978-0-7475-3269-9	Harry Potter	J.K. Rowling	Bloomsbury	1997	1st	Fiction	Fantasy	English	A-101	3	3	2024-01-01	admin@test.com			Great book	TRUE
```

### Step 2: Create Library_Requests Tab

1. Add another new sheet
2. Rename to: `Library_Requests`
3. In **Row 1**, paste:

```
requestId	studentId	studentName	email	bookId	bookTitle	bookAuthor	bookIsbn	requestDate	status	queuePosition	issueCode	codeExpiryDate	approvedDate	approvedBy	rejectedDate	rejectedBy	rejectionReason	completedDate	notes	isActive
```

(No data rows needed yet - students will create requests)

### Step 3: Create Library_Issues Tab

1. Add another new sheet
2. Rename to: `Library_Issues`
3. In **Row 1**, paste:

```
issueId	bookId	bookTitle	bookAuthor	bookIsbn	studentId	studentName	email	issueDate	dueDate	returnDate	status	fine	fineStatus	finePaidDate	issuedBy	returnedBy	condition	notes	requestId	issueCode	issueMethod	renewCount	lastRenewDate	overdueNoticeSent	reminderSentDate	isActive	description
```

(No data rows needed yet)

### Step 4: Create Library_Notify Tab

1. Add one more new sheet
2. Rename to: `Library_Notify`
3. In **Row 1**, paste:

```
notifyId	studentId	studentName	email	bookId	bookTitle	requestDate	notified	notifiedDate
```

(No data rows needed yet)

## ✅ Verify Your Sheet Tabs

After creating all 4 tabs, you should see these tabs at the bottom of your Google Sheet:

- sheet 1 (Users tab)
- Library_Books ← NEW
- Library_Requests ← NEW
- Library_Issues ← NEW
- Library_Notify ← NEW
- AdmissionsForm
- Admissions
- (other existing tabs...)

## 🧪 Test Again

1. **Refresh your browser** completely (Ctrl+Shift+R)
2. Go to login page: http://localhost:3000/login
3. Login as:
   - Email: `librarian@test.com`
   - Password: `12345`
4. **Expected:** Should redirect to `/dashboard/library` and show:
   - Total Books: 1
   - Pending Requests: 0
   - Issued Books: 0
   - Overdue Books: 0

## 🔍 If Still Shows "Configuration"

1. **Check browser console** (F12 → Console tab) for errors
2. **Check the terminal** where `npm run dev` is running for errors
3. **Verify sheet names** are EXACTLY as written (case-sensitive):
   - `Library_Books` (not Library Books or library_books)
   - `Library_Requests`
   - `Library_Issues`
   - `Library_Notify`

## 🎯 Quick Checklist

- [ ] Created `Library_Books` tab with 19 column headers
- [ ] Added at least 1 sample book to test
- [ ] Created `Library_Requests` tab with 21 column headers
- [ ] Created `Library_Issues` tab with 28 column headers (yes, 28!)
- [ ] Created `Library_Notify` tab with 9 column headers
- [ ] All sheet names match EXACTLY (case-sensitive)
- [ ] Refreshed browser completely
- [ ] Retried librarian login

## 💡 Why This Happens

The library module code tries to fetch data from these 4 sheets on page load. If any sheet is missing, Google Sheets API returns an error, causing the "Configuration" message instead of showing the dashboard.

## 📞 Still Having Issues?

Share the error from:
1. Browser console (F12 → Console tab)
2. Terminal where `npm run dev` is running

This will help identify the exact issue!

---

**Quick Copy-Paste Headers:**

**Library_Books:**
```
bookId	isbn	title	author	publisher	publicationYear	edition	category	subject	language	rackNumber	totalCopies	availableCopies	addedDate	addedBy	lastUpdated	updatedBy	description	isActive
```

**Library_Requests:**
```
requestId	studentId	studentName	email	bookId	bookTitle	bookAuthor	bookIsbn	requestDate	status	queuePosition	issueCode	codeExpiryDate	approvedDate	approvedBy	rejectedDate	rejectedBy	rejectionReason	completedDate	notes	isActive
```

**Library_Issues:**
```
issueId	bookId	bookTitle	bookAuthor	bookIsbn	studentId	studentName	email	issueDate	dueDate	returnDate	status	fine	fineStatus	finePaidDate	issuedBy	returnedBy	condition	notes	requestId	issueCode	issueMethod	renewCount	lastRenewDate	overdueNoticeSent	reminderSentDate	isActive	description
```

**Library_Notify:**
```
notifyId	studentId	studentName	email	bookId	bookTitle	requestDate	notified	notifiedDate
```
