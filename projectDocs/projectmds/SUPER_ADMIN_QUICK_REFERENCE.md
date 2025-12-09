# 🚀 Super Admin - Quick Reference

## ✅ Current Setup Status

Your environment is **already configured**:

```env
SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI
CURRENT_INSTITUTION_ID=INST001
CURRENT_INSTITUTION_NAME="Purnima Institute of Engineering & Technology"
```

## 📋 What You Need to Do Now

### 1. Add "Institutions" Tab
In your **EasyERP-Federation-Master** sheet (ID: `1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI`):

**Click + to add new tab → Name it "Institutions"**

**Add these column headers (Row 1):**
```
ID | Name | Code | Type | Address | City | State | Country | Pincode | 
Contact Email | Contact Phone | Principal Name | Spreadsheet ID | 
Status | Registered Date | Last Active | Admin Count | Student Count | Faculty Count
```

### 2. Create Super Admin User

**Run this command:**
```bash
npx tsx scripts/addSuperAdmin.ts
```

**Output will give you:**
- Email: `superadmin@easyerp.com`
- Password: `SuperAdmin@2024`
- Hashed password: [copy this]

### 3. Add User to Users Sheet

Open your **Users** sheet and add:
```
GOV-RAJ-001 | rajasthan.gov@easyerp.com | Government of Rajasthan | [hashed_password] | super-admin | Government | active
```

### 4. Add Sample Institution

In the new **Institutions** tab, add:
```
INST-001 | Govt. College Jaipur | GCJ | college | Sector 15 | Jaipur | Rajasthan | India | 302017 | principal@gcj.ac.in | +91-141-1234567 | Dr. Name | 1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw | active | 2024-12-09 | 2024-12-09 | 5 | 2000 | 100
```

### 5. Login & Test

**Visit:** `http://localhost:3000/super-admin-login`

**Login with:**
- Email: `rajasthan.gov@easyerp.com`
- Password: `SuperAdmin@2024`

## 🎯 What You'll See

### Dashboard will show:
- **Total Institutions**: From your Institutions tab
- **Total Resources**: Combined from Shared_Ebooks + LibraryResources + Shared_Notes
- **Statistics**: Across all government institutions

### Three Tabs:
1. **Institutions** - Your added institutions
2. **Shared Resources** - All resources from 3 existing tabs
3. **Analytics** - System metrics

## 📊 Your Existing Tabs (Already Working)

✅ **Shared_Ebooks** - Will show in dashboard
✅ **LibraryResources** - Will show in dashboard  
✅ **Shared_Notes** - Will show in dashboard

Only need to add: 🆕 **Institutions** tab

## 🔧 Commands

```bash
# Create super admin credentials
npx tsx scripts/addSuperAdmin.ts

# Check environment (already configured ✅)
grep SUPER_MASTER .env.local

# Start server (if not running)
pnpm dev
```

## 📍 URLs

- Login: `http://localhost:3000/super-admin-login`
- Dashboard: `http://localhost:3000/dashboard/super-admin`
- Institutions: `http://localhost:3000/dashboard/super-admin/institutions`

## ⚡ Quick Checklist

- [ ] Add "Institutions" tab to sheet `1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI`
- [ ] Run `npx tsx scripts/addSuperAdmin.ts`
- [ ] Add super-admin user to Users sheet
- [ ] Add sample institution to Institutions tab
- [ ] Login at `/super-admin-login`
- [ ] Verify dashboard shows data

## 🎉 That's It!

**Time needed:** ~10-15 minutes

Your system is ready to become a centralized government ERP management platform!

---

**Sheet:** EasyERP-Federation-Master (ID: `1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI`)
**Role:** Government of Rajasthan
**Status:** ✅ Ready to setup
