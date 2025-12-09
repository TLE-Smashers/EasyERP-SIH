# Super Master Sheet - Faculty Setup Guide

## 📋 Faculty Sheet in Super Master Sheet

The Faculty sheet is now centralized in the Super Master Sheet for cross-institution discovery.

### Auto-Creation
The system will automatically create the `Faculty` tab on first use with these headers:

## 🎯 Column Structure (A-I)

```
A: Faculty ID          - Unique identifier (e.g., F20250101)
B: Full Name          - Faculty member's full name
C: Email              - Faculty email (Required)
D: Institution ID     - From Institutions tab (e.g., INST-1765224277144)
E: Institution Name   - Institution name for display
F: Department         - Department/Branch (e.g., Computer Science, IT)
G: Specialization     - Subjects/Skills (e.g., Data Structures, ML)
H: Designation        - Position (Professor, Associate Prof., etc.)
I: Status             - "active" or "inactive"
```

## 📝 Sample Faculty Data

### For GEC Bilaspur (INST-1765224277144)

**Row 2:**
```
F20250201	Dr. Rajesh Kumar	rajesh.kumar@gecbilaspur.edu	INST-1765224277144	Government Engineering College Bilaspur	Computer Science	Algorithms, Data Mining, Machine Learning	Professor	active
```

**Row 3:**
```
F20250202	Prof. Anita Sharma	anita.sharma@gecbilaspur.edu	INST-1765224277144	Government Engineering College Bilaspur	Electronics & Communication	VLSI Design, Digital Electronics	Assistant Professor	active
```

**Row 4:**
```
F20250203	Dr. Suresh Verma	suresh.verma@gecbilaspur.edu	INST-1765224277144	Government Engineering College Bilaspur	Mechanical Engineering	Thermodynamics, Fluid Mechanics	Associate Professor	active
```

**Row 5:**
```
F20250204	Prof. Meera Patel	meera.patel@gecbilaspur.edu	INST-1765224277144	Government Engineering College Bilaspur	Civil Engineering	Structural Analysis, Concrete Technology	Associate Professor	active
```

**Row 6:**
```
F20250205	Dr. Anil Gupta	anil.gupta@gecbilaspur.edu	INST-1765224277144	Government Engineering College Bilaspur	Electrical Engineering	Power Systems, Control Systems	Professor	active
```

### For Purnima Institute (INST-1765224405904)

**Row 7:**
```
F20250101	Dr. Ayesha Kapoor	ayesha.kapoor@purnima.edu	INST-1765224405904	Purnima Institute	Information Technology	Data Structures, Web Technologies	Associate Professor	active
```

**Row 8:**
```
F20250301	Dr. Priya Mehta	priya.mehta@purnima.edu	INST-1765224405904	Purnima Institute	Computer Applications	Web Development, Cloud Computing	Professor	active
```

**Row 9:**
```
F20250302	Prof. Amit Singh	amit.singh@purnima.edu	INST-1765224405904	Purnima Institute	Data Science	Machine Learning, Neural Networks, Deep Learning	Associate Professor	active
```

**Row 10:**
```
F20250303	Dr. Kavita Joshi	kavita.joshi@purnima.edu	INST-1765224405904	Purnima Institute	Information Technology	Database Systems, Python Programming	Assistant Professor	active
```

**Row 11:**
```
F20250304	Dr. Vikram Rao	vikram.rao@purnima.edu	INST-1765224405904	Purnima Institute	Artificial Intelligence	AI Algorithms, NLP, Computer Vision	Professor	active
```

**Row 12:**
```
F20250305	Prof. Sneha Reddy	sneha.reddy@purnima.edu	INST-1765224405904	Purnima Institute	Cyber Security	Network Security, Ethical Hacking	Associate Professor	active
```

## 🔧 Setup Instructions

### Method 1: Auto-Creation (Recommended)
1. The system will create the Faculty sheet automatically when you first access the faculty request page
2. Then manually add faculty using the data above

### Method 2: Manual Creation
1. Open Super Master Sheet: `1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI`
2. Create a new tab named exactly **`Faculty`** (case-sensitive)
3. Add headers in Row 1: `Faculty ID`, `Full Name`, `Email`, `Institution ID`, `Institution Name`, `Department`, `Specialization`, `Designation`, `Status`
4. Copy and paste the sample data rows above

### Quick Add Steps:
1. Open Super Master Sheet
2. Click on `Faculty` tab (or it will be created automatically)
3. Copy the data from "Sample Faculty Data" section above
4. Paste starting from cell A2
5. Verify all rows have "active" in column I

## ✅ Verification

After adding faculty, verify:
- [ ] Faculty tab exists in Super Master Sheet
- [ ] Headers are in Row 1 (A-I)
- [ ] At least 2-3 faculty members from each institution
- [ ] Column C (Email) has valid emails
- [ ] Column D (Institution ID) matches Institutions tab
- [ ] Column I (Status) is "active" (lowercase)

## 🧪 Test Faculty Discovery

After setup, test in your app:

```typescript
const faculty = await getAvailableFaculty();
console.log(`Found ${faculty.length} faculty members`);
// Expected: 11 faculty members (5 from GEC + 6 from Purnima)
```

### Search Tests:
```typescript
// By name
await searchFaculty("Ayesha");  // → Dr. Ayesha Kapoor

// By department
await searchFaculty("Computer Science");  // → Dr. Rajesh Kumar

// By subject
await searchFaculty("Machine Learning");  // → Prof. Amit Singh, Dr. Rajesh Kumar

// By institution
await searchFaculty("Purnima");  // → All 6 Purnima faculty
```

## 🎯 Benefits of Super Master Sheet Approach

✅ **Cross-Institution Discovery** - Students can find faculty from ANY institution  
✅ **Centralized Management** - All faculty in one place  
✅ **Easy Updates** - Update status to "inactive" to hide faculty  
✅ **No Duplication** - Single source of truth  
✅ **Fast Search** - One sheet to query  

## 📊 Expected Result

Once setup is complete:
- **Total Faculty**: 11 members
- **GEC Bilaspur**: 5 faculty members
- **Purnima Institute**: 6 faculty members
- **All searchable** by students from both institutions

### Students Can Search:
- By Name: "Rajesh", "Ayesha", "Priya"
- By Department: "Computer Science", "Data Science", "IT"
- By Subject: "Machine Learning", "Web Development", "VLSI"
- By Institution: "GEC", "Purnima"

## 🚀 Next Steps

1. ✅ Super Master Sheet Faculty tab created (auto or manual)
2. ✅ Add sample faculty data (copy-paste from above)
3. ✅ Verify status is "active" for all
4. ✅ Test faculty discovery in app
5. ✅ Create first faculty request!

---

**Ready to use! Students can now discover and request faculty from across all institutions!** 🎉
