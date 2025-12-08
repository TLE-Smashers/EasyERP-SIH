# 🔐 Authentication Setup Guide

Complete authentication system with Google Sheets backend and role-based access control.

## 📋 Features Implemented

✅ Email/Password Authentication  
✅ Google Sheets as Database  
✅ Role-Based Access Control (7 roles)  
✅ Protected Routes with Middleware  
✅ Session Management  
✅ Beautiful Login UI  
✅ Google OAuth Ready (commented)  

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Already installed:
- ✅ next-auth@beta
- ✅ bcryptjs
- ✅ googleapis
- ✅ zod, react-hook-form, @hookform/resolvers

### Step 2: Set Up Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a New Project** (or use existing)
   - Name: "Easy ERP"

3. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search "Google Sheets API"
   - Click "Enable"

4. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name: "erp-backend-service"
   - Click "Create and Continue"
   - Skip optional steps
   - Click "Done"

5. **Generate Service Account Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON"
   - Download the JSON file
   - **Keep this file secure!**

### Step 3: Create Google Sheet for Users

1. **Create a new Google Sheet named "ERP Users"**

2. **Set up columns** (First row as headers):
   ```
   | Email | Name | Password | Role | Department | Status |
   ```

3. **Add test users** (use hashed passwords):
   
   To hash passwords, run:
   ```bash
   npx ts-node scripts/hashPassword.ts password123
   ```

   Example data:
   ```
   admin@test.com | Admin User | $2a$10$... | admin | - | active
   admission@test.com | John Doe | $2a$10$... | admission | Admission | active
   student@test.com | Student A | $2a$10$... | student | CSE | active
   ```

4. **Share Sheet with Service Account**
   - Click "Share" button
   - Paste the service account email from the JSON file
   - Set to "Editor"
   - Uncheck "Notify people"
   - Click "Share"

5. **Copy the Sheet ID**
   - From URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Save this ID

### Step 4: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`:**
   ```env
   # Generate secret
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   
   # From Service Account JSON
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@...
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # Your Sheet ID
   USERS_SHEET_ID=your-sheet-id-here
   ```

   **Important:** For `GOOGLE_PRIVATE_KEY`, copy the entire `private_key` value from the JSON file, including the quotes and newlines (`\n`).

### Step 5: Test Authentication

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/login
   ```

3. **Test login with:**
   ```
   Email: admin@test.com
   Password: password123
   ```

4. **You should see:**
   - Redirect to dashboard
   - Welcome message with user name
   - Role displayed
   - Role-based sidebar menu

---

## 🔑 User Roles & Access

| Role | Access |
|------|--------|
| **admin** | Full access to all modules |
| **admission** | Admission module only |
| **accountant** | Accounts/Finance module only |
| **warden** | Hostel management only |
| **librarian** | Library management only |
| **student** | Personal profile, fees, library |
| **faculty** | Profile, classes, students |

---

## 📁 File Structure Created

```
/src
  /types
    auth.ts                    ← User types
    next-auth.d.ts             ← NextAuth type extensions
  
  /lib
    /auth
      auth.ts                  ← Auth helpers
      auth.config.ts           ← NextAuth configuration
    /google
      sheets.ts                ← Google Sheets utilities
  
  /actions
    /auth
      getUserByEmail.ts        ← Fetch user from Sheets
  
  /config
    navigation.ts              ← Role-based navigation
  
  /app
    /api
      /auth/[...nextauth]
        route.ts               ← NextAuth API route
    /login
      page.tsx                 ← Login page
    /dashboard
      page.tsx                 ← Dashboard (protected)
  
  /components
    app-sidebar.tsx            ← Role-based sidebar
    login-form.tsx             ← Login form with NextAuth
  
  /scripts
    hashPassword.ts            ← Password hashing utility
  
  middleware.ts                ← Route protection
  .env.example                 ← Environment variables template
```

---

## 🧪 Testing Different Roles

Create multiple test users in your Google Sheet with different roles:

```javascript
// Hash passwords first
npx ts-node scripts/hashPassword.ts password123
```

Then add to Google Sheet:
```
admin@test.com      | Admin User    | $2a$10$hash... | admin       | -          | active
admission@test.com  | John Doe      | $2a$10$hash... | admission   | Admission  | active
accountant@test.com | Jane Smith    | $2a$10$hash... | accountant  | Accounts   | active
warden@test.com     | Mike Wilson   | $2a$10$hash... | warden      | Hostel     | active
librarian@test.com  | Sarah Brown   | $2a$10$hash... | librarian   | Library    | active
student@test.com    | Student A     | $2a$10$hash... | student     | CSE        | active
faculty@test.com    | Prof. Kumar   | $2a$10$hash... | faculty     | CSE        | active
```

Login with each to see different sidebar menus!

---

## 🔄 Adding Google OAuth (Optional)

Currently commented out. To enable:

1. **Create OAuth Credentials in Google Cloud:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret

2. **Uncomment in `.env.local`:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Uncomment in `auth.config.ts`:**
   ```typescript
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID!,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   }),
   ```

4. **Uncomment in `login-form.tsx`:**
   ```tsx
   <Button onClick={() => signIn("google")}>
     Sign in with Google
   </Button>
   ```

---

## 🐛 Troubleshooting

### Error: "USERS_SHEET_ID not configured"
- Make sure `.env.local` exists and has the correct Sheet ID

### Error: "Failed to fetch data from Google Sheets"
- Check if Sheet is shared with service account email
- Verify service account credentials are correct
- Check Sheet name is exactly "Users"

### Error: "Invalid email or password"
- Make sure password in Sheet is properly hashed
- Use the `hashPassword.ts` script to generate hashes

### Hydration Error
- Already fixed with `suppressHydrationWarning` in layout

---

## 🎉 Success!

You now have a complete authentication system with:
- ✅ Secure login with bcrypt password hashing
- ✅ Google Sheets as backend database
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Session management
- ✅ Beautiful UI with ShadCN

**Next Steps:**
- Build individual modules (Admission, Accounts, etc.)
- Add more features to dashboard
- Implement data tables with AG Grid
- Add form submissions to Google Sheets

---

## 📝 Notes

- All Google Sheets logic is isolated in `/actions` and `/lib/google/`
- Easy to replace with real database (MongoDB, PostgreSQL) later
- Just modify files in `/actions` - UI components remain unchanged
- Follows SOLID principles throughout

**Happy Coding! 🚀**
