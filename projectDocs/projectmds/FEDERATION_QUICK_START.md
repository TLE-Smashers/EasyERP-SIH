# 🚀 Federation System - Quick Start Guide

## ⚡ Get Started in 30 Minutes

This guide will get your multi-institution resource sharing system up and running quickly.

---

## 📋 Prerequisites Checklist

- [ ] Existing EasyERP system running
- [ ] Google Sheets API enabled
- [ ] Service account JSON key file
- [ ] Admin access to Google Sheets

---

## 🎯 Step 1: Create Super Master Sheet (10 minutes)

### 1.1 Create the Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create new spreadsheet
3. Rename it to: **EasyERP-Federation-Master**
4. **Copy the Sheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

### 1.2 Create Required Tabs

Create these 7 tabs (click "+" at bottom):

**Tab 1: Institutions**
```
institutionId	institutionName	institutionCode	location	city	state	type	sheetId	contactEmail	contactPerson	phoneNumber	website	status	joinedDate	lastSyncDate	partnerInstitutions
```

**Tab 2: Shared_Ebooks**
```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	institutionId	institutionName	availableFor	accessType	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Tab 3: Shared_Notes**
```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	institutionId	institutionName	availableFor	accessType	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

**Tab 4: Access_Logs**
```
logId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	userRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	accessDate	action	status	ipAddress	deviceInfo
```

**Tab 5: Search_Index**
```
indexId	resourceId	resourceType	title	keywords	author	category	subject	institutionId	institutionName	availability	accessType	addedDate	downloads	rating
```

**Tab 6: Sharing_Requests**
```
requestId	resourceType	resourceId	resourceTitle	requestedBy	requestedByName	requestedByRole	requestingInstitutionId	requestingInstitutionName	ownerInstitutionId	ownerInstitutionName	requestDate	status	approvedBy	approvedDate	rejectionReason	expiryDate
```

**Tab 7: Partnerships**
```
partnershipId	institution1Id	institution1Name	institution2Id	institution2Name	partnershipType	startDate	endDate	status	resourcesSharingEnabled	notesEnabled	ebooksEnabled	createdBy	createdDate
```

### 1.3 Add Your Institution Entry

In **Institutions** tab, add Row 2:
```
INST001	<Your College Name>	<SHORT-CODE>	<City, State>	<City>	<State>	government	<YOUR_CURRENT_SHEET_ID>	admin@college.edu	Dr. Admin	+91-1234567890	https://college.edu	active	2024-12-08		
```

Replace values in angle brackets with your actual data.

### 1.4 Share with Service Account

1. Click **"Share"** button (top right)
2. Add your service account email (from JSON file)
3. Give **"Editor"** access
4. Click **"Done"**

---

## 🏢 Step 2: Update Your Institution Sheet (5 minutes)

### 2.1 Add Two New Tabs

Open your existing institution Google Sheet and add:

**Tab: My_Ebooks**
```
ebookId	title	author	isbn	publishedYear	category	subject	description	fileUrl	fileSize	fileType	coverImageUrl	uploadedBy	uploadedByName	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	rating	addedDate	lastUpdated	tags	language	pageCount	isActive
```

**Tab: My_Notes**
```
noteId	title	subject	topic	course	semester	branch	description	fileUrl	fileType	fileSize	facultyId	facultyName	facultyEmail	isShared	sharedWith	shareDate	sharedBy	syncStatus	federationId	downloads	views	rating	uploadDate	lastUpdated	tags	academicYear	isActive
```

---

## ⚙️ Step 3: Configure Environment (3 minutes)

### 3.1 Update `.env.local`

Add these lines to your `.env.local` file:

```bash
# Federation Configuration
SUPER_MASTER_SHEET_ID=<your_super_master_sheet_id>
CURRENT_INSTITUTION_ID=INST001
CURRENT_INSTITUTION_NAME=Your College Name
CURRENT_INSTITUTION_CODE=SHORT-CODE
```

Replace `<your_super_master_sheet_id>` with the ID you copied in Step 1.1.

### 3.2 Verify Existing Variables

Make sure you still have:
```bash
GOOGLE_SHEETS_ID=<your_institution_sheet_id>
GOOGLE_SHEET_NAME=Users
GOOGLE_APPLICATION_CREDENTIALS=./easy-erp-441110-2adce5f9d699.json
```

---

## 🧪 Step 4: Test the Setup (5 minutes)

### 4.1 Test Super Master Access

Run this command in terminal:

```bash
cd /Users/kanhaiyalalsahu/Documents/Devs/SIH\ Finals/easy-erp-sih/EasyERP-SIH

npx tsx -e "
import { google } from 'googleapis';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'easy-erp-441110-2adce5f9d699.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SUPER_MASTER_SHEET_ID,
    range: 'Institutions!A1:P2',
  });
  
  console.log('✅ Super Master Sheet accessible!');
  console.log('Data:', response.data.values);
}

test().catch(console.error);
"
```

