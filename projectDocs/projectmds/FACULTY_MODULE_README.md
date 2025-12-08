# Faculty Module - Complete Implementation

## Overview

The Faculty Module is a comprehensive faculty management system integrated into the Easy-ERP platform. It provides two distinct interfaces:

1. **Admin Interface**: For managing all faculty members
2. **Faculty Portal**: For individual faculty members to manage their classes and students

## Features Implemented

### ✅ Admin Features

- **Faculty Management**
  - Add new faculty members with complete details
  - View all faculty in an interactive table
  - Filter by department, designation, and status
  - Search faculty by name, employee ID, or email
  - View detailed faculty profile in drawer
  - Update faculty status (Active/On Leave/Inactive)

- **Statistics & Analytics**
  - Total faculty count
  - Active faculty count
  - On-leave faculty count
  - Department-wise distribution
  - Designation-wise distribution

### ✅ Faculty Portal Features

- **Profile Management**
  - View personal information
  - View professional details
  - View academic qualifications
  - Access to documents

- **Class Management**
  - View assigned courses
  - View class schedule
  - Track student count per class

- **Student Management**
  - View all students in assigned classes
  - Search students by name or roll number
  - Filter students by class
  - View student contact details

- **Attendance Management**
  - Mark daily attendance for classes
  - Bulk mark all students present/absent
  - View attendance statistics
  - Save attendance to Google Sheets

## File Structure

```
src/
├── types/
│   └── faculty.ts                          # TypeScript type definitions
│
├── lib/
│   └── google/
│       └── sheets.faculty.ts               # Google Sheets integration
│
├── actions/
│   └── faculty/
│       ├── getFaculty.ts                   # Get all faculty
│       ├── fetchFaculty.ts                 # Get single faculty
│       ├── addFaculty.ts                   # Add new faculty
│       ├── updateFaculty.ts                # Update faculty details
│       └── changeFacultyStatus.ts          # Change faculty status
│
├── components/
│   └── faculty/
│       ├── FacultyTable.tsx                # Faculty list table
│       ├── FacultyDrawer.tsx               # Faculty details drawer
│       └── FacultyForm.tsx                 # Add/Edit faculty form
│
└── app/
    └── dashboard/
        └── faculty/
            ├── page.tsx                    # Admin faculty list page
            ├── new/
            │   └── page.tsx                # Add new faculty page
            ├── profile/
            │   └── page.tsx                # Faculty profile (faculty role)
            ├── classes/
            │   └── page.tsx                # Faculty classes (faculty role)
            ├── students/
            │   └── page.tsx                # Faculty students (faculty role)
            └── attendance/
                └── page.tsx                # Attendance marking (faculty role)
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_FACULTY_SHEET_ID=your_google_sheet_id_here
```

### 2. Google Sheet Setup

Follow the instructions in `FACULTY_SHEET_SETUP.md` to:
- Create the Faculty sheet with proper columns
- Set up data validation
- Configure service account access
- Add sample data

### 3. Navigation Already Configured

The faculty module navigation is already set up in `src/config/navigation.ts`:

**Admin Navigation:**
- All Faculty → `/dashboard/faculty`
- Add Faculty → `/dashboard/faculty/new`

**Faculty Role Navigation:**
- My Profile → `/dashboard/faculty/profile`
- My Classes → `/dashboard/faculty/classes`
- My Students → `/dashboard/faculty/students`
- Attendance → `/dashboard/faculty/attendance`

## Usage

### For Administrators

1. **View All Faculty**
   ```
   Navigate to: /dashboard/faculty
   ```
   - See complete list of faculty members
   - Filter by department, status
   - Search by name or employee ID
   - Click on any row to view details

2. **Add New Faculty**
   ```
   Navigate to: /dashboard/faculty/new
   ```
   - Fill in personal details
   - Add professional information
   - Add academic qualifications
   - Provide document links
   - Save to create new faculty record

3. **Update Faculty Status**
   - From the faculty table, use the actions menu
   - Select status: Active, On Leave, or Inactive
   - Status updates immediately in Google Sheets

### For Faculty Members

1. **View Profile**
   ```
   Navigate to: /dashboard/faculty/profile
   ```
   - View personal information
   - View professional details
   - View qualifications and documents

2. **Manage Classes**
   ```
   Navigate to: /dashboard/faculty/classes
   ```
   - View assigned courses
   - Check class schedule
   - See student count per class

3. **View Students**
   ```
   Navigate to: /dashboard/faculty/students
   ```
   - See all students in your classes
   - Search and filter students
   - Access student contact information

