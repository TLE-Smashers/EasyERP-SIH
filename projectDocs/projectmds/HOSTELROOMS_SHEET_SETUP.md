# HostelRooms Sheet - Quick Setup Guide

## Step 1: Create the Sheet
In your Google Spreadsheet, create a new sheet named **`HostelRooms`** (or the name specified in your `HOSTEL_ROOM_SHEET_NAME` environment variable).

## Step 2: Add Headers (Row 1)
Add these exact column headers in the first row:

| A | B | C | D |
|---|---|---|---|
| **hostel** | **roomNumber** | **occupants** | **maxOccupancy** |

## Step 3: Add Sample Data (Optional)
You can add some initial rooms manually, or use the "Add Room" feature in the UI:

### Boys Hostel Rooms
| hostel | roomNumber | occupants | maxOccupancy |
|--------|------------|-----------|--------------|
| male   | B-101      |           | 2            |
| male   | B-102      |           | 2            |
| male   | B-103      |           | 2            |
| male   | B-104      |           | 3            |
| male   | B-105      |           | 3            |

### Girls Hostel Rooms
| hostel | roomNumber | occupants | maxOccupancy |
|--------|------------|-----------|--------------|
| female | G-201      |           | 2            |
| female | G-202      |           | 2            |
| female | G-203      |           | 2            |
| female | G-204      |           | 3            |
| female | G-205      |           | 3            |

## Step 4: Set Permissions
Ensure your service account has **Editor** access to this sheet.

## Step 5: Environment Variables
Make sure your `.env.local` includes:

```env
HOSTEL_ROOM_SHEET_NAME=HostelRooms
```

## Column Details

### Column A: hostel
- **Type**: Text
- **Values**: `male` or `female`
- **Required**: Yes
- **Example**: `male`, `female`

### Column B: roomNumber
- **Type**: Text
- **Values**: Any unique identifier
- **Required**: Yes
- **Format**: Usually follows a pattern like `[Building]-[RoomNo]`
- **Examples**: 
  - `B-101` (Boys hostel, Room 101)
  - `G-205` (Girls hostel, Room 205)
  - `Block-A-301`

### Column C: occupants
- **Type**: Text (comma-separated student IDs)
- **Values**: Empty or comma-separated student IDs
- **Required**: No (leave empty for available rooms)
- **Examples**:
  - Empty: `` (room is available)
  - Single: `12345`
  - Multiple: `12345,67890`

### Column D: maxOccupancy
- **Type**: Number
- **Values**: 1, 2, 3, or 4
- **Required**: Yes
- **Default**: 2
- **Example**: `2` (room can accommodate 2 students)

## How the System Uses This Sheet

### Room Allocation
When a student is allocated a room:
1. System finds an available room (where `occupants.length < maxOccupancy`)
2. Adds the student ID to the `occupants` column
3. Updates the student's application with the room number

### Room Deallocation
When a student is removed from a room:
1. System removes the student ID from the `occupants` column
2. Updates the student's application status to "deallocated"

### Room Management
- **Add Room**: Appends a new row with hostel, roomNumber, empty occupants, and maxOccupancy
- **Edit Room**: Updates the row data and propagates room number changes to all applications
- **Delete Room**: Removes the row (only if occupants is empty)

## Important Notes

⚠️ **Do Not Modify Manually While System is Running**
- Let the system handle occupant updates
- Manual changes might cause inconsistencies

⚠️ **Room Number Must Be Unique**
- Each roomNumber must be unique across all hostels
- Duplicate room numbers will cause errors

⚠️ **Occupants Format**
- Always use comma-separated values without spaces
- Correct: `12345,67890`
- Incorrect: `12345, 67890` (has space after comma)

✅ **Best Practices**
- Use a consistent naming convention for room numbers
- Keep maxOccupancy at 2 for most rooms
- Use 1 for single-occupancy premium rooms
- Use 3-4 for larger dormitory-style rooms

## Testing Your Setup

1. Go to `/dashboard/hostel/rooms` in your application
2. Verify all rooms are displayed correctly
3. Try adding a new room through the UI
4. Try editing a room
5. Allocate a student to verify occupants column updates
6. Deallocate the student to verify it's removed

## Troubleshooting

### Rooms Not Showing Up
- Check sheet name matches environment variable
- Verify service account has access
- Check that headers are in row 1

### Error: "Room already exists"
- Check for duplicate roomNumber values in column B
- Room numbers must be unique

### Cannot Delete Room
- Verify the room has no occupants
- Deallocate all students first

### Occupants Not Updating
- Check Google Sheets API permissions
- Verify GOOGLE_SERVICE_ACCOUNT_KEY is correct
- Check browser console for errors

## Quick Reference

```
HostelRooms Sheet Structure:
┌─────────┬────────────┬─────────────┬──────────────┐
│ hostel  │ roomNumber │ occupants   │ maxOccupancy │
├─────────┼────────────┼─────────────┼──────────────┤
│ male    │ B-101      │             │ 2            │
│ male    │ B-102      │ 12345       │ 2            │
│ female  │ G-201      │ 67890,98765 │ 2            │
└─────────┴────────────┴─────────────┴──────────────┘
```

That's it! Your HostelRooms sheet is now ready to use. 🎉
