# Faculty Request Setup - Current Sheet Structure

## ✅ Your Current Setup

### Faculty Sheet Structure (Already Correct!)
Your Faculty sheet has the following columns (A-R):

```
A: facultyId
B: fullName          ← Used for display name
C: email             ← Used for identification
D: mobileNumber
E: gender
F: dateOfBirth
G: photoUrl
H: designation       ← Professor, Associate Prof., etc.
I: branch            ← Used as Department
J: joiningDate
K: assignedSubjects  ← Used as Specialization
L: assignedClasses
M: accessRole
N: status            ← Must be "active" to appear
O: createdBy
P: createdDate
Q: updatedBy
R: updatedDate
```

### Example Faculty Entry
```
F20250101 | Dr. Ayesha Kapoor | ayesha.kapoor@univ.edu | 9876543210 | female | 1985-03-12 | https://photo.url | Associate Prof. | Information Technology | 2015-07-10 | Data Structures, Web Technologies | IT-2A, IT-3B | Faculty | active | | | admin | 2025-12-08T19:33:19.550Z
```

## 🔧 How It Maps to Faculty Request System

When students search for faculty, they will see:

```
Name: Dr. Ayesha Kapoor              (from Column B)
Email: ayesha.kapoor@univ.edu        (from Column C)
Department: Information Technology    (from Column I - branch)
Specialization: Data Structures,     (from Column K - assignedSubjects)
                Web Technologies
Designation: Associate Prof.         (from Column H)
Institution: [Your Institution Name]
```

## ✅ What You Need to Do

### 1. Verify Super Master Sheet - Institutions Tab

Make sure your institutions are properly set up:

**GEC Bilaspur:**
```
Column A (institutionId): INST-1765224277144
Column B (institutionName): Government Engineering College Bilaspur
Column H (sheetId): 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw
Column M (status): active
```

**Purnima Institute:**
```
Column A (institutionId): INST-1765224405904
Column B (institutionName): Purnima Institute
Column H (sheetId): 1O8drOF-1_ZY9y_OVJ1dF7EskBFvR26Xn3IEQDZfL8-4
Column M (status): active
```

### 2. Add Faculty to Each Institution

**For Sheet: 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw (GEC Bilaspur)**

Go to `Faculty` tab and add entries like:

```
F20250102 | Dr. Rajesh Kumar | rajesh.kumar@gecbilaspur.edu | 9876543211 | male | 1980-05-20 | https://photo.url | Professor | Computer Science | 2018-08-15 | Algorithms, Data Mining | CS-3A, CS-4B | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z

F20250103 | Prof. Anita Sharma | anita.sharma@gecbilaspur.edu | 9876543212 | female | 1988-09-10 | https://photo.url | Assistant Professor | Electronics | 2020-01-10 | VLSI Design, Digital Electronics | ECE-2A | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z

F20250104 | Dr. Suresh Verma | suresh.verma@gecbilaspur.edu | 9876543213 | male | 1982-12-05 | https://photo.url | Associate Professor | Mechanical | 2017-06-20 | Thermodynamics, Fluid Mechanics | ME-3B | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z
```

**For Sheet: 1O8drOF-1_ZY9y_OVJ1dF7EskBFvR26Xn3IEQDZfL8-4 (Purnima Institute)**

Go to `Faculty` tab and add entries like:

```
F20250105 | Dr. Priya Mehta | priya.mehta@purnima.edu | 9988776655 | female | 1983-07-18 | https://photo.url | Professor | Computer Applications | 2016-03-12 | Web Development, Cloud Computing | MCA-2A | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z

F20250106 | Prof. Amit Singh | amit.singh@purnima.edu | 9988776656 | male | 1986-11-25 | https://photo.url | Associate Professor | Data Science | 2019-09-01 | Machine Learning, Neural Networks | DS-3A | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z

F20250107 | Dr. Kavita Joshi | kavita.joshi@purnima.edu | 9988776657 | female | 1984-04-15 | https://photo.url | Assistant Professor | Information Technology | 2021-01-15 | Database Systems, Python Programming | IT-2B | Faculty | active | | | admin | 2025-12-08T20:00:00.000Z
```

