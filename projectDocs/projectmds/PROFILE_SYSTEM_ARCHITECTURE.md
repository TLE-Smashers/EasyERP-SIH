# Profile System Architecture

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SIDEBAR (app-sidebar.tsx)                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      NavUser Component                           │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │ [Avatar] User Name              [Chevron Right Icon >]     │  │   │
│  │  │          user@email.com                                    │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  │                                                                   │   │
│  │  Dropdown Menu:                                                  │   │
│  │  ├─ Profile Link ─────────────────────> /dashboard/profile      │   │
│  │  ├─ Settings Link ─────────────────────> /dashboard/settings    │   │
│  │  └─ Logout Button ─────────────────────> Sign out               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     ↓↓↓
                          Page Navigation Routes
                                     ↓↓↓

┌─────────────────────────────────────────────────────────────────────────┐
│                    PROFILE PAGES & COMPONENTS                           │
│                                                                          │
│  Route 1: /dashboard/profile (page.tsx)                                 │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ [Header] Back Button | Profile Title                          │     │
│  │                                                                │     │
│  │ [Profile Card Section]              [Account Info Card]       │     │
│  │ ┌──────────────────────┐            ┌──────────────────────┐  │     │
│  │ │ [Avatar: KS]         │            │ Email: ...@email.com │  │     │
│  │ │ Kanhaiya Lal Sahu    │            │ Role: Admission      │  │     │
│  │ │ admin@test.com       │            │ Department: ...      │  │     │
│  │ │ [Admin Badge]        │            │ Status: Active       │  │     │
│  │ │ [Edit Profile Btn]   │            │ ID: ...              │  │     │
│  │ └──────────────────────┘            └──────────────────────┘  │     │
│  │                                                                │     │
│  │ [Security Section]                                            │     │
│  │ ├─ Change Password Button (Coming Soon)                       │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Route 2: /dashboard/profile/edit (edit/page.tsx)                       │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ [Header] Back Button | Edit Profile Title                     │     │
│  │                                                                │     │
│  │ [Edit Form Card]                                              │     │
│  │ ┌────────────────────────────────────────────────────────────┐│     │
│  │ │ Email: user@email.com (READ-ONLY)                         ││     │
│  │ │ Role: Admin (READ-ONLY)                                   ││     │
│  │ │ [Name Input Field] ●●●●●●●●●●                            ││     │
│  │ │ [Department Input Field] (optional)                       ││     │
│  │ │                                                            ││     │
│  │ │ [Cancel Button] [Save Changes Button with spinner]       ││     │
│  │ └────────────────────────────────────────────────────────────┘│     │
│  │                                                                │     │
│  │ [Info Box - Blue Background]                                  │     │
│  │ Note: Email and role cannot be changed...                     │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Route 3: /dashboard/settings (../settings/page.tsx)                    │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ [Header] Back Button | Settings Title                         │     │
│  │                                                                │     │
│  │ [Security Card]  [🔒 Icon]                                    │     │
│  │ ├─ Change Password ................... [Coming Soon]          │     │
│  │ ├─ Two-Factor Authentication ......... [Disabled]            │     │
│  │ └─ Active Sessions ................... [Coming Soon]          │     │
│  │                                                                │     │
│  │ [Notifications Card]  [🔔 Icon]                               │     │
│  │ ├─ Email Notifications .............. [Coming Soon]          │     │
│  │ └─ Application Updates .............. [Coming Soon]           │     │
│  │                                                                │     │
│  │ [Privacy Card]  [👁️  Icon]                                    │     │
│  │ ├─ Profile Visibility ............... [Coming Soon]          │     │
│  │ └─ Data Export ...................... [Coming Soon]          │     │
│  │                                                                │     │
│  │ [Danger Zone Card] (Red border)                               │     │
│  │ └─ Delete Account ................... [Coming Soon]          │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                     ↓↓↓
                         User Data & State Management
                                     ↓↓↓

┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVER ACTIONS LAYER                             │
│                                                                          │
│  getUserProfile()                    updateUserProfile()               │
│  ┌──────────────────────┐            ┌──────────────────────┐         │
│  │ • Check auth session │            │ • Validate auth      │         │
│  │ • Get user email     │            │ • Validate input     │         │
│  │ • Fetch from sheets  │            │ • Find user in sheet │         │
│  │ • Remove password    │            │ • Update row         │         │
│  │ • Return user object │            │ • Return response    │         │
│  └──────────────────────┘            └──────────────────────┘         │
│           ↓                                      ↓                     │
│     Returns Promise<User>             Returns Promise<ApiResponse>    │
└─────────────────────────────────────────────────────────────────────────┘
                                     ↓↓↓
                    Google Sheets API & Data Persistence
                                     ↓↓↓

┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE SHEETS DATA                              │
│                                                                          │
│  Sheet: "Users"                                                        │
│  ┌────────┬──────────┬────────┬──────┬────────────┬────────┬──────────┐│
│  │ Email  │  Name    │ Pwd    │ Role │ Department │ Status │ LastLgn  ││
│  ├────────┼──────────┼────────┼──────┼────────────┼────────┼──────────┤│
│  │admin@  │ Kanhaiya │ hashed │admin │ Admin      │ active │ 2025-11  ││
│  │test.com│ Lal Sahu │ pwd123 │      │ Office     │        │ -24 ...  ││
│  ├────────┼──────────┼────────┼──────┼────────────┼────────┼──────────┤│
│  │adm@    │ John     │ hashed │admis │ Admissions │ active │ 2025-11  ││
│  │ent.com │ Doe      │ pwd456 │ sion │ Dept       │        │ -23 ...  ││
│  ├────────┼──────────┼────────┼──────┼────────────┼────────┼──────────┤│
│  │lib@    │ Jane     │ hashed │libra │ Library    │ active │ 2025-11  ││
│  │lib.com │ Smith    │ pwd789 │ rian │ Section    │        │ -22 ...  ││
│  └────────┴──────────┴────────┴──────┴────────────┴────────┴──────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Profile View Flow
```
User clicks "Profile" 
    ↓
Browser navigates to /dashboard/profile
    ↓
Server: auth() → validates session
    ↓
Server: getUserProfile()
    ├─ auth() → get current user email
    ├─ getUserByEmail(email)
    │   └─ getSheetData() → fetch from Google Sheets
    └─ remove password, return User object
    ↓
React renders ProfilePage
    ├─ Display avatar with initials
    ├─ Display formatted user info
    ├─ Display account status
    └─ Show "Edit Profile" button
    ↓
Page fully rendered to user
```

### Profile Edit Flow
```
User clicks "Edit Profile" button
    ↓
Browser navigates to /dashboard/profile/edit
    ↓
Client: useEffect hook runs
    ├─ Check session with useSession()
    ├─ Call getUserProfile() server action
    ├─ Update form state with user data
    └─ Show loading skeleton while fetching
    ↓
User sees form pre-filled with current data
    ├─ Email: READ-ONLY
    ├─ Role: READ-ONLY
    ├─ Name: EDITABLE
    └─ Department: EDITABLE
    ↓
User modifies form and clicks "Save Changes"
    ↓
Client: Form submission handler
    ├─ Validate name (required, not empty)
    ├─ Show loading spinner
    ├─ Disable submit button
    └─ Call updateUserProfile() server action
    ↓
Server: updateUserProfile() processes
    ├─ Validate auth session
    ├─ Validate input (name required)
    ├─ Get USERS_SHEET_ID from env
    ├─ Fetch all users from Google Sheets
    ├─ Find user by email (case-insensitive)
    ├─ Build updated row [Email, NewName, Pwd, Role, NewDept, Status, LastLgn]
    ├─ Call updateSheetRow() for specific row
    └─ Return ApiResponse {success: true/false, error?: string}
    ↓
Client: Handle response
    ├─ If success:
    │  ├─ Show success toast
    │  ├─ Redirect to /dashboard/profile
    │  └─ User sees updated profile
    └─ If error:
       ├─ Show error toast with message
       ├─ Keep form visible
       └─ User can retry
```

### Settings Navigation Flow
```
User clicks "Settings"
    ↓
Browser navigates to /dashboard/settings
    ↓
Server: auth() → validates session
    ↓
React renders SettingsPage
    ├─ Security section
    │  ├─ Change Password (Coming Soon)
    │  ├─ 2FA (Disabled)
    │  └─ Active Sessions (Coming Soon)
    ├─ Notifications section
    │  ├─ Email Notifications (Coming Soon)
    │  └─ App Updates (Coming Soon)
    ├─ Privacy section
    │  ├─ Profile Visibility (Coming Soon)
    │  └─ Data Export (Coming Soon)
    └─ Danger Zone section
       └─ Delete Account (Coming Soon)
    ↓
Page fully rendered
    ↓
All settings ready for future implementation
```

