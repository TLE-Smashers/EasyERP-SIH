# 📋 Faculty Attendance Google Sheets Setup

## Step 1: Open Your Google Sheet

Go to: `https://docs.google.com/spreadsheets/d/1pSnGYcaRO27O9dx4nuZKdL-JyMpsStaMbyWMRlnuFaw/edit`

## Step 2: Create New Tab

1. Click the **+** button at the bottom
2. Name it: `Faculty_Attendance` (exact name!)

## Step 3: Add Column Headers (Row 1)

Copy and paste these headers into Row 1 (A1 to AA1):

```
attendance_id	faculty_id	faculty_name	employee_id	department	date	status	check_in_time	check_in_photo_url	check_in_gps	check_in_device	check_out_time	check_out_photo_url	check_out_gps	check_out_device	total_hours	remarks	marked_by	method	is_late	late_by_minutes	is_within_geofence	flags	requires_approval	approved_by	approved_at	created_at
```

Or manually type:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| attendance_id | faculty_id | faculty_name | employee_id | department | date | status | check_in_time | check_in_photo_url | check_in_gps |

| K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|
| check_in_device | check_out_time | check_out_photo_url | check_out_gps | check_out_device | total_hours | remarks | marked_by | method | is_late |

| U | V | W | X | Y | Z | AA |
|---|---|---|---|---|---|---|
| late_by_minutes | is_within_geofence | flags | requires_approval | approved_by | approved_at | created_at |

## Step 4: Enable Google Drive API

1. Go to: https://console.cloud.google.com/
2. Select your project: `easy-erp-478315`
3. Go to **APIs & Services** → **Library**
4. Search for "Google Drive API"
5. Click **Enable**

## Step 5: Test the Setup

Run the dev server and try marking attendance. On first photo upload, it will:
1. Create a folder called `Faculty_Attendance_Photos` in Google Drive
2. Display the folder ID in terminal logs
3. You should add this ID to `.env.local` as `GOOGLE_DRIVE_FOLDER_ID=...`

## ✅ Verification Checklist

- [ ] Sheet tab named `Faculty_Attendance` exists
- [ ] All 27 column headers are present (A to AA)
- [ ] Google Drive API is enabled
- [ ] Service account has Editor access to the sheet
- [ ] Geo-fence coordinates configured in `.env.local`
- [ ] Time windows configured in `.env.local`

## 🎯 What Happens When Faculty Marks Attendance

1. **Photo Upload**: Selfie → Google Drive → Returns URL
2. **GPS Validation**: Checks if within campus boundary (100m)
3. **Time Validation**: Checks if within allowed window (9:00-10:00 AM)
4. **Device Check**: Verifies device fingerprint
5. **Data Save**: All data → Google Sheets row
6. **Status Calculation**: Determines present/late/half_day

## 📊 Sample Data Row

After first attendance, you'll see:

| attendance_id | faculty_id | faculty_name | date | check_in_time | check_in_photo_url | status |
|---|---|---|---|---|---|---|
| ATT-1733773200-456 | FAC001 | Dr. Sharma | 2025-12-09 | 2025-12-09T09:05:00Z | https://drive.google.com/... | present |

## 🚨 Troubleshooting

### Error: "Sheet not found"
→ Make sure tab name is exactly `Faculty_Attendance`

### Error: "Permission denied"
→ Service account needs Editor access to the sheet

### Error: "Google Drive API not enabled"
→ Follow Step 4 above

### Error: "Failed to upload photo"
→ Check service account has Drive API scope enabled

## 📞 Next Steps

Once the sheet is ready:
1. Run `npm run dev`
2. Test the attendance marking
3. Check if data appears in the sheet
4. Verify photo appears in Google Drive

Ready to proceed! 🚀