### 3. Key Requirements

For faculty to appear in the request system:

✅ **Column C (email)** - Must have valid email  
✅ **Column B (fullName)** - Must have name  
✅ **Column N (status)** - Must be "active"  
✅ **Column I (branch)** - Should have department name  
✅ **Column K (assignedSubjects)** - Should have subjects (shows as specialization)  

### 4. Service Account Access

Make sure your service account email has **Editor** access to:
- Super Master Sheet: `1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI`
- GEC Bilaspur Sheet: `1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw`
- Purnima Institute Sheet: `1O8drOF-1_ZY9y_OVJ1dF7EskBFvR26Xn3IEQDZfL8-4`

Find your service account email in your `GOOGLE_SERVICE_ACCOUNT_KEY` JSON (look for "client_email" field).

## 🧪 Testing

### Test 1: Check Faculty Discovery
```typescript
// In your app, try this
const faculty = await getAvailableFaculty();
console.log(`Found ${faculty.length} faculty members`);
```

**Expected Result:** Should see 7+ faculty (Dr. Ayesha + others you added)

### Test 2: Search Faculty
```typescript
const results = await searchFaculty("Data Structures");
console.log(results); // Should show Dr. Ayesha Kapoor
```

### Test 3: Search by Department
```typescript
const results = await searchFaculty("Information Technology");
console.log(results); // Should show IT faculty
```

## 🎯 Student Search Examples

When students search, they can find:

1. **By Name:**
   - "Ayesha" → Dr. Ayesha Kapoor
   - "Rajesh" → Dr. Rajesh Kumar

2. **By Department:**
   - "Information Technology" → Dr. Ayesha Kapoor, Dr. Kavita Joshi
   - "Computer Science" → Dr. Rajesh Kumar

3. **By Subject/Specialization:**
   - "Data Structures" → Dr. Ayesha Kapoor
   - "Machine Learning" → Prof. Amit Singh
   - "Web Development" → Dr. Priya Mehta

4. **By Institution:**
   - "GEC Bilaspur" → All GEC faculty
   - "Purnima" → All Purnima faculty

## 📊 How It Looks in UI

### Faculty Card Display:
```
┌─────────────────────────────────────┐
│ ☑️ Dr. Ayesha Kapoor               │
│ Information Technology              │
│ • Data Structures, Web Technologies │
│                                     │
│ 🏛️ Purnima Institute               │
└─────────────────────────────────────┘
```

### Request Form After Selection:
```
Selected Faculty:
- Dr. Ayesha Kapoor
- Purnima Institute
- Information Technology
- Specialization: Data Structures, Web Technologies
```

## ⚠️ Common Issues & Solutions

### Issue: Faculty not showing up
**Solution:**
- Check Column N (status) = "active" (lowercase)
- Verify Column C (email) is not empty
- Verify Column B (fullName) is not empty
- Check institution status is "active" in Super Master Sheet

### Issue: Search not finding faculty
**Solution:**
- Search looks in: fullName, branch, assignedSubjects, institutionName
- Make sure these columns are populated
- Try searching with partial words

### Issue: Wrong information displayed
**Solution:**
- Department shown = Column I (branch)
- Specialization shown = Column K (assignedSubjects)
- Update these columns with correct information

## ✅ Verification Checklist

Before testing the system:

- [ ] Super Master Sheet has both institutions with status "active"
- [ ] Both institution sheets have `Faculty` tab (exact name, case-sensitive)
- [ ] Each Faculty tab has headers in Row 1
- [ ] At least 3 faculty members added to each institution
- [ ] All faculty have email (Column C) and fullName (Column B)
- [ ] All faculty have status = "active" (Column N)
- [ ] Service account has Editor access to all 3 sheets
- [ ] Environment variables set correctly in `.env.local`

## 🚀 Ready to Use!

Once you've added faculty to both institution sheets:

1. Login as **Student**
2. Go to: **Faculty Consultation → Request Faculty**
3. You should see all active faculty from both institutions!
4. Search, select, and create your first request!

---

**Note:** The system automatically adapts to your current Faculty sheet structure. No need to modify your existing columns! Just add faculty members with status = "active" and they'll appear in the system.
