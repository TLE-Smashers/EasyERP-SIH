# Student Sheet Structure

## Sheet Name: `Student`

The `/dashboard/faculty/students` page now loads data directly from the **Student** sheet in Google Sheets.

## Column Structure (A-P)

Your Student sheet should have the following columns in Row 1 (headers):

| Column | Field Name | Description | Example |
|--------|------------|-------------|---------|
| A | _Id | Unique student identifier | 1 |
| B | enrollmentNumber | Student enrollment number | 21CSE001 |
| C | fullName | Student's full name | John Doe |
| D | gender | Gender | Male |
| E | dateOfBirth | Date of birth | 2005-01-15 |
| F | email | Student email address | john@example.com |
| G | mobileNumber | Contact number | 9876543210 |
| H | category | Category (General/OBC/SC/ST) | General |
| I | course | Course name | B.Tech |
| J | branch | Department/Branch | CSE |
| K | admissionYear | Year of admission | 2021 |
| L | admissionDate | Date of admission | 2021-08-01 |
| M | currentYear | Current year (1-4) | 2 |
| N | currentSemester | Current semester (1-8) | 3 |
| O | guardianName | Parent/Guardian name | Jane Doe |
| P | photoUrl | URL to student photo | https://... |

## Example Data Row

```
1 | 21CSE001 | John Doe | Male | 2005-01-15 | john@example.com | 9876543210 | General | B.Tech | CSE | 2021 | 2021-08-01 | 2 | 3 | Jane Doe | https://...
```

## Important Notes

1. **Branch Filtering**: Faculty can only see students where the `branch` column matches their department
2. **No Status Field**: All students in the sheet are considered active
3. **No Section Field**: The sheet doesn't have sections, so section filtering is not available
4. **Data starts from Row 2**: Row 1 contains headers, actual data starts from Row 2
5. **ID Field**: The `_Id` column is used as the unique identifier
6. **Enrollment Number**: Used as the roll number for attendance marking

## File Location

The Google Sheets integration code is in:
- `src/lib/google/sheets.studentTable.ts` - Main sheet reading logic
- `src/actions/faculty/getStudentsByBranch.ts` - Server actions for faculty
- `src/app/dashboard/faculty/students/page.tsx` - Frontend page

## Testing

1. Make sure your Google Sheets has a sheet named exactly **"Student"**
2. Add the column headers in Row 1 as shown above
3. Add some test data in Row 2 onwards
4. Make sure at least one student has the same `branch` as the faculty's `department`
5. Login with faculty@test.com and navigate to `/dashboard/faculty/students`
