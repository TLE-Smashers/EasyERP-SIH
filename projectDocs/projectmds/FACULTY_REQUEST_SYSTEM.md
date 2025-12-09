# Faculty Request System - Implementation Guide

## Overview
A cross-institution faculty consultation system where students can request sessions with faculty from any institution in the federation. Includes real-time chat and Google Meet integration.

## Architecture

### Super Master Sheet Tabs

#### 1. Faculty_Requests
Stores all faculty consultation requests across institutions.

**Columns:**
- Request ID
- Student Email
- Student Name
- Student Institution ID
- Student Institution Name
- Faculty Email
- Faculty Name
- Faculty Institution ID
- Faculty Institution Name
- Subject
- Topic
- Description
- Preferred Date
- Preferred Time
- Duration (mins)
- Status (pending/accepted/rejected/completed/cancelled)
- Meet Link
- Created At
- Updated At
- Response Message

#### 2. Faculty_Request_Messages
Stores chat messages between students and faculty.

**Columns:**
- Message ID
- Request ID
- Sender Email
- Sender Name
- Sender Type (student/faculty)
- Message
- Timestamp
- Read (true/false)

#### 3. Faculty
Centralized faculty directory for cross-institution discovery.

**Columns:**
- Faculty ID
- Full Name
- Email
- Institution ID
- Institution Name
- Department
- Specialization
- Designation
- Status (active/inactive)

## Features

### For Students
1. **Browse Faculty** - Search faculty from all institutions
2. **Request Consultation** - Send consultation requests with details
3. **Chat** - Real-time messaging with faculty
4. **Track Requests** - View status and history

### For Faculty
1. **View Requests** - See all incoming consultation requests
2. **Accept/Reject** - Respond to requests
3. **Add Meet Link** - Provide Google Meet link
4. **Chat** - Communicate with students
5. **Mark Complete** - Mark sessions as completed

## File Structure

```
src/
├── types/
│   └── facultyRequest.ts          # TypeScript types
├── actions/
│   └── federation/
│       ├── facultyRequests.ts     # Main request actions
│       └── getFaculty.ts          # Faculty discovery
└── app/
    └── dashboard/
        ├── student/
        │   └── faculty-request/
        │       ├── page.tsx               # Request form
        │       ├── my-requests/
        │       │   └── page.tsx           # Student's requests list
        │       └── chat/
        │           └── [requestId]/
        │               └── page.tsx       # Chat interface
        └── faculty/
            └── requests/
                ├── page.tsx               # Pending requests
                └── all/
                    └── page.tsx           # All requests
```

## Navigation Added

### Student Navigation
```typescript
{
  title: "Faculty Consultation",
  icon: UserCheck,
  items: [
    { title: "Request Faculty", url: "/dashboard/student/faculty-request" },
    { title: "My Requests", url: "/dashboard/student/faculty-request/my-requests" },
  ],
}
```

### Faculty Navigation
```typescript
{
  title: "Student Requests",
  icon: MessageCircle,
  items: [
    { title: "Pending Requests", url: "/dashboard/faculty/requests" },
    { title: "All Requests", url: "/dashboard/faculty/requests/all" },
  ],
}
```

## Server Actions

### facultyRequests.ts
- `createFacultyRequest()` - Create new request
- `getFacultyRequests()` - Get requests for user
- `getFacultyRequestById()` - Get single request
- `updateFacultyRequestStatus()` - Update request status
- `sendFacultyRequestMessage()` - Send chat message
- `getFacultyRequestMessages()` - Get chat messages
- `markFacultyRequestMessagesAsRead()` - Mark messages read

### getFaculty.ts
- `getAvailableFaculty()` - Get all faculty from federation
- `searchFaculty()` - Search faculty by query
- `getFacultyByInstitution()` - Get faculty from specific institution

## Usage Flow

### Student Workflow
1. Navigate to "Request Faculty"
2. Search for faculty by name/department/specialization
3. Select faculty member
4. Fill request details:
   - Subject
   - Topic
   - Description
   - Preferred date/time
   - Duration
5. Submit request
6. Track request in "My Requests"
7. Chat with faculty
8. Join Google Meet when available

### Faculty Workflow
1. View "Pending Requests"
2. Review request details
3. Chat with student for clarification
4. Accept or reject request
5. If accepting:
   - Add Google Meet link (optional)
   - Add response message (optional)
