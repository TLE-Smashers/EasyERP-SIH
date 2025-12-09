# 🌐 Multi-Institution Federation Setup Guide

## Overview
This guide will help you set up the multi-institution resource sharing system with Super Master Sheet and Individual Institution Master Sheets.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           SUPER MASTER SHEET (Federation)           │
│  Central hub for all shared resources               │
│  - Institutions Registry                            │
│  - Shared Ebooks                                    │
│  - Shared Notes                                     │
│  - Access Logs                                      │
│  - Search Index                                     │
└─────────────────────────────────────────────────────┘
                       ↕️ API Sync
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Institution A│ │ Institution B│ │ Institution C│
│ Master Sheet │ │ Master Sheet │ │ Master Sheet │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ - Users      │ │ - Users      │ │ - Users      │
│ - Admissions │ │ - Admissions │ │ - Admissions │
│ - Library    │ │ - Library    │ │ - Library    │
│ - Hostel     │ │ - Hostel     │ │ - Hostel     │
│ - Faculty    │ │ - Faculty    │ │ - Faculty    │
│ - Payments   │ │ - Payments   │ │ - Payments   │
│ + NEW TABS → │ │ + NEW TABS → │ │ + NEW TABS → │
│ - My_Ebooks  │ │ - My_Ebooks  │ │ - My_Ebooks  │
│ - My_Notes   │ │ - My_Notes   │ │ - My_Notes   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🚀 PART 1: Super Master Sheet Setup

### Step 1.1: Create Super Master Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. **Name it:** `EasyERP-Federation-Master`
4. This will be your **Super Master Sheet**

### Step 1.2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create new one)
3. Enable **Google Sheets API** (if not already enabled)
4. Create a **Service Account** for federation access
5. Download the service account JSON key
6. Share the Super Master Sheet with the service account email

---

## 📋 PART 2: Super Master Sheet - Tab Structure

### Tab 1: `Institutions` (Registry of all partner institutions)

**Create this tab and add these column headers in Row 1:**

```
institutionId	institutionName	institutionCode	location	city	state	type	sheetId	contactEmail	contactPerson	phoneNumber	website	status	joinedDate	lastSyncDate	partnerInstitutions
```

**Sample Data (Row 2):**
```
INST001	ABC Engineering College	ABC-ENG	Jaipur, Rajasthan	Jaipur	Rajasthan	government	<YOUR_SHEET_ID>	admin@abc-eng.edu	Dr. John Smith	+91-9876543210	https://abc-eng.edu	active	2024-01-01		INST002,INST003
```

**Column Descriptions:**
- `institutionId`: Unique ID (INST001, INST002, etc.)
- `institutionCode`: Short code for the institution
- `sheetId`: Google Sheet ID of that institution's master sheet
- `partnerInstitutions`: Comma-separated list of partner institution IDs
- `status`: active | inactive | pending | suspended

---

### Tab 2: `Shared_Ebooks` (Central ebook repository)

**Create this tab and add these column headers in Row 1:**

```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	institutionId	institutionName	availableFor	accessType	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Sample Data (Row 2):**
```
EBOOK-001	Data Structures and Algorithms	Thomas H. Cormen	978-0262033848	2009	textbook	Computer Science	Comprehensive guide to algorithms	https://drive.google.com/file/d/abc123	15MB	pdf	https://example.com/cover.jpg	prof.smith@abc-eng.edu	Prof. John Smith	INST001	ABC Engineering College	all	public	150	4.5	2024-01-15		algorithms,data-structures,programming	English	1312	TRUE
```

**Column Descriptions:**
- `ebookId`: Unique ID (EBOOK-001, EBOOK-002, etc.)
- `availableFor`: Either "all" or comma-separated institution IDs (e.g., "INST002,INST003")
- `accessType`: public | partner | reciprocal | restricted
- `fileUrl`: Google Drive shareable link
- `downloads`: Number of times downloaded (updated automatically)

---

### Tab 3: `Shared_Notes` (Faculty notes repository)

**Create this tab and add these column headers in Row 1:**

```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	institutionId	institutionName	availableFor	accessType	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

