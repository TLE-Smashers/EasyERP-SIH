# Marks Management System - Google Sheets Setup

## Overview
This guide will help you set up the Google Sheets backend for the Faculty Marks Management System.

## Required Sheets

### 1. Exams Sheet
Create a new sheet named **"Exams"** with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| ExamId | Unique exam identifier | EXM1732377600000 |
| ExamName | Name of the exam | Mid Term Exam 2024 |
| ExamType | Type of exam | mid_term, end_term, quiz, assignment, internal, practical, project |
| Subject | Subject name | Data Structures |
| Department | Department code | CSE |
| Semester | Semester number | 3 |
| MaxMarks | Maximum marks | 100 |
| PassingMarks | Passing marks threshold | 40 |
| ExamDate | Date of exam | 2024-12-15 |
| FacultyId | Faculty email/ID | faculty@test.com |
| FacultyName | Faculty name | Prof. Kumar |
| CreatedAt | Creation timestamp | 2024-11-23T10:30:00.000Z |
| Status | Exam status | scheduled, completed, cancelled |

**Header Row (Row 1):**
```
ExamId | ExamName | ExamType | Subject | Department | Semester | MaxMarks | PassingMarks | ExamDate | FacultyId | FacultyName | CreatedAt | Status
```

### 2. Marks Sheet
Create a new sheet named **"Marks"** with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| MarksId | Unique marks identifier | MRK1732377600000_STU001 |
| ExamId | Related exam ID | EXM1732377600000 |
| ExamName | Name of the exam | Mid Term Exam 2024 |
| ExamType | Type of exam | mid_term |
| StudentId | Student unique ID | STU001 |
| StudentName | Student full name | Rahul Kumar |
| StudentEmail | Student email | rahul@example.com |
| RollNumber | Student roll number | 21CSE001 |
| Department | Department code | CSE |
| Semester | Semester number | 3 |
| Subject | Subject name | Data Structures |
| MarksObtained | Marks scored by student | 85 |
| MaxMarks | Maximum marks | 100 |
| Percentage | Calculated percentage | 85.00 |
| Grade | Calculated grade | A |
| Remarks | Optional remarks | Excellent performance |
| FacultyId | Faculty email/ID | faculty@test.com |
| FacultyName | Faculty name | Prof. Kumar |
| EnteredAt | Entry timestamp | 2024-11-23T10:30:00.000Z |
| UpdatedAt | Last update timestamp | 2024-11-23T10:30:00.000Z |

**Header Row (Row 1):**
```
MarksId | ExamId | ExamName | ExamType | StudentId | StudentName | StudentEmail | RollNumber | Department | Semester | Subject | MarksObtained | MaxMarks | Percentage | Grade | Remarks | FacultyId | FacultyName | EnteredAt | UpdatedAt
```

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```env
# Existing variables...

# Marks Management Sheets
EXAMS_SHEET_ID=your-exams-sheet-id-here
MARKS_SHEET_ID=your-marks-sheet-id-here
```

### How to Get Sheet IDs:
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
3. Copy the `SHEET_ID` part
4. Add it to your `.env.local` file

## Grading Scale

The system uses the following grading scale (configurable in code):

| Percentage | Grade |
|------------|-------|
| 90-100 | A+ |
| 80-89 | A |
| 70-79 | B+ |
| 60-69 | B |
| 50-59 | C+ |
| 40-49 | C |
| 33-39 | D |
| 0-32 | F |

## Features

### For Faculty Members:
1. **Create Exams**: Set up new exams with details like subject, department, max marks, etc.
2. **Enter Marks**: Enter marks for students in their exams
3. **Auto-grading**: System automatically calculates percentage and assigns grades
4. **View History**: See all exams created and marks entered
5. **Edit Marks**: Update marks if needed

### Exam Types Supported:
- Mid Term Exam
- End Term Exam
- Quiz
- Assignment
- Internal Assessment
- Practical
- Project

## Usage Flow

1. **Faculty logs in** → Sees personal dashboard
2. **Clicks "Enter Student Marks"** → Opens Marks Management page
3. **Creates a new exam** → Fills exam details (name, type, subject, etc.)
4. **Exam appears in list** → Faculty clicks "Enter Marks"
5. **Enters marks for each student** → System auto-calculates percentage and grade
6. **Saves marks** → Data stored in Google Sheets

## Sample Data for Testing

### Sample Exam Entry:
```
ExamId: EXM1732377600000
ExamName: Mid Term Exam 2024
ExamType: mid_term
Subject: Data Structures
Department: CSE
Semester: 3
MaxMarks: 100
PassingMarks: 40
ExamDate: 2024-12-15
FacultyId: faculty@test.com
FacultyName: Prof. Kumar
CreatedAt: 2024-11-23T10:30:00.000Z
Status: scheduled
```

### Sample Marks Entry:
```
MarksId: MRK1732377600000_STU001
ExamId: EXM1732377600000
ExamName: Mid Term Exam 2024
ExamType: mid_term
StudentId: STU001
StudentName: Rahul Kumar
StudentEmail: rahul@example.com
RollNumber: 21CSE001
Department: CSE
Semester: 3
Subject: Data Structures
MarksObtained: 85
MaxMarks: 100
Percentage: 85.00
Grade: A
Remarks: Excellent performance
FacultyId: faculty@test.com
FacultyName: Prof. Kumar
EnteredAt: 2024-11-23T10:30:00.000Z
UpdatedAt: 2024-11-23T10:30:00.000Z
```

## Google Sheets Permissions

Make sure your Google Service Account has:
- **Editor** access to both sheets
- Sharing settings allow the service account email

## Navigation

Faculty can access marks management from:
1. **Dashboard** → "Enter Student Marks" quick access button
2. **Sidebar** → Faculty → Marks Management (if added to navigation)

## Future Enhancements

- Export marks to PDF/Excel
- Bulk import marks from CSV
- Analytics and statistics
- Email notifications to students
- Grade distribution charts
- Comparison with previous exams
- Student-wise performance tracking

## Troubleshooting

### "Exams sheet not configured" error
- Check that `EXAMS_SHEET_ID` is set in `.env.local`
- Verify the sheet ID is correct
- Ensure the "Exams" tab exists in the sheet

### "Marks sheet not configured" error
- Check that `MARKS_SHEET_ID` is set in `.env.local`
- Verify the sheet ID is correct
- Ensure the "Marks" tab exists in the sheet

### Marks not saving
- Verify Google Service Account has Editor permissions
- Check browser console for errors
- Ensure all required fields are filled

## Security Considerations

- Only faculty members can create exams and enter marks
- Each exam is tied to the faculty member who created it
- Student data validation is performed before saving
- Marks cannot exceed maximum marks
- All operations are logged with timestamps
