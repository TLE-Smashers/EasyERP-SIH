# 📊 Google Sheets Visual Setup Guide

## Copy-Paste Ready Headers for All Tabs

---

## 🌐 SUPER MASTER SHEET

### Tab 1: Institutions
**Copy this entire line and paste in Row 1:**
```
institutionId	institutionName	institutionCode	location	city	state	type	sheetId	contactEmail	contactPerson	phoneNumber	website	status	joinedDate	lastSyncDate	partnerInstitutions
```

**Sample Data for Row 2:**
```
INST001	ABC Engineering College	ABC-ENG	Jaipur, Rajasthan	Jaipur	Rajasthan	government	YOUR_SHEET_ID_HERE	admin@abc.edu	Dr. John Doe	+91-9876543210	https://abc.edu	active	2024-12-08		
```

---

### Tab 2: Shared_Ebooks
**Copy this entire line and paste in Row 1:**
```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	institutionId	institutionName	availableFor	accessType	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Sample Data for Row 2:**
```
EBOOK-001	Introduction to Algorithms	Thomas H. Cormen	978-0262033848	2009	textbook	Computer Science	Comprehensive guide to algorithms	https://drive.google.com/file/d/sample	15MB	pdf		prof.test@abc.edu	Prof. Test	INST001	ABC Engineering College	all	public	0		2024-12-08			algorithms,data-structures	English	1312	TRUE
```

---

### Tab 3: Shared_Notes
**Copy this entire line and paste in Row 1:**
```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	institutionId	institutionName	availableFor	accessType	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

**Sample Data for Row 2:**
```
NOTE-001	Operating Systems Basics	Operating Systems	Process Management	B.Tech CSE	4	Computer Science	CPU scheduling notes	https://drive.google.com/file/d/sample	pdf	2MB	FAC001	Dr. Faculty	prof.fac@abc.edu	INST001	ABC Engineering College	all	public	0	0		2024-12-08			os,scheduling	2023-24	TRUE
```

---

### Tab 4: Access_Logs
**Copy this entire line and paste in Row 1:**
```
logId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	userRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	accessDate	action	status	ipAddress	deviceInfo
```

**Note:** This tab will auto-populate when users access resources. No sample data needed.

---

### Tab 5: Search_Index
**Copy this entire line and paste in Row 1:**
```
indexId	resourceId	resourceType	title	keywords	author	category	subject	institutionId	institutionName	availability	accessType	addedDate	downloads	rating
```

**Note:** This tab will auto-populate when resources are shared. No sample data needed.

---

### Tab 6: Sharing_Requests
**Copy this entire line and paste in Row 1:**
```
requestId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	requestedByRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	requestDate	status	approvedBy	approvedDate	rejectionReason	expiryDate
```

**Note:** This tab will be used for restricted resources. No sample data needed initially.

---

### Tab 7: Partnerships
**Copy this entire line and paste in Row 1:**
```
partnershipId	institution1Id	institution1Name	institution2Id	institution2Name	partnershipType	startDate	endDate	status	resourcesSharingEnabled	notesEnabled	ebooksEnabled	createdBy	createdDate
```

**Sample Data for Row 2 (if you have 2 institutions):**
```
PART-001	INST001	ABC Engineering College	INST002	XYZ Institute	reciprocal	2024-12-08		active	TRUE	TRUE	TRUE	admin@abc.edu	2024-12-08
```

---

## 🏢 INSTITUTION MASTER SHEET (Each College)

### New Tab: My_Ebooks
**Copy this entire line and paste in Row 1:**
```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Sample Data for Row 2:**
```
LOC-EBOOK-001	Python Programming	Mark Lutz	978-1449355739	2013	textbook	Programming	Learn Python	https://drive.google.com/file/d/sample	5MB	pdf		prof.smith@abc.edu	Prof. Smith	TRUE	all	2024-12-08	prof.smith@abc.edu	synced	EBOOK-001	0		2024-12-08			python	English	800	TRUE
```

---

### New Tab: My_Notes
**Copy this entire line and paste in Row 1:**
```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

**Sample Data for Row 2:**
```
LOC-NOTE-001	Database Management	Database Systems	SQL Queries	B.Tech CSE	3	Computer Science	SQL guide	https://drive.google.com/file/d/sample	pdf	3MB	FAC001	Dr. Jane	prof.jane@abc.edu	TRUE	all	2024-12-08	prof.jane@abc.edu	synced	NOTE-001	0	0		2024-12-08			sql	2023-24	TRUE
```

---

## 📝 Column Descriptions

### Key Columns Explained

**institutionId**: Unique ID like INST001, INST002, etc.

**availableFor**: 
- `all` = Available to all institutions
- `INST002,INST003` = Only specific institutions

**accessType**:
- `public` = Anyone can access
- `partner` = Only partner institutions
- `reciprocal` = Only if they share too
- `restricted` = Needs approval

