# Hostel Room Management - Complete Implementation Guide

## Overview
The hostel room management system allows administrators to create, edit, and delete hostel rooms through a user-friendly interface. The system integrates with Google Sheets to store room data and maintains consistency with student allocations.

## Google Sheets Structure

### HostelRooms Sheet
This sheet stores all hostel room information. Create this sheet with the following columns:

| Column | Name | Description | Example |
|--------|------|-------------|---------|
| A | hostel | Type of hostel (male/female) | male, female |
| B | roomNumber | Unique room identifier | B-101, G-205 |
| C | occupants | Comma-separated student IDs | 12345,67890 |
| D | maxOccupancy | Maximum students per room | 2, 3, 4 |

### Header Row (Row 1)
```
hostel | roomNumber | occupants | maxOccupancy
```

### Example Data
```
male   | B-101 |           | 2
male   | B-102 | 12345     | 2
female | G-201 | 67890,98765 | 2
female | G-202 |           | 3
```

## Features Implemented

### 1. Add Room
- **Location**: `/dashboard/hostel/rooms`
- **Access**: "Add Room" button in the header
- **Functionality**:
  - Select hostel type (Boys/Girls)
  - Enter unique room number
  - Set max occupancy (1-4 students)
  - Validates room number uniqueness
  - Adds new row to HostelRooms sheet

### 2. Edit Room
- **Location**: Edit button in each room row
- **Functionality**:
  - Update hostel type
  - Change room number
  - Modify max occupancy
  - Automatically updates all related student allocations if room number changes
  - Validates new room number uniqueness

### 3. Delete Room
- **Location**: Delete button in each room row
- **Functionality**:
  - Prevents deletion if room has occupants
  - Removes row from HostelRooms sheet
  - Shows confirmation dialog before deletion

### 4. Room Deallocation
- **Location**: X icon next to each student in occupants column
- **Functionality**:
  - Removes student from room
  - Updates student's application status to "deallocated"
  - Clears room number and allocation timestamp

## File Structure

### Backend Files

#### 1. Room Management Library
**File**: `src/lib/google/hostelRoomManagement.ts`
- `addHostelRoom()` - Adds a new room to the sheet
- `updateHostelRoom()` - Updates existing room details
- `deleteHostelRoom()` - Removes a room from the sheet

#### 2. Server Actions
**Files**: `src/actions/hostel/`
- `addHostelRoom.ts` - Validates and adds room
- `updateHostelRoom.ts` - Validates and updates room
- `deleteHostelRoom.ts` - Validates and deletes room

#### 3. API Routes
**Files**: `src/app/api/hostel/rooms/`
- `add/route.ts` - POST endpoint for adding rooms
- `update/route.ts` - POST endpoint for updating rooms
- `delete/route.ts` - POST endpoint for deleting rooms

### Frontend Files

#### 1. Components
**Files**: `src/components/hostel/`
- `AddRoomDialog.tsx` - Dialog for adding new rooms
- `EditRoomDialog.tsx` - Dialog for editing existing rooms
- `HostelRoomsClient.tsx` - Main client component with filters
- `HostelRoomsTable.tsx` - Table displaying all rooms with actions

#### 2. Page
**File**: `src/app/dashboard/hostel/rooms/page.tsx`
- Server component that fetches room data
- Renders HostelRoomsClient with data

## API Endpoints

### 1. Add Room
```
POST /api/hostel/rooms/add
Body: {
  hostel: "male" | "female",
  roomNumber: string,
  maxOccupancy: number
}
Response: {
  success: boolean,
  message: string
}
```

### 2. Update Room
```
POST /api/hostel/rooms/update
Body: {
  oldRoomNumber: string,
  newRoomNumber: string,
  hostel: "male" | "female",
  maxOccupancy: number
}
Response: {
  success: boolean,
  message: string
}
```

### 3. Delete Room
```
POST /api/hostel/rooms/delete
Body: {
  roomNumber: string
}
Response: {
  success: boolean,
  message: string
}
```

## User Interface

### Room Management Page Features
1. **Header Section**
   - Title: "Hostel Room Management"
   - "Add Room" button
   - "Back to Applications" button

2. **Filter Section**
   - All Rooms
   - Boys Hostel
   - Girls Hostel
   - Statistics (Total, Available, Full)

3. **Room Table**
   - Hostel type badge
   - Room number
   - Occupants with deallocate option
   - Max occupancy
   - Status badge (Available/Partially Filled/Full)
   - Action buttons (Edit/Delete)

## Validation Rules

### Add Room
- Room number is required and must be unique
- Hostel type must be "male" or "female"
- Max occupancy must be between 1 and 4

### Update Room
- Cannot change to a room number that already exists
- All allocated students are updated if room number changes
- Occupants are preserved during updates

### Delete Room
- Room must be empty (no occupants)
- Shows error if room has students allocated

## Environment Variables Required

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
HOSTEL_SHEET_NAME=HostelApplications
HOSTEL_ROOM_SHEET_NAME=HostelRooms
```

## Integration with Existing System

### 1. Room Allocation Flow
When allocating a room to a student:
1. System checks available rooms from HostelRooms sheet
2. Finds first room with space (occupants < maxOccupancy)
3. Updates occupants column in HostelRooms
4. Updates student's application with room number

### 2. Room Deallocation Flow
When deallocating a student:
1. Finds student's current room
2. Removes student ID from occupants column
3. Updates student's application status to "deallocated"

### 3. Data Consistency
- Room updates automatically propagate to student applications
- Deleting rooms with occupants is prevented
- All changes are atomic using batchUpdate

## Usage Instructions

### For Administrators

#### Adding a New Room
1. Go to `/dashboard/hostel/rooms`
2. Click "Add Room" button
3. Select hostel type (Boys/Girls)
4. Enter room number (e.g., B-101)
5. Select max occupancy
6. Click "Add Room"

#### Editing a Room
1. Find the room in the table
2. Click "Edit" button
3. Modify details as needed
4. Click "Update Room"

#### Deleting a Room
1. Ensure room has no occupants
2. Click "Delete" button
3. Confirm deletion in dialog

#### Deallocating a Student
1. Find the room with the student
2. Click X icon next to student ID
3. Confirm deallocation

## Error Handling

### Common Errors
1. **Room already exists** - Choose a different room number
2. **Cannot delete occupied room** - Deallocate all students first
3. **Invalid max occupancy** - Must be between 1 and 4
4. **Sheet not found** - Check environment variables

### Error Messages
All operations provide clear error messages through toast notifications.

## Testing Checklist

- [ ] Add a new boys hostel room
- [ ] Add a new girls hostel room
- [ ] Edit room number and verify student allocations update
- [ ] Edit max occupancy
- [ ] Try to delete room with occupants (should fail)
- [ ] Deallocate students and then delete room
- [ ] Filter rooms by hostel type
- [ ] Verify room statistics update correctly
- [ ] Test duplicate room number validation
- [ ] Check toast notifications for all actions

## Future Enhancements

1. **Bulk Operations**
   - Import multiple rooms from CSV
   - Export room data

2. **Advanced Features**
   - Room amenities tracking
   - Maintenance status
   - Room photos/floor plans

3. **Analytics**
   - Occupancy trends
   - Room utilization reports
   - Allocation history

## Support

For issues or questions:
1. Check Google Sheets permissions
2. Verify environment variables
3. Check browser console for errors
4. Review API endpoint logs
