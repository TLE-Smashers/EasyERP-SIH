# Faculty Sheet Structure - Updated with Metadata Fields

## Changes Made

### 1. **Added Metadata Tracking Columns**
Extended Faculty sheet from **14 to 18 columns** to track creation and updates:

```
Previous: A-N (14 columns)
Updated:  A-R (18 columns)
```

**New Columns:**
- Column O: `createdBy` - Who created the record (e.g., "admin")
- Column P: `createdDate` - When the record was created (ISO timestamp)
- Column Q: `updatedBy` - Who last updated the record
- Column R: `updatedDate` - When the record was last updated (ISO timestamp)

### 2. **Fixed Field Name Mismatches**
Updated components to use correct field names matching the actual sheet:

| Component Issue | Old Field | New Field | Status |
|----------------|-----------|-----------|--------|
| FacultyTable | `employeeId` | `facultyId` | ✅ Fixed |
| FacultyTable | `dateOfJoining` | `joiningDate` | ✅ Fixed |
| FacultyTable | `department` | `branch` | ✅ Fixed |

### 3. **Fixed Invalid Date Display**
Updated the date cell renderer to handle:
- Empty/null dates
- Invalid date strings
- Properly formatted dates

**Before:**
```typescript
const date = new Date(row.getValue("dateOfJoining"));
return <div>{date.toLocaleDateString()}</div>;
// Result: "Invalid Date" for empty/malformed values
```

**After:**
```typescript
const dateValue = row.getValue("joiningDate") as string;
if (!dateValue) return <div>-</div>;
const date = new Date(dateValue);
return <div>{isNaN(date.getTime()) ? dateValue : date.toLocaleDateString()}</div>;
// Result: Shows "-" for empty, raw string for invalid, formatted for valid
```

---

## Complete Faculty Sheet Structure (18 columns)

### Column Headers
```
A: facultyId
B: fullName
C: email
D: mobileNumber
E: gender
F: dateOfBirth
G: photoUrl
H: designation
I: branch (Department)
J: joiningDate
K: assignedSubjects
L: assignedClasses
M: accessRole
N: status
O: createdBy       ← NEW
P: createdDate     ← NEW
Q: updatedBy       ← NEW
R: updatedDate     ← NEW
```

### Example Row
```
| FAC001 | John Doe | john@example.com | 9876543210 | male | 1990-01-01 | photo.jpg |
| Professor | Computer Science | 2023-01-15 | Python, Java | CSE-A, CSE-B |
| faculty | active | admin | 2024-11-27T10:30:00Z | admin | 2024-11-27T10:30:00Z |
```

---

## Files Modified

### 1. `src/lib/google/sheets.faculty.ts`
**Changes:**
- Updated `COLUMN_MAP` to include 4 new metadata fields
- Changed range from `A:N` to `A:R`
- Updated `transformFacultyToRow()` to:
  - Accept `isNew` parameter
  - Set `createdBy` and `createdDate` for new records
  - Always update `updatedBy` and `updatedDate`
- Updated `addFacultyToSheet()` to pass `isNew: true`
- Updated `updateFacultyInSheet()` to pass `isNew: false`

### 2. `src/components/faculty/FacultyTable.tsx`
**Changes:**
- Updated `Faculty` interface:
  - `employeeId` → `facultyId`
  - `department` → `branch`
  - `dateOfJoining` → `joiningDate`
- Updated all column definitions to use new field names
- Fixed date cell renderer to handle invalid dates gracefully

---

## Automatic Metadata Population

### When Adding Faculty
```typescript
// In addFacultyToSheet()
if (isNew) {
    row[COLUMN_MAP.createdBy] = "admin";
    row[COLUMN_MAP.createdDate] = new Date().toISOString();
}
row[COLUMN_MAP.updatedBy] = "admin";
row[COLUMN_MAP.updatedDate] = new Date().toISOString();
```

### When Updating Faculty
```typescript
// In updateFacultyInSheet()
row[COLUMN_MAP.updatedBy] = "admin";
row[COLUMN_MAP.updatedDate] = new Date().toISOString();
// createdBy and createdDate remain unchanged
```

---

## Testing Checklist

### ✅ Compilation
- [x] No TypeScript errors
- [x] All field names aligned

### 🧪 Manual Testing

#### Test 1: Add New Faculty
1. Navigate to `/dashboard/faculty/new`
2. Fill form and submit
3. Check Faculty sheet:
   - ✓ All 14 data fields populated
   - ✓ `createdBy` = "admin"
   - ✓ `createdDate` = current timestamp
   - ✓ `updatedBy` = "admin"
   - ✓ `updatedDate` = current timestamp

#### Test 2: View Faculty List
1. Navigate to `/dashboard/faculty`
2. Verify table shows:
   - ✓ Faculty ID (not Employee ID)
   - ✓ Proper date formatting or "-" for empty
   - ✓ No "Invalid Date" errors
   - ✓ All columns aligned

#### Test 3: Update Faculty Status
1. Change faculty status (active/inactive/on_leave)
2. Check Faculty sheet:
   - ✓ Status updated
   - ✓ `updatedBy` updated to "admin"
   - ✓ `updatedDate` updated to current timestamp
   - ✓ `createdBy` and `createdDate` unchanged

---

## Migration for Existing Data

If you have existing faculty records without metadata fields:

### Option 1: Add Columns Manually in Google Sheets
1. Open Faculty sheet
2. Add 4 new columns after status (column N):
   - Column O: `createdBy`
   - Column P: `createdDate`
   - Column Q: `updatedBy`
   - Column R: `updatedDate`
3. Optionally fill existing rows with placeholder data:
   - createdBy: "system"
   - createdDate: "2024-01-01T00:00:00Z"
   - updatedBy: "system"
   - updatedDate: Current date

### Option 2: Migration Script
```typescript
// Run this once to add metadata to existing records
const migrateExistingFaculty = async () => {
  const allFaculty = await getAllFaculty();
  const now = new Date().toISOString();
  
  for (const faculty of allFaculty) {
    await updateFacultyInSheet(faculty.facultyId, {
      // This will trigger the metadata update
    });
  }
};
```

---

## Benefits

### 1. **Audit Trail**
- Track who created each faculty record
- Track when each faculty was added
- Track who made the last update
- Track when the last update occurred

### 2. **Data Integrity**
- No more field name mismatches
- Proper date handling
- Clear column structure

### 3. **Debugging**
- Easy to identify when records were created
- Easy to track modification history
- Better error diagnosis

---

## Summary

✅ **Faculty Sheet now has 18 columns** (A-R)  
✅ **Metadata automatically populated** on add/update  
✅ **Field names aligned** across all components  
✅ **Invalid dates handled gracefully** in UI  
✅ **Faculty ID displays correctly** in table  
✅ **No compilation errors**

Ready for testing! 🎉