**isShared**: 
- `TRUE` = Shared to federation
- `FALSE` = Local only

**syncStatus**:
- `synced` = Successfully synced to federation
- `pending` = Waiting to sync
- `failed` = Sync failed

---

## 🎨 Visual Layout

### Super Master Sheet Tabs Order:
```
[Institutions] [Shared_Ebooks] [Shared_Notes] [Access_Logs] [Search_Index] [Sharing_Requests] [Partnerships]
```

### Institution Sheet Tabs Order:
```
[Users] [Admissions] [Library_Books] [Library_Requests] ... [My_Ebooks] [My_Notes]
```

---

## ✅ Quick Setup Checklist

### Super Master Sheet:
- [ ] Created new Google Sheet
- [ ] Renamed to "EasyERP-Federation-Master"
- [ ] Created tab "Institutions" with 16 columns
- [ ] Created tab "Shared_Ebooks" with 26 columns
- [ ] Created tab "Shared_Notes" with 26 columns
- [ ] Created tab "Access_Logs" with 16 columns
- [ ] Created tab "Search_Index" with 15 columns
- [ ] Created tab "Sharing_Requests" with 17 columns
- [ ] Created tab "Partnerships" with 14 columns
- [ ] Added your institution in Institutions tab
- [ ] Added sample ebook (optional)
- [ ] Added sample note (optional)
- [ ] Shared with service account (Editor)
- [ ] Copied Sheet ID

### Institution Sheet:
- [ ] Opened existing institution sheet
- [ ] Created tab "My_Ebooks" with 28 columns
- [ ] Created tab "My_Notes" with 28 columns
- [ ] Added sample data (optional)

### Environment:
- [ ] Added SUPER_MASTER_SHEET_ID to .env.local
- [ ] Added CURRENT_INSTITUTION_ID to .env.local
- [ ] Added CURRENT_INSTITUTION_NAME to .env.local
- [ ] Added CURRENT_INSTITUTION_CODE to .env.local

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Tab Names
**Correct:** `Shared_Ebooks` (underscore)  
**Wrong:** `Shared-Ebooks` (dash) or `SharedEbooks` (no separator)

### ❌ Missing Columns
Make sure all columns are present. Count them!
- Institutions: 16 columns
- Shared_Ebooks: 26 columns
- Shared_Notes: 26 columns

### ❌ Wrong Data Format
**Correct:** `TRUE` and `FALSE` (all caps)  
**Wrong:** `true`, `false`, `True`, `False`

### ❌ Wrong Separator for Lists
**Correct:** `INST001,INST002,INST003` (comma, no spaces)  
**Wrong:** `INST001, INST002, INST003` (has spaces)

---

## 🔍 How to Verify Setup

### Test 1: Check Column Count
1. Click on any tab
2. Look at the header row
3. Click the last column
4. Check the column letter matches:
   - Institutions: Column P (16 columns)
   - Shared_Ebooks: Column Z (26 columns)
   - Shared_Notes: Column Z (26 columns)

### Test 2: Check Tab Names
1. Right-click each tab
2. Select "Rename"
3. Verify exact spelling (case-sensitive!)

### Test 3: Check Service Account Access
1. Click "Share" button
2. Look for your service account email
3. Verify it says "Editor"

---

## 📊 Example Multi-Institution Setup

### Scenario: 3 Colleges Sharing Resources

**College A (INST001):**
- Shares: 5 ebooks, 10 notes
- Access from: College B, College C

**College B (INST002):**
- Shares: 3 ebooks, 8 notes
- Access from: College A, College C

**College C (INST003):**
- Shares: 7 ebooks, 12 notes
- Access from: College A, College B

**Total Shared Resources:**
- 15 ebooks available to all students
- 30 notes available to all students
- Students can search across all 3 institutions!

---

## 🎯 What Happens After Setup?

1. **Faculty uploads note** → Saves to My_Notes
2. **Faculty clicks "Share"** → System copies to Shared_Notes in Super Master
3. **System creates search index** → Makes it searchable
4. **Student from another college searches** → Finds the note
5. **Student downloads** → System logs in Access_Logs and increments counter

---

## 💾 Backup Recommendations

### Regular Backups:
1. **Super Master Sheet**: 
   - File → Make a copy (weekly)
   - Or use Google Sheets version history

2. **Institution Sheets**:
   - Already backed up by Google
   - Version history available

### Export Options:
- File → Download → Excel (.xlsx)
- File → Download → CSV (each tab separately)

---

## 🔗 Related Documentation

- **Quick Start**: `FEDERATION_QUICK_START.md`
- **Detailed Setup**: `FEDERATION_SETUP_GUIDE.md`
- **Implementation Plan**: `FEDERATION_ROADMAP.md`
- **Overview**: `FEDERATION_SUMMARY.md`

---

**Created:** December 8, 2025  
**Purpose:** Visual guide for Google Sheets setup  
**Time Required:** 20-30 minutes  
**Status:** Ready to use ✅