**Sample Data (Row 2):**
```
NOTE-001	Operating Systems - Process Management	Operating Systems	Process Scheduling	B.Tech CSE	4	Computer Science	Detailed notes on CPU scheduling algorithms	https://drive.google.com/file/d/xyz789	pdf	2.5MB	FAC001	Dr. Jane Doe	prof.doe@abc-eng.edu	INST001	ABC Engineering College	all	public	85	320	4.7	2024-02-01		os,scheduling,cpu	2023-24	TRUE
```

**Column Descriptions:**
- `noteId`: Unique ID (NOTE-001, NOTE-002, etc.)
- `views`: Number of times viewed (not downloaded)
- `academicYear`: Academic year when notes were created

---

### Tab 4: `Access_Logs` (Track who accessed what)

**Create this tab and add these column headers in Row 1:**

```
logId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	userRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	accessDate	action	status	ipAddress	deviceInfo
```

**This tab auto-populates when users access resources. Sample data:**
```
LOG-001	ebook	EBOOK-001	Data Structures and Algorithms	student@xyz-college.edu	Rahul Kumar	student	INST002	XYZ College	INST001	ABC Engineering College	2024-03-15 10:30:00	download	success	192.168.1.1	Chrome/Windows
```

---

### Tab 5: `Search_Index` (Fast search across all resources)

**Create this tab and add these column headers in Row 1:**

```
indexId	resourceId	resourceType	title	keywords	author	category	subject	institutionId	institutionName	availability	accessType	addedDate	downloads	rating
```

**Sample Data:**
```
IDX-001	EBOOK-001	ebook	Data Structures and Algorithms	algorithms,data,structures,programming,cormen,sorting,searching	Thomas H. Cormen	textbook	Computer Science	INST001	ABC Engineering College	available	public	2024-01-15	150	4.5
```

---

### Tab 6: `Sharing_Requests` (For restricted resources)

**Create this tab and add these column headers in Row 1:**

```
requestId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	requestedByRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	requestDate	status	approvedBy	approvedDate	rejectionReason	expiryDate
```

**Used when accessType is 'restricted'. Sample:**
```
REQ-001	ebook	EBOOK-005	Advanced Machine Learning	prof.sharma@xyz-college.edu	Prof. Sharma	faculty	INST002	XYZ College	INST001	ABC Engineering College	2024-03-20	pending				
```

---

### Tab 7: `Partnerships` (Institution partnerships)

**Create this tab and add these column headers in Row 1:**

```
partnershipId	institution1Id	institution1Name	institution2Id	institution2Name	partnershipType	startDate	endDate	status	resourcesSharingEnabled	notesEnabled	ebooksEnabled	createdBy	createdDate
```

**Sample Data:**
```
PART-001	INST001	ABC Engineering College	INST002	XYZ College	reciprocal	2024-01-01		active	TRUE	TRUE	TRUE	admin@abc-eng.edu	2024-01-01
```

**Partnership Types:**
- `bilateral`: Both institutions can access each other's resources
- `reciprocal`: Access only if both share equal number of resources
- `one-way`: Only one institution shares with the other

---

## 🏢 PART 3: Individual Institution Master Sheet Setup

### Step 3.1: Modify Existing Institution Sheet

You already have institution sheets with tabs like:
- Users
- Admissions
- Library_Books
- Library_Requests
- Library_Issues
- Hostel
- Payments
- Faculty

**Now add TWO new tabs:**

---

### NEW Tab 1: `My_Ebooks` (Ebooks this institution wants to share)

**Create this tab and add these column headers in Row 1:**

```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Column Descriptions:**
- `isShared`: TRUE/FALSE - whether this ebook is shared to federation
- `sharedWith`: "all" or comma-separated institution IDs
- `syncStatus`: synced | pending | failed
- `federationId`: ID in the super master sheet (EBOOK-001, etc.)

**Sample Data:**
```
LOC-EBOOK-001	Python Programming	Mark Lutz	978-1449355739	2013	textbook	Programming	Learn Python the hard way	https://drive.google.com/file/d/abc123	5MB	pdf		prof.smith@abc-eng.edu	Prof. Smith	TRUE	all	2024-01-15	prof.smith@abc-eng.edu	synced	EBOOK-001	150	4.5	2024-01-10	2024-01-15	python,programming	English	800	TRUE
```

---

### NEW Tab 2: `My_Notes` (Faculty notes this institution wants to share)

**Create this tab and add these column headers in Row 1:**

```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

