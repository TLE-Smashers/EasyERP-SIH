# Faculty Request System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Super Master Sheet configured
- Institution registered in federation
- Faculty members in local sheet

### Step 1: Environment Variables
Ensure these are set in `.env.local`:
```bash
SUPER_MASTER_SHEET_ID=1jzqXu0aZPd9BWhgqriz1VM7JAHTy_Ui2dnzzqrZR4qI
GOOGLE_SERVICE_ACCOUNT_KEY={...your service account key...}
NEXT_PUBLIC_CURRENT_INSTITUTION_ID=INST001
NEXT_PUBLIC_CURRENT_INSTITUTION_NAME=Your Institution Name
```

### Step 2: Auto-Setup
The system will automatically create required sheets on first use:
- `Faculty_Requests` - when first request is created
- `Faculty_Request_Messages` - when first message is sent

No manual sheet creation needed! ✨

### Step 3: Test as Student
1. Login as student
2. Navigate to: **Faculty Consultation → Request Faculty**
3. Search for a faculty member
4. Fill the form and submit
5. Check: **My Requests** to see status

### Step 4: Test as Faculty
1. Login as faculty
2. Navigate to: **Student Requests → Pending Requests**
3. View request and click "View & Respond"
4. Accept request, add Google Meet link
5. Chat with student
6. Mark as completed

## 📱 Student Features

### Request Faculty
**URL:** `/dashboard/student/faculty-request`

Features:
- Search faculty across all institutions
- Filter by name, department, specialization
- See institution details
- Select preferred date/time

### My Requests  
**URL:** `/dashboard/student/faculty-request/my-requests`

View:
- All your requests
- Filter by status
- See unread message count
- Request details and faculty response

### Chat
**URL:** `/dashboard/student/faculty-request/chat/[requestId]`

Features:
- Real-time messaging
- View request details
- Join Google Meet link
- Auto-refresh every 5 seconds

## 👨‍🏫 Faculty Features

### Pending Requests
**URL:** `/dashboard/faculty/requests`

See:
- All pending consultation requests
- Student details and requirements
- Quick access to respond

### All Requests
**URL:** `/dashboard/faculty/requests/all`

Organized tabs:
- Pending
- Accepted  
- Completed
- Other (rejected/cancelled)

### Chat & Response
Faculty can:
- Accept or reject requests
- Add Google Meet link
- Send response message
- Chat with students
- Mark sessions as completed

## 🎯 Common Use Cases

### Use Case 1: Student Requests Help
```
Student: "I need help with Data Structures"
System: Browse faculty → Find Prof. John (ABC College)
Student: Submit request for tomorrow 2 PM
Faculty: Receives request, accepts, adds meet link
Student: Joins session via meet link
Faculty: Marks completed after session
```

### Use Case 2: Cross-Institution Learning
```
Student from College A wants to learn from Prof at College B
- Search shows faculty from all institutions
- Request sent to Prof at College B
- Prof accepts and schedules Google Meet
- Cross-institution session happens!
```

## 🔍 How Discovery Works

### Faculty Discovery
System fetches faculty from:
1. Super Master Sheet → Institutions tab
2. For each active institution:
   - Access their Google Sheet
   - Read Faculty tab (Columns A-R)
   - Extract active faculty (status = "active")
3. Compile into searchable list

**Column Mapping:**
- Name: Column B (fullName)
- Email: Column C (email)
- Department: Column I (branch)
- Specialization: Column K (assignedSubjects)
- Designation: Column H (designation)

### Search Algorithm
Searches across:
- Faculty name (fullName)
- Department (branch)
- Specialization (assignedSubjects)
- Institution name

## 💬 Chat System Details

### Message Flow
1. Student/Faculty types message
2. Server action saves to `Faculty_Request_Messages`
3. Message appears in chat
4. Other party sees message on refresh (5s interval)
5. Read status updated when chat opened

### Message Structure
```typescript
{
  messageId: "MSG-1234567890",
  requestId: "REQ-1234567890",
  senderEmail: "user@example.com",
  senderName: "John Doe",
  senderType: "student" | "faculty",
  message: "Message content",
  timestamp: "2024-01-15T10:30:00Z",
  read: false
}
```

## 📊 Request Status Flow

```
PENDING (Initial)
   ↓
   ├─→ ACCEPTED (Faculty accepts)
   │      ↓
   │   COMPLETED (Session done)
   │
   ├─→ REJECTED (Faculty declines)
   │
   └─→ CANCELLED (Student cancels)
```

## 🎨 UI Components

### Student Request Form
- Faculty search with real-time results
- Request details form
- Date/time picker
- Duration selector

### Request Cards
- Status badges with colors
- Faculty/Student info
- Schedule display
- Quick actions (chat, view)

### Chat Interface
- Split layout (details + chat)
- Message bubbles
- Sender identification
- Action buttons

## 🔐 Security

### Access Control
- Students can only see their requests
- Faculty can only see requests for them
- Session validation on all actions
- Server-side data validation

### Data Privacy
- Chat messages tied to request ID
- Read status per user
- Institution-based access

## 📈 Best Practices

### For Students
✅ DO:
- Provide clear subject and topic
- Write detailed description
- Choose realistic time slots
- Respond to faculty questions in chat

❌ DON'T:
- Request last minute
- Be vague about requirements
- Ignore faculty messages

### For Faculty
✅ DO:
- Review requests promptly
- Add Google Meet link when accepting
- Use chat for clarifications
- Mark completed after session

❌ DON'T:
- Leave requests pending too long
- Accept without checking schedule
- Forget to provide meet link

## 🐛 Troubleshooting

### "No faculty found"
- Check Super Master Sheet has institutions
- Verify institutions have status "active"
- Ensure Faculty sheet exists in institution sheets
- Check Column N (status) is "active" for faculty
- Verify Column B (fullName) and Column C (email) are populated

### "Failed to send request"
- Check SUPER_MASTER_SHEET_ID env variable
- Verify service account has edit access
- Check console for detailed error

### "Chat not updating"
- Messages refresh every 5 seconds
- Manual refresh also works
- Check network tab for API errors

### "Meet link not showing"
- Faculty must add link when accepting
- Link appears after accept action
- Check request status is "accepted"

## 📝 Quick Reference

### Student URLs
```
Request Faculty: /dashboard/student/faculty-request
My Requests:     /dashboard/student/faculty-request/my-requests  
Chat:            /dashboard/student/faculty-request/chat/[id]
```

### Faculty URLs
```
Pending:     /dashboard/faculty/requests
All Requests: /dashboard/faculty/requests/all
Chat:        /dashboard/student/faculty-request/chat/[id]
```

### Server Actions
```typescript
// Create request
createFacultyRequest(data)

// Get requests  
getFacultyRequests(email, "student" | "faculty")

// Send message
sendFacultyRequestMessage(data)

// Update status
updateFacultyRequestStatus(id, status, message?, meetLink?)

// Search faculty
searchFaculty(query)
getAvailableFaculty()
```

## 🎉 Success!

Your faculty request system is ready! Students can now:
- ✅ Discover faculty from any institution
- ✅ Request consultations
- ✅ Chat in real-time
- ✅ Join Google Meet sessions

Faculty can:
- ✅ Receive requests
- ✅ Communicate with students
- ✅ Schedule sessions
- ✅ Share meet links

**Start connecting students and faculty across institutions!** 🚀
