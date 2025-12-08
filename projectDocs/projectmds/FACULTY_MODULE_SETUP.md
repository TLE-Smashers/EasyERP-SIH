# Faculty Module Complete Setup Guide

## Overview
The Faculty Module has been fully updated with real Google Sheets integration. Faculty members can now manage students, mark attendance, and enter marks for their branch.

## Login Credentials
- **Email**: faculty@test.com
- **Password**: 12345

## What's New

### 1. Students View (`/dashboard/faculty/students`)
✅ **Now uses real data from Google Sheets**
- Shows only students from faculty's branch
- Filters by year and section
- Search by name, ID, email, or roll number
- Displays: Student ID, Roll Number, Name, Email, Phone, Year, Section, Batch

### 2. Student Attendance (`/dashboard/faculty/attendance`)
✅ **Complete attendance marking system**
- Select date, year, section, and subject
- Loads students from faculty's branch automatically
- Mark status: Present, Absent, or Late
- Bulk actions: Mark all present/absent
- Duplicate prevention: Won't allow marking same class twice
- Saves to `StudentAttendance` sheet in Google Sheets

### 3. Marks Management (`/dashboard/faculty/marks`)
✅ **Already had real data integration**
- Create exams with all details
- Enter marks for students
- Track exam status

## Google Sheets Setup

### New Sheet Required: `StudentAttendance`

Create this sheet in your Google Sheets with these columns (Row 1):

```
attendanceId | date | studentId | studentName | rollNumber | branch | year | section | subject | status | facultyId | facultyName | remarks | markedAt
```

Leave Row 1 as headers. Data will start from Row 2.

## Faculty Table Requirements

The faculty record in the Faculty sheet must have:
- ✅ Email: faculty@test.com
- ✅ Password: 12345 (plain text in sheet)
- ✅ Status: active
- ✅ **Department/Branch**: Must match student branches (e.g., "CSE", "ECE", "Mechanical")

**Important**: The `department` field in Faculty sheet is used to filter students. Make sure it matches the `branch` field in student records.

## How It Works

### Student Access Control
1. Faculty logs in with faculty@test.com
2. System fetches faculty details from Faculty sheet
3. Reads faculty's `department` field (e.g., "CSE")
4. Shows only students where `branch = "CSE"`

### Attendance Flow
1. Faculty selects: Date, Year, Section, Subject
2. System loads students from faculty's branch
3. Faculty marks: Present, Absent, or Late
4. System validates (no duplicates, all marked)
5. Saves to StudentAttendance sheet with timestamp

### Marks Flow
1. Faculty creates an exam
2. Saves to Exams sheet
3. Faculty clicks "Enter Marks"
4. Enters marks for each student
5. Saves to Marks sheet with grades

## New Files Created

### Server Actions:
- `src/actions/faculty/getStudentsByBranch.ts` - Fetch students by branch
- `src/actions/faculty/studentAttendanceActions.ts` - Save attendance
- `src/actions/faculty/getFaculty.ts` - Added `getFacultyByEmail()` function

### Google Sheets Integration:
- `src/lib/google/sheets.studentAttendance.ts` - Student attendance CRUD

### Updated Pages:
- `src/app/dashboard/faculty/students/page.tsx` - Real data
- `src/app/dashboard/faculty/attendance/page.tsx` - Complete rewrite
- `src/app/dashboard/faculty/marks/page.tsx` - Already working

## Features Implemented

### ✅ Branch-Based Filtering
Faculty only see students from their department/branch

### ✅ Real-Time Stats
Dynamic counters for students, attendance, marks

### ✅ Duplicate Prevention
Checks if attendance already exists for date + class + subject

### ✅ Bulk Actions
Mark all students present/absent with one click

### ✅ Search & Filter
Search students by name, ID, email
Filter by year and section

### ✅ Validation
- All required fields checked
- Date validation (no future dates)
- Status checks (only active students)

## Testing Steps

1. **Login**
   ```
   Email: faculty@test.com
   Password: 12345
   ```

2. **Test Students View**
   - Navigate to "My Students"
   - Verify students from faculty's branch appear
   - Try search and filters

3. **Test Attendance**
   - Navigate to "Student Attendance"
   - Select year and subject
   - Verify students load
   - Mark attendance (Present/Absent/Late)
   - Click "Save Attendance"
   - Check Google Sheets for new row in StudentAttendance

4. **Test Marks**
   - Navigate to "Marks Management"
   - Click "Create Exam"
   - Fill details and save
   - Click "Enter Marks" on the exam
   - Enter marks and save

## Troubleshooting

### No Students Showing?
- Check faculty's `department` matches student `branch` exactly
- Verify students have status = "active"
- Check Google Sheets API is working

### Attendance Not Saving?
- Check StudentAttendance sheet exists
- Verify all columns are present
- Check Google Sheets write permissions

### Faculty Not Found?
- Verify faculty@test.com exists in Faculty sheet
- Check status is "active"
- Verify password is "12345"

## Environment Variables

Required in `.env.local`:
```
GOOGLE_SERVICE_ACCOUNT_KEY=...
GOOGLE_SHEETS_ID=...
NEXT_PUBLIC_FACULTY_SHEET_ID=...
```

## Summary

✅ Real Google Sheets integration
✅ Branch-based student access
✅ Complete attendance marking
✅ Marks management working
✅ No mock data
✅ All CRUD operations functional

The faculty module is now production-ready with full Google Sheets integration!