**Sample Data:**
```
LOC-NOTE-001	Database Management	Database Systems	SQL Queries	B.Tech CSE	3	Computer Science	Comprehensive SQL guide	https://drive.google.com/file/d/xyz789	pdf	3MB	FAC001	Dr. Jane Doe	prof.doe@abc-eng.edu	TRUE	all	2024-02-01	prof.doe@abc-eng.edu	synced	NOTE-001	85	320	4.7	2024-01-25	2024-02-01	sql,database	2023-24	TRUE
```

---

## 🔧 PART 4: Environment Configuration

### Step 4.1: Update `.env.local`

Add these new environment variables:

```bash
# Existing variables (keep these)
GOOGLE_SHEETS_ID=<your_institution_sheet_id>
GOOGLE_SHEET_NAME=Users

# NEW: Federation Configuration
SUPER_MASTER_SHEET_ID=<super_master_sheet_id>
CURRENT_INSTITUTION_ID=INST001
CURRENT_INSTITUTION_NAME=ABC Engineering College
CURRENT_INSTITUTION_CODE=ABC-ENG

# NEW: Service Account for Federation (optional - use same or different)
FEDERATION_SERVICE_ACCOUNT_EMAIL=<service_account_email>
# Can use same GOOGLE_APPLICATION_CREDENTIALS or create new one
```

### Step 4.2: Share Sheets Correctly

1. **Super Master Sheet:**
   - Share with federation service account email (Editor access)
   - Share with all institution admin emails (Viewer/Editor as needed)

2. **Institution Master Sheets:**
   - Each institution shares their sheet with the federation service account (Viewer access minimum)
   - Keep existing sharing settings for local admins

---

## 📝 PART 5: Quick Setup Checklist

### Super Master Sheet Setup:
- [ ] Create new Google Sheet named "EasyERP-Federation-Master"
- [ ] Create tab: `Institutions` with 16 columns
- [ ] Create tab: `Shared_Ebooks` with 26 columns
- [ ] Create tab: `Shared_Notes` with 26 columns
- [ ] Create tab: `Access_Logs` with 16 columns
- [ ] Create tab: `Search_Index` with 15 columns
- [ ] Create tab: `Sharing_Requests` with 17 columns
- [ ] Create tab: `Partnerships` with 14 columns
- [ ] Add at least one institution entry in `Institutions` tab
- [ ] Share with service account
- [ ] Copy the Sheet ID

### Institution Master Sheet Updates:
- [ ] Open your existing institution sheet
- [ ] Create new tab: `My_Ebooks` with 28 columns
- [ ] Create new tab: `My_Notes` with 28 columns
- [ ] Share with federation service account
- [ ] Update `.env.local` with new variables

### Environment Configuration:
- [ ] Add `SUPER_MASTER_SHEET_ID` to `.env.local`
- [ ] Add `CURRENT_INSTITUTION_ID` to `.env.local`
- [ ] Add `CURRENT_INSTITUTION_NAME` to `.env.local`
- [ ] Add `CURRENT_INSTITUTION_CODE` to `.env.local`

---

## 🎯 PART 6: Testing the Setup

### Test 1: Verify Super Master Sheet Access
```bash
cd /Users/kanhaiyalalsahu/Documents/Devs/SIH\ Finals/easy-erp-sih/EasyERP-SIH
npx ts-node -e "
import { google } from 'googleapis';
import * as path from 'path';

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'easy-erp-441110-2adce5f9d699.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SUPER_MASTER_SHEET_ID,
    range: 'Institutions!A1:P1',
  });
  
  console.log('✅ Super Master Sheet accessible!');
  console.log('Headers:', response.data.values);
}

test().catch(console.error);
"
```

