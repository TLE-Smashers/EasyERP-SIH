# ✅ Super Admin Setup Checklist - Government of Rajasthan

## Quick Setup Checklist

### 1. Google Sheet Setup
- [ ] Open your existing **EasyERP-Federation-Master** sheet
- [ ] Add a new tab named: **Institutions**
- [ ] Add 19 column headers (ID, Name, Code, Type, Address, City, State, Country, Pincode, Contact Email, Contact Phone, Principal Name, Spreadsheet ID, Status, Registered Date, Last Active, Admin Count, Student Count, Faculty Count)
- [ ] Verify existing tabs: Shared_Ebooks, LibraryResources, Shared_Notes

### 2. Environment Configuration
- [x] ✅ Already configured! Your `.env.local` has:
  ```env
  SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI
  ```
- [ ] If needed, restart dev server: `pnpm dev`

### 3. Create Super Admin User
- [ ] Run: `npx tsx scripts/addSuperAdmin.ts`
- [ ] Copy the hashed password from output
- [ ] Open your **Users** Google Sheet
- [ ] Add new row with:
  - ID: `GOV-RAJ-001`
  - Email: `rajasthan.gov@easyerp.com` (or your official email)
  - Name: `Government of Rajasthan`
  - Password: [paste hashed password]
  - Role: `super-admin`
  - Department: `Government`
  - Status: `active`

### 4. Add Sample Institutions
- [ ] Go to the new **Institutions** tab
- [ ] Add at least 2-3 government institutions (see examples in setup guide)
- [ ] Fill in all required columns
- [ ] Set Status to `active`

### 5. Verify Access
- [ ] Open Federation Master sheet → Share
- [ ] Ensure service account has Editor access
- [ ] Service account email from GOOGLE_SERVICE_ACCOUNT_KEY

### 6. Test Login
- [ ] Navigate to: `http://localhost:3000/super-admin-login`
- [ ] Enter email: `rajasthan.gov@easyerp.com`
- [ ] Enter password: `SuperAdmin@2024`
- [ ] Should redirect to: `/dashboard/super-admin`

### 7. Verify Dashboard
- [ ] Check Statistics cards display correct numbers
- [ ] Click **Institutions** tab → See your added institutions
- [ ] Click **Shared Resources** tab → See resources from 3 tabs
- [ ] Click **Analytics** tab → See system activity

### 8. Security
- [ ] Change default password after first login
- [ ] Save credentials in secure password manager
- [ ] Note down sheet IDs for backup

## Sample Institution Entry

Copy this template for adding institutions:

```
INST-001 | Govt. College Jaipur | GCJ | college | Sector 15 | Jaipur | Rajasthan | India | 302017 | principal@gcj.ac.in | +91-141-1234567 | Dr. Name | your_institution_sheet_id | active | 2024-12-09 | 2024-12-09 | 5 | 2000 | 100
```

## Quick Commands

```bash
# Generate super admin credentials
npx tsx scripts/addSuperAdmin.ts

# Start dev server
pnpm dev

# Check environment variables
grep SUPER_MASTER .env.local
```

## URLs

- **Super Admin Login**: `http://localhost:3000/super-admin-login`
- **Dashboard**: `http://localhost:3000/dashboard/super-admin`
- **Institutions**: `http://localhost:3000/dashboard/super-admin/institutions`

## Common Issues

### ❌ Can't login
**Fix**: Verify role is `super-admin` in Users sheet

### ❌ No institutions showing
**Fix**: Check "Institutions" tab exists and has data

### ❌ No resources showing
**Fix**: Verify existing tabs: Shared_Ebooks, LibraryResources, Shared_Notes

### ❌ Environment variable error
**Fix**: Verify SUPER_MASTER_SHEET_ID is in .env.local and restart server

## Success Indicators

✅ Login successful at `/super-admin-login`
✅ Dashboard shows statistics
✅ Institutions tab displays your institutions
✅ Shared Resources shows items from all 3 tabs
✅ Can navigate between tabs smoothly

## What You Get

- **Centralized Dashboard**: View all institutions and resources
- **Statistics**: Real-time counts and metrics
- **Institution Management**: Track all government institutions
- **Resource Oversight**: See all shared educational resources
- **Government Control**: Highest level access to the system

## Sheet Structure Summary

**Sheet Name**: EasyERP-Federation-Master

**Tabs**:
1. ✅ Shared_Ebooks (existing)
2. ✅ LibraryResources (existing)
3. ✅ Shared_Notes (existing)
4. 🆕 Institutions (NEW - add this)

## Next Steps After Setup

1. [ ] Add all Rajasthan government institutions
2. [ ] Verify existing resources are accessible
3. [ ] Plan institution onboarding process
4. [ ] Set up monitoring and analytics
5. [ ] Plan Phase 2 features (full CRUD)

---

**Estimated Setup Time**: 15-20 minutes

**Support**: See `SUPER_ADMIN_RAJASTHAN_SETUP.md` for detailed instructions

**Status**: Ready for production after completing checklist ✅