## Component Hierarchy

```
AppSidebar (app-sidebar.tsx)
├── SidebarHeader
│   └── TeamSwitcher
├── SidebarContent
│   └── NavMain
└── SidebarFooter
    └── NavUser ✨ UPDATED
        ├── Avatar (user image/initials)
        ├── User name & email display
        └── DropdownMenu
            ├── Profile Link → /dashboard/profile
            ├── Settings Link → /dashboard/settings
            └── Logout Action

Dashboard Layout (layout.tsx)
├── AppSidebar
└── SidebarInset
    ├── Header
    └── Main Content
        ├── /dashboard/profile ✨ NEW
        │   └── ProfilePage
        │       ├── Avatar Card
        │       └── Info Cards
        │
        ├── /dashboard/profile/edit ✨ NEW
        │   └── EditProfilePage
        │       └── EditForm
        │
        └── /dashboard/settings ✨ NEW
            └── SettingsPage
                ├── Security Card
                ├── Notifications Card
                ├── Privacy Card
                └── Danger Zone Card
```

## File Dependencies

```
Components:
  nav-user.tsx
  ├── IMPORTS: lucide-react icons, shadcn UI components
  ├── USES: signOut (next-auth/react)
  ├── LINKS TO: /dashboard/profile, /dashboard/settings
  └── CALLS: No server actions (client component)

Pages:
  dashboard/profile/page.tsx
  ├── IMPORTS: getUserProfile action
  ├── USES: auth() for session check
  └── DISPLAYS: User profile info

  dashboard/profile/edit/page.tsx
  ├── IMPORTS: getUserProfile, updateUserProfile actions
  ├── USES: useSession(), useRouter(), toast
  ├── CALLS: getUserProfile() on mount
  └── CALLS: updateUserProfile() on form submit

  dashboard/settings/page.tsx
  ├── USES: auth() for session check
  └── DISPLAYS: Settings options (future-ready)

Server Actions:
  actions/profile/getUserProfile.ts
  ├── IMPORTS: auth, getUserByEmail
  ├── CALLS: auth() to get session
  └── CALLS: getUserByEmail() to fetch user

  actions/profile/updateUserProfile.ts
  ├── IMPORTS: auth, updateSheetRow, getSheetData
  ├── CALLS: auth() to get session
  ├── CALLS: getSheetData() to fetch users
  └── CALLS: updateSheetRow() to update Google Sheets

Utilities:
  lib/google/sheets.ts (existing)
  ├── getSheetData(sheetId, range)
  └── updateSheetRow(sheetId, range, values)

  lib/auth/auth.ts (existing)
  └── auth() - Get current session

  types/auth.ts (existing)
  ├── UserRole type
  ├── User interface
  └── AuthUser interface
```

## State Management Flow

```
Global State (Session):
  NextAuth manages authentication
  └── Session object passed via props/context

Profile Page (Server Component):
  const session = await auth()
  ↓
  const user = await getUserProfile()
  ↓
  Direct render (no state needed)

Edit Profile Page (Client Component):
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    department: ""
  })
  ↓
  useEffect loads user on mount
  ↓
  handleSubmit processes form submission
  ↓
  States updated during async operations

Settings Page (Server Component):
  const session = await auth()
  ↓
  Direct render (no state needed yet)
```

## Error Handling Flow

```
Auth Error:
  Session not found
  ├─ Profile page → redirect("/login")
  ├─ Edit page → redirect("/login")
  └─ Settings page → redirect("/login")

User Not Found:
  getUserProfile returns null
  └─ Edit page → redirect("/login")

Validation Error (Edit):
  Name is empty or only spaces
  ├─ Client-side validation → toast.error
  ├─ Form not submitted
  └─ User can correct input

Update Failed:
  Google Sheets API error
  ├─ Server logs error
  ├─ Return error response
  ├─ Client shows toast.error
  └─ User sees error message with retry option

Network Error:
  Connection failed
  ├─ Catch block in server action
  └─ Generic error message shown
```

This architecture ensures:
✅ Clear separation of concerns
✅ Type safety throughout
✅ Error handling at each layer
✅ Scalable and maintainable design
✅ Integration with existing ERP system
✅ Future-proof for additional features
