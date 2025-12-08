# 🚀 Hostel Room Management - Quick Start

## What's New?
Complete room management system for hostel module with full CRUD operations.

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Google Sheet
In your Google Spreadsheet, create a new sheet named **`HostelRooms`**

Add these headers in row 1:
```
hostel | roomNumber | occupants | maxOccupancy
```

### Step 2: Add Sample Rooms (Optional)
```
male   | B-101 |       | 2
male   | B-102 |       | 2
female | G-201 |       | 2
female | G-202 |       | 2
```

### Step 3: Set Environment Variable
Add to `.env.local` (if not already there):
```env
HOSTEL_ROOM_SHEET_NAME=HostelRooms
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

## ✨ Features Available

### Navigate to Room Management
```
Dashboard → Hostel → Room Management
or
Direct URL: /dashboard/hostel/rooms
```

### What You Can Do

#### 1. Add New Room
- Click **"Add Room"** button
- Select hostel type (Boys/Girls)
- Enter room number (e.g., B-103)
- Set max occupancy (1-4)
- Click **"Add Room"**

#### 2. Edit Room
- Click **"Edit"** button on any room
- Modify any details
- Click **"Update Room"**
- ✅ Room number changes auto-update all student allocations

#### 3. Delete Room
- Click **"Delete"** button on any room
- ⚠️ Room must be empty (no occupants)
- Confirm deletion

#### 4. Deallocate Student
- Click **"X"** icon next to student ID
- Confirm deallocation
- ✅ Updates both room and student application

### Filter Rooms
- **All** - View all rooms
- **Boys Hostel** - View only boys hostel rooms
- **Girls Hostel** - View only girls hostel rooms

## 📊 Room Statistics
View at a glance:
- **Total Rooms** - All rooms across both hostels
- **Available** - Empty rooms
- **Full** - Rooms at max capacity

## 🎯 Common Tasks

### Task: Add 10 New Rooms
1. Go to `/dashboard/hostel/rooms`
2. Click "Add Room" 10 times
3. Fill in details for each
4. Done! ✅

### Task: Change Room Number
1. Find the room in the table
2. Click "Edit"
3. Change room number
4. Click "Update Room"
5. All student allocations automatically updated! ✅

### Task: Remove Student from Room
1. Find the room with the student
2. Click X icon next to student ID
3. Confirm
4. Student deallocated! ✅

### Task: Delete Empty Rooms
1. Find empty rooms (Occupants: "Empty")
2. Click "Delete" button
3. Confirm
4. Room removed! ✅

## 🔧 Validation & Safety

### What's Prevented:
- ❌ Adding rooms with duplicate room numbers
- ❌ Deleting rooms that have students
- ❌ Invalid max occupancy (must be 1-4)
- ❌ Missing required fields

### What's Automatic:
- ✅ Updates student allocations when room number changes
- ✅ Syncs data with Google Sheets
- ✅ Shows toast notifications for all actions
- ✅ Refreshes page after successful operations

## 📱 User Interface

### Room Table Columns
| Column | Description |
|--------|-------------|
| **Hostel** | Badge showing Boys/Girls |
| **Room Number** | Unique room identifier |
| **Occupants** | Student IDs with deallocate option |
| **Max Occupancy** | Maximum students allowed |
| **Status** | Available/Partially Filled/Full |
| **Actions** | Edit and Delete buttons |

### Room Status Badges
- 🟢 **Available** - No occupants
- 🟡 **Partially Filled** - Has occupants but not full
- 🔵 **Full** - At max capacity

## 🐛 Troubleshooting

### Rooms Not Showing?
1. Check sheet name is `HostelRooms`
2. Verify service account has access
3. Refresh the page

### Can't Delete Room?
- Deallocate all students first
- Click X on each student ID
- Then try deleting again

### TypeScript Errors?
- Restart VS Code or the TypeScript server
- Errors will resolve automatically

### Changes Not Saving?
1. Check Google Sheets API quota
2. Verify service account permissions
3. Check browser console for errors

## 📚 More Information

For detailed documentation, see:
- `HOSTEL_ROOM_MANAGEMENT_COMPLETE.md` - Full implementation guide
- `HOSTELROOMS_SHEET_SETUP.md` - Detailed sheet setup
- `HOSTEL_ROOM_MANAGEMENT_SUMMARY.md` - Implementation summary

## 🎉 You're Ready!

The hostel room management system is fully set up and ready to use. Navigate to `/dashboard/hostel/rooms` and start managing rooms!

### Need Help?
- Check documentation files
- Review Google Sheets setup
- Verify environment variables
- Check service account permissions

---
**Built with**: Next.js, TypeScript, Google Sheets API, shadcn/ui, Sonner
