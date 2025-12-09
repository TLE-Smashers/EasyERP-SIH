# Faculty Request System - Demo Data Setup

## Prerequisites
You need to set up data in the Super Master Sheet with proper IDs matching.

## Super Master Sheet Structure

### 1. Institutions Tab (Must have Sheet IDs)
**Columns:** A=Institution ID | B=Name | C=Sheet ID | D=Type | E=Status

```
INST-1765224277144 | GEC Bilaspur | 1AbCdEfGhIjKlMnOpQrStUvWxYz123456789 | college | active
INST-1765224405904 | Purnima Institute | 1XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ987654321 | college | active
```

**How to get Sheet ID:**
- Open the institution's Google Sheet
- Copy the ID from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Paste in Column C

### 2. Faculty Tab (Faculty data for discovery)
**Columns:** A=Faculty ID | B=Full Name | C=Email | D=Institution ID | E=Institution Name | F=Department | G=Specialization | H=Designation | I=Status

```
FAC-001 | Dr. Rajesh Kumar | rajesh.kumar@gecbilaspur.edu | INST-1765224277144 | GEC Bilaspur | Computer Science | Data Structures | Professor | active
FAC-002 | Dr. Priya Singh | priya.singh@purnima.edu | INST-1765224405904 | Purnima Institute | Information Technology | AI/ML | Assistant Professor | active
FAC-003 | Dr. Amit Sharma | amit.sharma@gecbilaspur.edu | INST-1765224277144 | GEC Bilaspur | Electronics | VLSI Design | Associate Professor | active
```

**Important:**
- ✅ Institution ID (Column D) MUST match Institutions tab Column A
- ✅ Status (Column I) MUST be "active" (lowercase)
- ✅ Email (Column C) MUST be filled
- ✅ Institution Name should match (for display)

## Test Flow

### Student Side (e.g., from Purnima Institute):
1. Login as student: `student1@test.com`
2. Go to: Dashboard → Faculty Consultation → Request Faculty
3. You'll see: Dr. Rajesh Kumar, Dr. Amit Sharma (from GEC Bilaspur)
4. Click on Dr. Rajesh Kumar
5. Fill: Subject, Topic, Description
6. Click "Send Request"

### Faculty Side (GEC Bilaspur):
1. Login as faculty: `rajesh.kumar@gecbilaspur.edu`
2. Go to: Dashboard → Student Requests → Pending Requests
3. You'll see request from Anshu Bhagat (Purnima Institute)
4. Click to open chat
5. Fill: Date, Time, Meet Link
6. Click "Accept Request"

## Expected Data in Faculty_Requests Sheet (GEC Bilaspur)

```
REQ-1733716625353 | student1@test.com | Anshu Bhagat | INST-1765224405904 | Purnima Institute | rajesh.kumar@gecbilaspur.edu | Dr. Rajesh Kumar | INST-1765224277144 | GEC Bilaspur | DSA | Binary Search Tree | I would like to learn BST | | | | pending | | 2025-12-09T01:43:45.353Z | |
```

## Common Issues

### "Institution not found" Error:
**Cause:** Institution ID mismatch between Faculty tab and Institutions tab
**Fix:** Ensure Faculty.InstitutionID exactly matches Institutions.InstitutionID

### Faculty not showing in list:
**Cause:** Status is not "active" or email is missing
**Fix:** Set Status = "active" (lowercase) in Faculty tab Column I

### Faculty can't see requests:
**Cause:** Faculty email doesn't match or Sheet ID is wrong
**Fix:** 
- Verify faculty email in Faculty tab matches their login email
- Verify Sheet ID in Institutions tab is correct (copy from URL)

### Request creation fails:
**Cause:** Missing Sheet ID in Institutions tab Column C
**Fix:** Add the actual Google Sheet ID for each institution

## Environment Variables Check

Make sure your `.env.local` has:
```
SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI
GOOGLE_SHEETS_ID=<your-institution-sheet-id>
CURRENT_INSTITUTION_ID=INST-1765224405904
CURRENT_INSTITUTION_NAME=Purnima Institute
```