### Test 2: Verify Institution Sheet Updates
```bash
npx ts-node -e "
import { google } from 'googleapis';
import * as path from 'path';

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'easy-erp-441110-2adce5f9d699.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const response = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  });
  
  const sheetNames = response.data.sheets?.map(s => s.properties?.title);
  console.log('✅ Available tabs:', sheetNames);
  console.log('Has My_Ebooks?', sheetNames?.includes('My_Ebooks'));
  console.log('Has My_Notes?', sheetNames?.includes('My_Notes'));
}

test().catch(console.error);
"
```

---

## 🔄 PART 7: How Data Flows

### Scenario 1: Faculty Uploads Notes to Share

1. Faculty logs into their institution's ERP
2. Goes to "My Notes" section
3. Uploads notes with subject, topic, course details
4. **Toggles "Share with other institutions"**
5. Selects sharing level: Public/Partner/Reciprocal
6. Clicks "Upload & Share"

**Backend Process:**
```
1. Save to institution's My_Notes tab
2. Sync to Super Master Sheet Shared_Notes tab
3. Generate search index entry
4. Update institution's shared resources count
5. Notify partner institutions (optional)
```

### Scenario 2: Student from Another Institution Searches

1. Student logs into their institution's ERP
2. Goes to "Shared Resources" section
3. Searches for "Operating Systems notes"
4. System queries Super Master Sheet Search_Index
5. Returns results from all institutions
6. Student clicks "View" or "Download"
7. Access is logged in Access_Logs tab

### Scenario 3: Restricted Resource Request

1. Student requests a restricted ebook
2. Request saved to Sharing_Requests tab
3. Owner institution admin gets notification
4. Admin approves/rejects
5. If approved, student gets time-limited access
6. Access is logged

---

## 🎨 PART 8: UI Features to Implement

### For Students:
- Browse shared ebooks from all institutions
- Search across all shared resources
- Filter by institution, subject, category
- Download/view shared materials
- Rate and review resources

### For Faculty:
- Upload and share notes/ebooks
- Choose sharing level (public/partner/restricted)
- View analytics (how many downloads from other institutions)
- Edit sharing settings

### For Admin:
- Federation dashboard
- View all partner institutions
- Manage partnerships
- Approve sharing requests
- View federation statistics
- Monitor resource access logs

---

## 📊 PART 9: Sample Data for Testing

Copy these into your sheets for testing:

### Institutions Tab Sample:
```
INST001	ABC Engineering College	ABC-ENG	Jaipur, Rajasthan	Jaipur	Rajasthan	government	<SHEET_ID_1>	admin@abc.edu	Dr. Smith	+91-9876543210	https://abc.edu	active	2024-01-01		INST002,INST003
INST002	XYZ Institute	XYZ-INST	Delhi, Delhi	Delhi	Delhi	private	<SHEET_ID_2>	admin@xyz.edu	Dr. Sharma	+91-9876543211	https://xyz.edu	active	2024-01-01		INST001
INST003	PQR College	PQR-COL	Mumbai, Maharashtra	Mumbai	Maharashtra	deemed	<SHEET_ID_3>	admin@pqr.edu	Dr. Patel	+91-9876543212	https://pqr.edu	active	2024-01-01		INST001
```

---

## 🚨 Important Notes

1. **Security:**
   - Never share institution master sheets with Editor access to federation service account
   - Only share what needs to be shared (My_Ebooks, My_Notes tabs)
   - Keep student personal data private

2. **Data Privacy:**
   - Don't sync personal student information
   - Only share academic resources
   - Implement proper access controls

3. **Performance:**
   - Implement caching for frequently accessed resources
   - Use batch operations for syncing
   - Consider implementing a sync schedule (every hour/daily)

4. **Scalability:**
   - Current setup works for 10-50 institutions
   - For 50+ institutions, consider moving to database
   - Monitor Google Sheets API quotas

---

## 📞 Next Steps

After completing this setup:
1. Test with sample data
2. Implement the federation helper functions
3. Build the UI components
4. Create sharing actions
5. Test cross-institution resource access
6. Deploy and monitor

**Setup Time Estimate:** 2-3 hours for complete setup

---

**Last Updated:** December 8, 2025
**Status:** Ready for implementation
