# User Profile System - Implementation Guide

## Overview
The User Profile System allows authenticated users to view and manage their account information, including name, email, role, and department. The system is built following SOLID principles with a clean separation of concerns.

## Architecture

### Components & Pages Created

#### 1. **Sidebar User Component** (`src/components/nav-user.tsx`)
- Displays logged-in user information with avatar
- Dropdown menu with navigation to Profile and Settings
- Logout functionality
- Uses ChevronRight icon for visual consistency

**Features:**
- Avatar with user initials as fallback
- Quick access to Profile and Settings pages
- One-click logout

#### 2. **Profile Page** (`src/app/dashboard/profile/page.tsx`)
- Main user profile display page
- Shows comprehensive user information:
  - Avatar and basic info
  - Email address
  - Role (formatted for display)
  - Department (if available)
  - Account status
  - User ID
- Provides quick access to edit profile
- Responsive design (profile card on mobile, grid layout on desktop)

**Key Features:**
- Server-side rendering with authentication check
- Formatted role display (e.g., "admission" → "Admission")
- Security section linking to settings
- Beautiful card-based layout

#### 3. **Edit Profile Page** (`src/app/dashboard/profile/edit/page.tsx`)
- Client-side form for updating profile information
- Editable fields:
  - Full Name (required)
  - Department (optional)
- Read-only fields:
  - Email Address
  - Role
- Form validation and error handling
- Loading states during data fetch and submission
- Toast notifications for user feedback

**Key Features:**
- Server action integration with `updateUserProfile`
- Real-time form state management
- Loading spinners during submission
- Clear success/error messaging
- Back navigation to profile page

#### 4. **Settings Page** (`src/app/dashboard/settings/page.tsx`)
- Centralized settings management
- Three main sections:
  - **Security**: Password, 2FA, Active Sessions (future)
  - **Notifications**: Email and app notifications (future)
  - **Privacy**: Profile visibility, data export (future)
  - **Danger Zone**: Account deletion (future)
- Expandable for future feature additions
- All options clearly labeled as "Coming Soon"

**Key Features:**
- Organized card-based layout
- Color-coded sections (blue for security, orange for notifications, etc.)
- Consistent UI with info messages
- Easy to extend with new settings

### Server Actions

#### 1. **getUserProfile** (`src/actions/profile/getUserProfile.ts`)
Fetches current user's profile from Google Sheets.

**Function Signature:**
```typescript
async function getUserProfile(): Promise<User | null>
```

**Flow:**
1. Validates session authentication
2. Fetches user data from Google Sheets by email
3. Returns user object without password
4. Handles errors gracefully

#### 2. **updateUserProfile** (`src/actions/profile/updateUserProfile.ts`)
Updates user profile information in Google Sheets.

**Function Signature:**
```typescript
async function updateUserProfile(
  name: string,
  department?: string
): Promise<ApiResponse>
```

**Flow:**
1. Validates authentication
2. Validates input (name required)
3. Finds user row in Google Sheets
4. Updates name and department
5. Returns success/error response

**Validation:**
- Name must not be empty
- Email and role cannot be changed (read-only in UI)
- Department is optional

## Data Flow

### Profile View Flow
```
User clicks Profile (navbar) 
    ↓
Client loads /dashboard/profile
    ↓
Server checks authentication
    ↓
getUserProfile() action
    ↓
Fetch from Google Sheets
    ↓
Display user info (server-rendered)
```

### Profile Edit Flow
```
User clicks Edit Profile button
    ↓
Client loads /dashboard/profile/edit
    ↓
useEffect fetches profile via getUserProfile()
    ↓
Form renders with current data
    ↓
User updates name/department
    ↓
Form submission
    ↓
updateUserProfile() server action
    ↓
Google Sheets updated
    ↓
Toast notification
    ↓
Redirect to profile page
```

## API Integration Points

### Google Sheets Integration
All profile data is stored in the `Users` sheet with the following structure:

**Columns (A:G):**
- A: Email
- B: Name
- C: Password (hashed)
- D: Role
- E: Department
- F: Status
- G: LastLogin