6. Mark as completed after session

## Environment Variables

Required in `.env.local`:
```bash
SUPER_MASTER_SHEET_ID=your_super_master_sheet_id
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_key_json
NEXT_PUBLIC_CURRENT_INSTITUTION_ID=your_institution_id
NEXT_PUBLIC_CURRENT_INSTITUTION_NAME=your_institution_name
```

## Setup Instructions

### 1. Super Master Sheet Setup
1. Open your Super Master Sheet
2. The system will auto-create these tabs on first use:
   - Faculty_Requests
   - Faculty_Request_Messages
3. Headers will be automatically added

### 2. Institution Setup
Ensure your institution is registered in the `Institutions` tab of Super Master Sheet with:
- Active status
- Valid Institution ID

### 3. Faculty Setup
Add faculty to the `Faculty` tab in Super Master Sheet:
- **Column A**: Faculty ID (e.g., F20250101)
- **Column B**: Full Name (Required)
- **Column C**: Email (Required)
- **Column D**: Institution ID (from Institutions tab)
- **Column E**: Institution Name
- **Column F**: Department
- **Column G**: Specialization (subjects/skills)
- **Column H**: Designation
- **Column I**: Status (Required - must be "active")

**Example Faculty Row:**
```
F20250101 | Dr. Ayesha Kapoor | ayesha.kapoor@purnima.edu | INST-1765224405904 | Purnima Institute | Information Technology | Data Structures, Web Technologies | Associate Professor | active
```

**Quick Setup:** Copy data from `projectDocs/faculty-data.tsv` and paste into Faculty sheet starting at Row 2.

## Features Detail

### Real-Time Chat
- Auto-refresh every 5 seconds
- Read/unread status tracking
- Sender identification (student/faculty)
- Timestamp display

### Request Statuses
- **Pending**: Newly created, awaiting faculty response
- **Accepted**: Faculty accepted, session scheduled
- **Rejected**: Faculty declined
- **Completed**: Session finished
- **Cancelled**: Student cancelled

### Search & Discovery
- Search by faculty name
- Filter by department
- Filter by specialization
- Filter by institution
- Cross-institution visibility

### Google Meet Integration
- Faculty can add meet link when accepting
- Link displayed prominently in request details
- One-click join from chat interface

## UI Components Used
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button, Badge, Input, Textarea
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Tabs, TabsList, TabsTrigger, TabsContent
- Icons: Calendar, Clock, Video, MessageCircle, User, Search, etc.

## Best Practices

### For Students
- Provide clear description of what you want to learn
- Choose realistic time slots
- Check faculty's institution and specialization
- Use chat to clarify doubts before session

### For Faculty
- Review requests promptly
- Use chat for clarification if needed
- Provide meet link when accepting
- Mark completed after session

## Troubleshooting

### Requests not showing
- Check SUPER_MASTER_SHEET_ID environment variable
- Verify Google Service Account has access
- Check institution status is "active"

### Faculty not appearing
- Verify Faculty sheet exists in institution's sheet
- Check faculty status (Column N) is "active"
- Ensure email (Column C) and fullName (Column B) are populated
- Verify branch (Column I) and assignedSubjects (Column K) for better searchability

### Chat not updating
- Check browser console for errors
- Verify Google Sheets API permissions
- Clear cache and reload

## Future Enhancements
- Automated Google Meet link generation
- Calendar integration
- Email notifications
- Rating system for sessions
- Recurring sessions
- Multi-faculty sessions
- Recording capabilities

## Security Considerations
- All requests stored in Super Master Sheet (centralized)
- Access controlled via NextAuth sessions
- Google Service Account for secure API access
- User roles verified on server side
- Real-time data validation

## Testing

### Test Student Flow
1. Login as student
2. Request a faculty consultation
3. Send chat messages
4. View request status updates

### Test Faculty Flow
1. Login as faculty
2. View incoming requests
3. Accept a request and add meet link
4. Chat with student
5. Mark as completed

## Support
For issues or questions:
1. Check console logs
2. Verify environment variables
3. Check Google Sheets structure
4. Review server action responses

---

**Implementation Complete! ✅**

The faculty request system is now live with:
- Cross-institution faculty discovery
- Real-time chat communication
- Google Meet integration
- Request management for both students and faculty
