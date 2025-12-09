# Super Admin Setup - Rajasthan Government ERP

## Overview

The **Government of Rajasthan** acts as the Super Admin for all government institutions' ERP systems. The existing **EasyERP-Federation-Master** sheet is used for both federation resources and super admin management.

## Google Sheet Structure

### Sheet Name: `EasyERP-Federation-Master`

This sheet already contains your federation resources. You only need to **ADD ONE NEW TAB**:

### Required New Tab: "Institutions"

Add a new tab called **"Institutions"** with these columns:

```
Column Headers (Row 1):
A: ID
B: Name
C: Code
D: Type
E: Address
F: City
G: State
H: Country
I: Pincode
J: Contact Email
K: Contact Phone
L: Principal Name
M: Spreadsheet ID
N: Status
O: Registered Date
P: Last Active
Q: Admin Count
R: Student Count
S: Faculty Count
```

### Existing Tabs (Already in place):
- ✅ **Shared_Ebooks** - E-books shared across institutions
- ✅ **LibraryResources** - General library resources
- ✅ **Shared_Notes** - Faculty notes and materials

## Setup Steps

### Step 1: Add Institutions Tab

1. Open your **EasyERP-Federation-Master** Google Sheet
2. Click the **+** button at the bottom to add a new sheet
3. Rename it to: **Institutions**
4. Add the column headers (A-S) as shown above

### Step 2: Configure Environment Variable

Your `.env.local` already has the Federation Master sheet configured:

```env
# In your .env.local file (already present)
SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI
```

✅ **No changes needed** - The super admin system will automatically use your existing `SUPER_MASTER_SHEET_ID`.

### Step 3: Create Super Admin User (Government of Rajasthan)

Run the script to generate credentials:
```bash
npx tsx scripts/addSuperAdmin.ts
```

Output will be:
```
Email: superadmin@easyerp.com
Password: SuperAdmin@2024
Hashed Password: [copy this]
```

### Step 4: Add Super Admin to Users Sheet

In your existing **Users** sheet, add a new row:

```
ID: GOV-RAJ-001
Email: rajasthan.gov@easyerp.com  (or your preferred email)
Name: Government of Rajasthan
Password: [paste the hashed password from step 3]
Role: super-admin
Department: Government
Status: active
```

**Tip**: Change the email to something like:
- `gov.rajasthan@education.raj.gov.in`
- `admin@rajasthan.gov.in`
- Or any official government email

### Step 5: Add Sample Institutions

Add some government institutions to the Institutions tab. Example rows:

#### Row 2 (Example: Government College)
```
INST-001 | Govt. College Jaipur | GCJ | college | Sector 15, JLN Marg | Jaipur | Rajasthan | India | 302017 | principal@gcj.ac.in | +91-141-1234567 | Dr. Ramesh Kumar | 1abc...xyz_sheet_id | active | 2024-01-01 | 2024-12-09 | 5 | 2500 | 120
```

#### Row 3 (Example: Government Engineering College)
```
INST-002 | Govt. Engineering College Ajmer | GECA | college | NH-8, Ajmer Road | Ajmer | Rajasthan | India | 305001 | principal@geca.ac.in | +91-145-2345678 | Dr. Priya Sharma | 1def...uvw_sheet_id | active | 2024-01-15 | 2024-12-09 | 8 | 3200 | 180
```

#### Row 4 (Example: University)
```
INST-003 | Rajasthan University | RU | university | University Road | Jaipur | Rajasthan | India | 302004 | vc@uniraj.ac.in | +91-141-2709000 | Prof. Suresh Patel | 1ghi...rst_sheet_id | active | 2024-02-01 | 2024-12-09 | 15 | 15000 | 650
```

### Step 6: Verify Sheet Access

Ensure your service account has **Editor** access to the Federation Master sheet:

1. Open the sheet
2. Click "Share"
3. Add your service account email (from `GOOGLE_SERVICE_ACCOUNT_KEY`)
4. Set permission to "Editor"
5. Click "Send"

### Step 7: Test Super Admin Login

1. Start your dev server: `pnpm dev`
2. Navigate to: `http://localhost:3000/super-admin-login`
3. Login with your government credentials
4. You should see:
   - Dashboard with statistics
   - All institutions in the Institutions tab
   - All shared resources from your 3 federation tabs