**Expected Output:**
```
✅ Super Master Sheet accessible!
Data: [
  ['institutionId', 'institutionName', ...],
  ['INST001', 'Your College Name', ...]
]
```

### 4.2 Test Institution Sheet Access

```bash
npx tsx -e "
import { google } from 'googleapis';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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
  console.log('✅ Institution Sheet Tabs:', sheetNames);
  console.log('Has My_Ebooks?', sheetNames?.includes('My_Ebooks') ? '✅' : '❌');
  console.log('Has My_Notes?', sheetNames?.includes('My_Notes') ? '✅' : '❌');
}

test().catch(console.error);
"
```

**Expected Output:**
```
✅ Institution Sheet Tabs: ['Users', 'Admissions', ..., 'My_Ebooks', 'My_Notes']
Has My_Ebooks? ✅
Has My_Notes? ✅
```

---

## 🎨 Step 5: Add Sample Data (Optional - 5 minutes)

### 5.1 Add Sample Ebook

In **Super Master → Shared_Ebooks** tab, add Row 2:

```
EBOOK-TEST-001	Introduction to Algorithms	Thomas Cormen	978-0262033848	2009	textbook	Computer Science	Comprehensive algorithms guide	https://drive.google.com/file/d/sample123	15MB	pdf		prof.test@college.edu	Prof. Test	INST001	Your College Name	all	public	0		2024-12-08			algorithms,programming	English	1312	TRUE
```

### 5.2 Add Sample Note

In **Super Master → Shared_Notes** tab, add Row 2:

```
NOTE-TEST-001	Operating Systems Basics	Operating Systems	Process Management	B.Tech CSE	4	Computer Science	CPU scheduling notes	https://drive.google.com/file/d/sample456	pdf	2MB	FAC001	Dr. Faculty	prof.faculty@college.edu	INST001	Your College Name	all	public	0	0		2024-12-08			os,scheduling	2023-24	TRUE
```

---

## 🔄 Step 6: Restart Development Server (2 minutes)

```bash
# Stop current server (Ctrl+C)

# Clear any caches
rm -rf .next

# Restart
pnpm dev
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Super Master Sheet created with 7 tabs
- [ ] Institution entry added to Institutions tab
- [ ] Service account has Editor access to Super Master
- [ ] My_Ebooks tab added to institution sheet
- [ ] My_Notes tab added to institution sheet
- [ ] `.env.local` updated with federation variables
- [ ] Test commands run successfully
- [ ] Dev server restarted

---

## 🎯 What's Next?

Now that the foundation is set up, you can:

1. **Add More Institutions**: Repeat Step 2 for other colleges
2. **Build UI Components**: Create pages to browse shared resources
3. **Implement Sharing**: Add "Share" buttons for faculty uploads
4. **Enable Search**: Build cross-institution search interface
5. **Add Analytics**: Show federation statistics dashboard

---

## 🐛 Troubleshooting

### Issue: "Cannot access Super Master Sheet"
**Solution:**
- Verify SUPER_MASTER_SHEET_ID in `.env.local`
- Check service account has Editor access
- Ensure sheet exists and tabs are named correctly

### Issue: "My_Ebooks or My_Notes not found"
**Solution:**
- Check tab names are spelled exactly: `My_Ebooks` and `My_Notes`
- Verify you're working with correct institution sheet
- Re-share institution sheet with service account

### Issue: Test commands fail
**Solution:**
- Run `pnpm install tsx dotenv` if needed
- Check GOOGLE_APPLICATION_CREDENTIALS path is correct
- Verify all environment variables are set

---

## 📊 Sample Multi-Institution Setup

If you want to test with multiple institutions:

### Institution 2 Setup:
1. Create another Google Sheet for "XYZ College"
2. Add to Super Master Institutions:
   ```
   INST002	XYZ College	XYZ-COL	Delhi, Delhi	Delhi	Delhi	private	<XYZ_SHEET_ID>	admin@xyz.edu	Dr. XYZ	+91-9876543210	https://xyz.edu	active	2024-12-08		INST001
   ```
3. Add same tabs structure
4. Share some ebooks with `availableFor` = `INST001,INST002`

Now students from INST001 can access resources from INST002!

---

## 📞 Support

**Files Created:**
- ✅ `/src/types/federation.ts` - Type definitions
- ✅ `/src/lib/google/sheets.federation.ts` - Helper functions
- ✅ `/src/actions/federation/` - Server actions (5 files)

**Documentation:**
- ✅ `/projectDocs/projectmds/FEDERATION_SETUP_GUIDE.md` - Detailed guide
- ✅ `/projectDocs/projectmds/FEDERATION_QUICK_START.md` - This file

**Next Implementation:**
- 🔜 UI Components (Shared Resources page)
- 🔜 Faculty upload with sharing option
- 🔜 Cross-institution search
- 🔜 Federation dashboard

---

**Setup Time:** 30 minutes  
**Status:** Foundation Complete ✅  
**Ready For:** UI Implementation

**Last Updated:** December 8, 2025
