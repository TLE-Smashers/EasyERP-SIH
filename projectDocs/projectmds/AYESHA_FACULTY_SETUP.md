# Faculty Authentication - Dr. Ayesha Kapoor Setup

## Your Faculty Data (Row 2)

```
F20250101 | Dr. Ayesha Kapoor | ayesha.kapoor@univ.edu | 9876543210 | Female | 1985-03-12 | https://example.com/photos/ayesha.jpg | Associate Prof. | Information Technology | 2015-07-10 | Data Structures, Web Technologies | IT-2A, IT-3B | Faculty | Active | admin | 2025-01-10 10:30:00 | admin | 2025-02-20 14:12:00
```

## Login Credentials

- **Email**: `ayesha.kapoor@univ.edu`
- **Password**: `12345`

## How It Works

### 1. Authentication
When you login:
1. System reads Faculty sheet (columns A-Z)
2. Finds row with email: `ayesha.kapoor@univ.edu`
3. Checks password = `12345` (plain text, no hashing)
4. Status = "Active" (case-insensitive, works as "active")
5. Logs you in with role = `faculty`

### 2. Faculty Profile
After login, your profile will have:
```javascript
{
  id: "F20250101",
  name: "Dr. Ayesha Kapoor",
  email: "ayesha.kapoor@univ.edu",
  role: "faculty",
  department: "Information Technology" // This is the branch field
}
```

### 3. Student Filtering
When you view students:
- System filters students by branch = "Information Technology"
- Only students with `branch = "Information Technology"` will appear
- If no students match, you'll see empty list

## Important: Student Branch Must Match

For you to see students, they must have:
- **Student sheet column I (branch)**: `Information Technology`

Examples of branch values that will work:
- ✅ `Information Technology` (exact match)
- ❌ `IT` (won't match)
- ❌ `Computer Science` (won't match)
- ❌ `information technology` (case-sensitive, won't match)

## Testing Steps

### 1. Verify Environment Variables
```env
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 2. Verify Faculty Sheet
Check Row 1 (Headers):
```
facultyId | fullName | email | mobileNumber | gender | dateOfBirth | photoUrl | designation | branch | joiningDate | assignedSubjects | assignedClasses | accessRole | status | createdBy | createdDate | updatedBy | updatedDate
```

Check Row 2 (Your Data) - matches your data exactly.

### 3. Verify Student Sheet
Make sure some students have:
- **Column I (branch)**: `Information Technology`
- **Column N (status)**: `active` or `Active`

### 4. Start Server
```powershell
npm run dev
```

### 5. Login
1. Go to: http://localhost:3000/login
2. Email: `ayesha.kapoor@univ.edu`
3. Password: `12345`
4. Click Login

### 6. View Students
Navigate to: http://localhost:3000/dashboard/faculty/students

You should see students from "Information Technology" branch.

## Console Logs to Check

When you login, check terminal for:

```
[getUserByEmail] Looking for user: ayesha.kapoor@univ.edu
[getUserByEmail] Faculty sheet rows: X
[getUserByEmail] Faculty user found: Dr. Ayesha Kapoor
[getUserByEmail] Faculty branch: Information Technology
[getUserByEmail] Faculty status: Active
```

When viewing students:
```
[getStudentsByBranch] Called with: { branch: 'Information Technology', year: undefined }
[fetchStudentsByBranch] Branch parameter: Information Technology
[fetchStudentsByBranch] Total students fetched: X
[fetchStudentsByBranch] Students in branch Information Technology: X
```

## If No Students Appear

### Option 1: Add Test Student
Add a student to Student sheet with:
- **Column I (branch)**: `Information Technology` (exact match)
- **Column M (currentYear)**: `1` or `2` or `3`
- **Column N (currentSemester)**: `1` to `8`

### Option 2: Change Branch Filter
If your students have different branch names (like "IT"), you have two options:

**A. Update Faculty Branch**
Change column I in Faculty sheet to match student branch:
- If students have "IT", change faculty branch to "IT"

**B. Update Student Branch**
Change column I in Student sheet to "Information Technology"

## Key Points

✅ **Faculty ID**: F20250101  
✅ **Email**: ayesha.kapoor@univ.edu  
✅ **Password**: 12345 (plain text)  
✅ **Branch**: Information Technology  
✅ **Status**: Active (works as "active")  
✅ **Role**: faculty  

## What's Working

1. ✅ Authentication reads from Faculty sheet
2. ✅ Password = "12345" (plain text, no hashing)
3. ✅ Status "Active" normalized to "active"
4. ✅ Branch = "Information Technology" used for filtering
5. ✅ Faculty and Student use same GOOGLE_SHEETS_ID
6. ✅ Gender "Female" normalized to "female"

## Next Steps

1. Restart your server: `npm run dev`
2. Login with the credentials above
3. Check console logs for any errors
4. If students don't appear, verify Student sheet has branch = "Information Technology"