## Dashboard Features

### What Super Admin (Government) Can See:

#### 1. **Overview Statistics**
- Total registered government institutions
- Total users across all institutions
- Total students enrolled
- Shared resources count (from all 3 resource sheets)

#### 2. **Institutions Tab**
View all government institutions with:
- Institution name and code
- Location details
- Contact information
- Student/faculty counts
- Current status

#### 3. **Shared Resources Tab**
View all shared resources from:
- **E-books** (from Shared_Ebooks)
- **Documents** (from LibraryResources)
- **Notes** (from Shared_Notes)

Combined view of all resources available to institutions.

#### 4. **Analytics Tab**
- Top performing institutions
- Recent system activity
- Usage trends

## Resource Management

The Super Admin can now see resources from all three tabs:

### From Shared_Ebooks:
- Academic e-books
- Reference materials
- Digital textbooks

### From LibraryResources:
- Videos
- Documents
- Templates
- Course materials

### From Shared_Notes:
- Faculty lecture notes
- Study materials
- Course notes

All resources are automatically aggregated and displayed in the Super Admin dashboard.

## Column Mapping

### For Institution Data:
Uses the new **Institutions** tab

### For Resource Data:
Automatically reads from your existing tabs:
- **Shared_Ebooks**: Maps ebookId, title, description, category, fileUrl, etc.
- **LibraryResources**: Maps resourceId, type, title, category, fileUrl, etc.
- **Shared_Notes**: Maps noteId, title, subject, topic, fileUrl, etc.

## Environment Variables Summary

```env
# Required: Your Federation Master Sheet ID (already configured)
SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI

# Existing Google Service Account
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Existing Auth
NEXTAUTH_SECRET=your_secret_here
```

## Security Notes

1. **Single Source of Truth**: Using one sheet simplifies management
2. **Government Control**: Only government officials have super-admin role
3. **Institution Isolation**: Each institution still has its own sheet
4. **Shared Resources**: All institutions can access federation resources
5. **Audit Trail**: Track which institutions are using which resources

## Access Flow

```
Government of Rajasthan (Super Admin)
    ↓
EasyERP-Federation-Master Sheet
    ├── Institutions Tab (manage institutions)
    ├── Shared_Ebooks (view/manage e-books)
    ├── LibraryResources (view/manage resources)
    └── Shared_Notes (view/manage notes)
        ↓
Individual Institution Sheets
    ├── Institution A Sheet (Students, Faculty, Admissions, etc.)
    ├── Institution B Sheet (Students, Faculty, Admissions, etc.)
    └── Institution C Sheet (Students, Faculty, Admissions, etc.)
```

## Next Steps After Setup

1. **Add All Government Institutions**: Populate the Institutions tab
2. **Verify Resources**: Ensure existing resources are visible in dashboard
3. **Test Access**: Login and verify all features work
4. **Plan Phase 2**: Prepare for full CRUD operations

## Troubleshooting

### No resources showing in dashboard
- Check that Shared_Ebooks, LibraryResources, and Shared_Notes tabs exist
- Verify column names match exactly (case-sensitive)
- Ensure isActive = "true" or status = "active" for resources

### Can't see institutions
- Verify "Institutions" tab exists in Federation Master sheet
- Check column headers match exactly
- Ensure at least one institution is added

### Login fails
- Verify user has role = "super-admin" (not "admin")
- Check password was hashed correctly
- Ensure status = "active"

## Benefits of This Approach

✅ **Single Sheet Management**: All federation data in one place
✅ **Government Oversight**: Centralized control over all institutions
✅ **Resource Sharing**: Automatic aggregation of all shared resources
✅ **Easy Maintenance**: One sheet to manage and backup
✅ **Scalable**: Can add more institutions easily
✅ **Cost Effective**: No duplicate data or multiple sheets to sync

---

**Quick Summary**:
1. Add "Institutions" tab to your existing Federation Master sheet
2. Update .env with sheet ID
3. Create super-admin user for Government
4. Add government institutions to Institutions tab
5. Login and manage!

**Sheet Name**: EasyERP-Federation-Master
**Required New Tab**: Institutions (with 19 columns A-S)
**Existing Tabs**: Shared_Ebooks, LibraryResources, Shared_Notes ✅

---

*Government of Rajasthan - Centralized Education ERP Management*
