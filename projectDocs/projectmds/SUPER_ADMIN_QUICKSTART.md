# Super Admin Quick Start Guide

## 🚀 Quick Access

### Login URLs
- **Super Admin Login**: `http://localhost:3000/super-admin-login`
- **Super Admin Dashboard**: `http://localhost:3000/dashboard/super-admin`

### Default Credentials
```
Email: superadmin@easyerp.com
Password: SuperAdmin@2024
```

⚠️ **IMPORTANT**: Change the default password after first login!

## 📋 Setup Checklist

### 1. Create Google Sheet
- [ ] Create a new Google Sheet named "SuperAdmin"
- [ ] Add "Institutions" sheet with required columns
- [ ] Add "SharedResources" sheet with required columns
- [ ] Copy the Sheet ID from URL

### 2. Configure Environment
- [ ] Add `SUPER_ADMIN_SHEET_ID` to `.env.local`
- [ ] Restart development server

### 3. Create Super Admin User
- [ ] Run: `npx tsx scripts/addSuperAdmin.ts`
- [ ] Copy the hashed password from output
- [ ] Add user to existing Users sheet with role: `super-admin`

### 4. Share Sheet with Service Account
- [ ] Open SuperAdmin Google Sheet
- [ ] Share with service account email (from GOOGLE_SERVICE_ACCOUNT_KEY)
- [ ] Give Editor permissions

### 5. Test Login
- [ ] Navigate to `/super-admin-login`
- [ ] Login with super admin credentials
- [ ] Verify dashboard access

## 🎯 Features Available

### Dashboard Tabs

#### 1. **Institutions**
View and manage all registered institutions:
- Total count and active institutions
- Institution cards with details
- Status badges (active/inactive/suspended)
- Search and filter capabilities

#### 2. **Shared Resources**
Temporary resource categories:
- 📚 E-Books Library
- 🎥 Video Lectures
- 📝 Study Materials
- 📄 Templates & Forms
- 📖 Course Content
- 📊 Research Papers

*Full CRUD operations coming in Phase 2*

#### 3. **Analytics**
System overview:
- Institution performance rankings
- Recent activity log
- Usage statistics

## 📊 Dashboard Statistics

The dashboard displays:
- **Total Institutions**: All registered institutions
- **Total Users**: Sum of all users across institutions
- **Total Students**: Combined student count
- **Shared Resources**: Available resources count

## 🗂️ Google Sheet Structure

### Institutions Sheet Columns
```
A: ID               - Unique identifier (e.g., INST-001)
B: Name             - Institution name
C: Code             - Short code (e.g., MIT, ABC)
D: Type             - university/college/school
E: Address          - Street address
F: City             - City name
G: State            - State/Province
H: Country          - Country name
I: Pincode          - Postal code
J: Contact Email    - Primary email
K: Contact Phone    - Phone number
L: Principal Name   - Head of institution
M: Spreadsheet ID   - Google Sheet ID for institution
N: Status           - active/inactive/suspended
O: Registered Date  - ISO date string
P: Last Active      - ISO date string
Q: Admin Count      - Number of admins
R: Student Count    - Number of students
S: Faculty Count    - Number of faculty
```

### SharedResources Sheet Columns
```
A: ID               - Unique identifier (e.g., RES-001)
B: Title            - Resource title
C: Description      - Detailed description
D: Type             - ebook/video/document/course/template
E: Category         - Subject category
F: URL              - Resource URL
G: Sheet URL        - Optional Google Sheet URL
H: Thumbnail URL    - Image URL
I: Uploaded By      - Uploader name/email
J: Uploaded Date    - ISO date string
K: Access Count     - Number of accesses
L: Tags             - Comma-separated tags
M: Status           - active/archived
```

## 🔐 Security Features

1. **Separate Login Portal**: `/super-admin-login`
2. **Role-Based Access**: Only `super-admin` role can access
3. **Middleware Protection**: Automatic redirect if unauthorized
4. **Session Verification**: Validates super-admin role on each request

## 🛣️ Routes

### Public Routes
- `/super-admin-login` - Super admin login page

### Protected Routes (Requires super-admin role)
- `/dashboard/super-admin` - Main dashboard
- `/dashboard/super-admin/institutions` - Institutions list
- `/dashboard/super-admin/resources` - Resources management (coming soon)
- `/dashboard/super-admin/access-logs` - Access logs (coming soon)

## 📝 Sample Data

### Sample Institution Entry
```
INST-001 | ABC University | ABC | university | 123 Main St | Mumbai | Maharashtra | India | 400001 | contact@abc.edu | +91-1234567890 | Dr. John Doe | 1abc...xyz | active | 2024-01-01 | 2024-12-09 | 5 | 1000 | 50
```

### Sample Resource Entry
```
RES-001 | Introduction to Python | Beginner-friendly Python course | course | Programming | https://example.com/python | | https://example.com/thumb.jpg | superadmin@easyerp.com | 2024-12-09 | 0 | python,programming,beginner | active
```

## 🔧 Common Operations

### View All Institutions
1. Login as super admin
2. Navigate to "Institutions" tab
3. View list of all institutions with stats

### Search Institutions
1. Go to Institutions page
2. Use search bar to filter by name/code/city
3. Click on institution card for details

### View Dashboard Stats
1. Login as super admin
2. Dashboard shows 4 key metrics
3. View analytics tab for detailed insights

## 🆘 Troubleshooting

### Cannot Access Dashboard
- Verify user has `super-admin` role in Users sheet
- Clear browser cache/cookies
- Check middleware logs

### No Institutions Showing
- Verify SuperAdmin sheet exists
- Check `SUPER_ADMIN_SHEET_ID` in `.env.local`
- Ensure service account has sheet access
- Verify "Institutions" sheet name matches exactly

### Login Fails
- Check credentials in Users sheet
- Verify password is hashed correctly
- Ensure role is `super-admin` (not `admin`)
- Check user status is `active`

## 📞 Support Commands

### Generate Super Admin Credentials
```bash
npx tsx scripts/addSuperAdmin.ts
```

### Check Environment Variables
```bash
grep SUPER_ADMIN .env.local
```

### Restart Development Server
```bash
pnpm dev
```

## 🔜 Coming in Phase 2

- [ ] Full institution CRUD operations
- [ ] Add/Edit/Delete institutions
- [ ] Actual shared resource management
- [ ] File upload for resources
- [ ] Access logs and audit trail
- [ ] Advanced filtering and sorting
- [ ] Bulk operations
- [ ] Email notifications
- [ ] Multi-factor authentication
- [ ] System settings page
- [ ] Backup and restore

---

**Quick Links**:
- 📖 [Full Setup Guide](./SUPER_ADMIN_SETUP.md)
- 🔐 [Security Best Practices](#security-features)
- 📊 [Dashboard Features](#features-available)

**Version**: 1.0.0  
**Last Updated**: December 9, 2024
