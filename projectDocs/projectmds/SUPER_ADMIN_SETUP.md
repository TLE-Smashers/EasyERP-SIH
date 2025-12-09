# Super Admin System Setup Guide

## Overview
The Super Admin system provides centralized management for multiple institutions, shared resources, and system-wide settings in the Easy ERP platform.

## Features Implemented

### 1. **Super Admin Role**
- New user role: `super-admin` added to the system
- Highest level of access with system-wide privileges
- Separate login portal for enhanced security

### 2. **Dashboard Capabilities**
- **Institutions Management**: View and manage all registered institutions
- **Shared Resources**: Centralized resource library accessible to all institutions
- **System Analytics**: Overview of usage statistics and performance metrics
- **User Statistics**: Track total users, students, faculty across institutions

### 3. **Security Features**
- Role-based access control via middleware
- Separate login page for super admins
- Automatic redirection based on user role
- Protected routes for super admin dashboard

## Setup Instructions

### Step 1: Create Super Admin Google Sheet

Create a new Google Sheet with the name "SuperAdmin" with the following sheets:

#### Sheet 1: Institutions
Create a sheet named "Institutions" with these columns:
```
A: ID
B: Name
C: Code
D: Type (university/college/school)
E: Address
F: City
G: State
H: Country
I: Pincode
J: Contact Email
K: Contact Phone
L: Principal Name
M: Spreadsheet ID
N: Status (active/inactive/suspended)
O: Registered Date
P: Last Active
Q: Admin Count
R: Student Count
S: Faculty Count
```

#### Sheet 2: SharedResources
Create a sheet named "SharedResources" with these columns:
```
A: ID
B: Title
C: Description
D: Type (ebook/video/document/course/template)
E: Category
F: URL
G: Sheet URL
H: Thumbnail URL
I: Uploaded By
J: Uploaded Date
K: Access Count
L: Tags (comma-separated)
M: Status (active/archived)
```

### Step 2: Configure Environment Variables

Add the following environment variable to your `.env.local` file:

```env
# Super Admin Sheet ID
SUPER_ADMIN_SHEET_ID=your_super_admin_sheet_id_here
```

To get the Sheet ID:
1. Open your SuperAdmin Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/{THIS_IS_THE_ID}/edit`
3. Paste it in the `.env.local` file

### Step 3: Create Super Admin User

1. Run the script to generate super admin credentials:
```bash
npx tsx scripts/addSuperAdmin.ts
```

2. Copy the output and add a new row to your existing **Users** sheet with these values:
```
ID: SA001
Email: superadmin@easyerp.com
Name: System Administrator
Password: [Use the hashed password from script output]
Role: super-admin
Department: System
Status: active
```

### Step 4: Share Super Admin Sheet

1. Open the SuperAdmin Google Sheet
2. Click "Share" button
3. Add your service account email (found in your `GOOGLE_SERVICE_ACCOUNT_KEY`)
4. Give "Editor" permissions
5. Click "Send"

### Step 5: Add Sample Institution (Optional)

Add a sample institution to test the system:

In the "Institutions" sheet:
```
INST-001 | ABC University | ABC | university | 123 Main St | Mumbai | Maharashtra | India | 400001 | contact@abc.edu | +91-1234567890 | Dr. John Doe | YOUR_INSTITUTION_SHEET_ID | active | 2024-01-01 | 2024-12-09 | 5 | 1000 | 50
```

### Step 6: Test Super Admin Login

1. Navigate to: `http://localhost:3000/super-admin-login`
2. Login with credentials:
   - Email: `superadmin@easyerp.com`
   - Password: `SuperAdmin@2024` (or the one you set)
3. You should be redirected to: `/dashboard/super-admin`

## Dashboard Features

### Institutions Tab
- **View All Institutions**: See list of all registered institutions
- **Institution Cards**: Display key metrics (students, faculty, status)
- **Status Badges**: Visual indicators for active/inactive/suspended institutions
- **Quick Actions**: View details, manage settings

### Shared Resources Tab
Currently shows temporary resource cards:
- E-Books Library
- Video Lectures
- Study Materials
- Templates & Forms
- Course Content
- Research Papers

*Note: Full resource management features will be added in next phase*

### Analytics Tab
- **Institution Performance**: Top performing institutions by student count
- **Recent Activity**: System events and updates
- **Usage Statistics**: System-wide metrics

## File Structure

```
src/
├── actions/
│   └── superadmin/
│       ├── institutions.ts    # Institution CRUD operations
│       └── resources.ts       # Resources and stats operations
├── app/
│   ├── dashboard/
│   │   └── super-admin/
│   │       ├── page.tsx       # Main dashboard page
│   │       ├── institutions/
│   │       └── resources/
│   └── super-admin-login/
│       └── page.tsx           # Super admin login page
├── components/
│   └── super-admin/
│       ├── dashboard.tsx      # Dashboard component
│       └── login-form.tsx     # Login form component
├── lib/
│   └── google/
│       └── sheets.superadmin.ts  # Google Sheets operations
├── types/
│   └── auth.ts                # Updated with super-admin types
└── middleware.ts              # Updated with super-admin protection
```

## Security Considerations

1. **Change Default Password**: Immediately change the super admin password after first login
2. **Secure Credentials**: Store super admin credentials in a password manager
3. **Limit Access**: Only provide super admin access to trusted personnel
4. **Monitor Activity**: Regularly review super admin access logs
5. **Environment Variables**: Never commit `.env.local` to version control

## Next Steps

### Phase 2: Enhanced Features (Upcoming)
- [ ] Full institution CRUD operations
- [ ] Actual shared resources management
- [ ] Upload and manage resources
- [ ] Access logs and audit trail
- [ ] Advanced analytics and reports
- [ ] Bulk operations for institutions
- [ ] Email notifications for system events
- [ ] Multi-factor authentication (MFA)
- [ ] API access for integrations

## Troubleshooting

### Issue: Cannot access super-admin dashboard
**Solution**: 
- Verify the user has `super-admin` role in Users sheet
- Check middleware is protecting the route correctly
- Clear browser cache and cookies

### Issue: "SUPER_ADMIN_SHEET_ID is not configured" error
**Solution**:
- Ensure `.env.local` has `SUPER_ADMIN_SHEET_ID` variable
- Restart the development server after adding environment variables

### Issue: Google Sheets API errors
**Solution**:
- Verify service account has access to SuperAdmin sheet
- Check service account credentials are valid
- Ensure sheet names match exactly (case-sensitive)

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify Google Sheets setup and permissions
3. Ensure all environment variables are configured
4. Review the middleware and auth configuration

---

**Version**: 1.0.0  
**Last Updated**: December 9, 2024  
**Status**: ✅ Production Ready