4. **Mark Attendance**
   ```
   Navigate to: /dashboard/faculty/attendance
   ```
   - Select date and class
   - Mark students present/absent
   - Use bulk actions for efficiency
   - Save attendance to system

## API Reference

### Server Actions

#### `getFaculty()`
```typescript
// Get all faculty members
const faculty = await getFaculty();
```

#### `fetchFaculty(id: string)`
```typescript
// Get single faculty by ID
const faculty = await fetchFaculty("FAC1234567890");
```

#### `addFaculty(data: FacultyFormData)`
```typescript
// Add new faculty member
const result = await addFaculty({
  personalDetails: { ... },
  professionalDetails: { ... },
  qualifications: [ ... ],
  documentLinks: { ... },
  status: "active",
});
```

#### `updateFaculty(id, data, updatedBy)`
```typescript
// Update faculty details
const result = await updateFaculty(
  "FAC1234567890",
  { status: "on_leave" },
  "admin@college.edu"
);
```

#### `changeFacultyStatus(id, status, updatedBy)`
```typescript
// Change faculty status only
const result = await changeFacultyStatus(
  "FAC1234567890",
  "inactive",
  "admin@college.edu"
);
```

### Type Definitions

#### Faculty Types
- `Faculty`: Complete faculty data structure
- `FacultyFormData`: Data for create/update operations
- `FacultyPersonalDetails`: Personal information
- `FacultyProfessionalDetails`: Professional information
- `FacultyQualification`: Academic qualification
- `FacultyDocumentLinks`: Document storage links
- `FacultyStats`: Statistics and analytics
- `FacultyStatus`: "active" | "on_leave" | "inactive"
- `FacultyDesignation`: Professor, Associate Professor, etc.

## Component Props

### FacultyTable
```typescript
interface FacultyTableProps {
  data: Faculty[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onChangeStatus?: (id: string, status) => void;
}
```

### FacultyDrawer
```typescript
interface FacultyDrawerProps {
  facultyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

### FacultyForm
```typescript
interface FacultyFormProps {
  defaultValues?: Partial<FacultyFormValues>;
  onSubmit: (data: FacultyFormValues) => Promise<void>;
  isLoading?: boolean;
}
```

## Integration Points

The Faculty module integrates with:

1. **Authentication System**
   - Uses role-based access control
   - Faculty role for portal access
   - Admin role for management

2. **Google Sheets Backend**
   - All data stored in Google Sheets
   - Real-time synchronization
   - Easy data export and backup

3. **Future Integrations**
   - Student module (for class assignments)
   - Accounts module (for salary management)
   - Library module (for book borrowing)

## Styling & UI

- Built with **shadcn/ui** components
- Uses **Tailwind CSS** for styling
- Fully responsive design
- Modern and clean interface
- Consistent with other modules

## SOLID Principles

The module follows SOLID principles:

- **Single Responsibility**: Each component has one job
- **Open/Closed**: Easy to extend without modification
- **Liskov Substitution**: Interfaces are consistently implemented
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: Depends on abstractions (actions layer)

## Scalability

The architecture is designed for easy database migration:

1. **Actions Layer**: All data operations in `src/actions/faculty/`
2. **Sheet Layer**: Google Sheets logic in `src/lib/google/sheets.faculty.ts`
3. **To migrate to database**: Update only the sheet layer and actions, components remain unchanged

## Future Enhancements

Potential features for future development:

- [ ] Faculty leave management system
- [ ] Teaching workload calculation
- [ ] Performance evaluation system
- [ ] Research publication tracking
- [ ] Timetable generation
- [ ] Faculty feedback system
- [ ] Salary slip generation
- [ ] Course material upload
- [ ] Online class integration
- [ ] Faculty dashboard with analytics

## Testing Checklist

- [ ] Create new faculty record
- [ ] View faculty list with filters
- [ ] Search faculty members
- [ ] View faculty details in drawer
- [ ] Update faculty status
- [ ] Faculty login and access portal
- [ ] View faculty profile
- [ ] Access class information
- [ ] View student list
- [ ] Mark attendance
- [ ] Verify data in Google Sheets

## Support & Maintenance

For issues or enhancements:

1. Check Google Sheet configuration
2. Verify service account permissions
3. Check browser console for errors
4. Review server logs for API errors
5. Validate environment variables

## Credits

Developed following the Easy-ERP architecture pattern, consistent with:
- Admission Module
- Hostel Module
- Accounts Module

Built with Next.js 14, TypeScript, shadcn/ui, and Google Sheets API.