### Server Actions Location
```
src/actions/
├── profile/
│   ├── getUserProfile.ts      (fetch user)
│   └── updateUserProfile.ts   (update user)
└── auth/
    └── getUserByEmail.ts      (used by profile actions)
```

## UI Components Used

**Shadcn UI Components:**
- `Button` - All interactive buttons
- `Card` - Layout containers
- `Input` - Form fields
- `Label` - Form labels
- `Badge` - Status badges
- `Avatar` - User avatars
- `Skeleton` - Loading states

**Icons (lucide-react):**
- `ArrowLeft` - Navigation back
- `Edit2` - Edit button
- `Mail`, `Briefcase`, `User`, `Phone` - Information icons
- `Lock`, `Bell`, `Eye` - Settings section icons
- `Loader2` - Loading spinner

## Authentication & Authorization

**Protection:**
- All profile pages require authentication (`auth()` check)
- Unauthenticated users redirected to `/login`
- Server actions validate session before processing

**User Data Access:**
- Users can only see/edit their own profile
- Email and role cannot be modified by users
- Department can be updated by user if allowed by admin

## Error Handling

**Profile Actions:**
1. Authentication failures → Redirect to login
2. User not found → Redirect to login
3. Invalid input → Toast error message
4. Google Sheets errors → Generic error message with logging

**Client-side:**
- Try-catch blocks in useEffect and form handlers
- Toast notifications for all errors
- User-friendly error messages
- Loading states prevent double submissions

## Future Enhancements

1. **Password Change**
   - Secure password update with verification
   - Password strength requirements

2. **Two-Factor Authentication**
   - Email/SMS OTP verification
   - TOTP authenticator app support

3. **Session Management**
   - View all active sessions
   - Remote logout capability

4. **Notification Preferences**
   - Email notification toggles
   - In-app notification settings
   - Notification frequency preferences

5. **Data Export**
   - Export all user data as JSON/CSV
   - GDPR compliance features

6. **Account Deletion**
   - 30-day deletion request with confirmation
   - Data cleanup from Google Sheets

## File Structure

```
src/
├── actions/
│   └── profile/
│       ├── getUserProfile.ts
│       └── updateUserProfile.ts
├── app/
│   └── dashboard/
│       ├── profile/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── edit/
│       │       └── page.tsx
│       └── settings/
│           ├── layout.tsx
│           └── page.tsx
└── components/
    └── nav-user.tsx (updated)
```

## Testing Checklist

- [ ] Login and view profile page
- [ ] Profile displays correct user information
- [ ] Edit profile with valid data
- [ ] Edit profile with empty name (should error)
- [ ] Navigate from navbar dropdown to profile
- [ ] Navigate from navbar dropdown to settings
- [ ] Logout from dropdown menu
- [ ] Navigation back buttons work
- [ ] Loading states display correctly
- [ ] Toast notifications appear on success/error
- [ ] Email and role fields are read-only
- [ ] Department updates save to Google Sheets
- [ ] Unauthenticated access redirects to login

## Environment Variables Required

```
USERS_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

## Performance Considerations

1. **Server-side Rendering**: Profile pages use SSR for faster initial load
2. **Google Sheets Caching**: Consider implementing caching for frequently accessed user data
3. **Form Optimization**: Edit page uses client-side state management to prevent unnecessary API calls
4. **Lazy Loading**: Settings page sections can be expanded for future lazy loading

## Security Considerations

1. **Password Protection**: Passwords never exposed to client
2. **Email Immutability**: Email cannot be changed by user (prevent ID spoofing)
3. **Role Immutability**: Role cannot be changed by user (prevent privilege escalation)
4. **HTTPS Only**: All profile data transferred over secure connections
5. **Session Validation**: Every action validates authentication

## Accessibility

- Semantic HTML structure
- ARIA labels on form inputs
- Keyboard navigation support
- Loading and disabled states
- Error messages linked to form fields
- Color not the only indicator (icons used)
