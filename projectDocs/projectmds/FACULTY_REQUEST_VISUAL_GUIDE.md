# Faculty Request System - Visual Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│              SUPER MASTER SHEET (Federation Hub)            │
│                                                             │
│  📋 Faculty_Requests          💬 Faculty_Request_Messages   │
│  ├─ All consultation requests  ├─ All chat messages        │
│  ├─ Cross-institution          ├─ Between students & faculty│
│  └─ Status tracking            └─ Read/unread tracking     │
└─────────────────────────────────────────────────────────────┘
                            ↕️
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  Student Side    │                  │  Faculty Side    │
│                  │                  │                  │
│  🔍 Search       │                  │  📥 View Requests│
│  📝 Request      │  ←─── Chat ───→  │  ✅ Accept/Reject│
│  💬 Chat         │                  │  🔗 Add Meet Link│
│  📊 Track Status │                  │  ✓  Mark Complete│
└──────────────────┘                  └──────────────────┘
```

## 📱 User Interfaces

### 1. Student: Request Faculty
```
┌─────────────────────────────────────────────────────────┐
│  Request Faculty Consultation                            │
├──────────────────────┬──────────────────────────────────┤
│  Select Faculty      │  Request Details                 │
│  ┌─────────────────┐ │  ┌────────────────────────────┐ │
│  │ 🔍 Search...    │ │  │ Subject: _________         │ │
│  └─────────────────┘ │  │ Topic: ___________         │ │
│                      │  │ Description: ______        │ │
│  [ ] Prof. John      │  │ Date: [____]  Time: [__]  │ │
│      CS Dept         │  │ Duration: [60 mins]       │ │
│      ABC College     │  │                            │ │
│                      │  │ [Send Request]             │ │
│  [✓] Dr. Smith       │  └────────────────────────────┘ │
│      Data Science    │                                  │
│      XYZ Institute   │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### 2. Student: My Requests
```
┌─────────────────────────────────────────────────────────┐
│  My Faculty Requests                                     │
│  [All] [Pending] [Accepted] [Completed]                 │
├─────────────────────────────────────────────────────────┤
│  📚 Data Structures                    🟡 PENDING       │
│  Binary Search Trees                                    │
│  👤 Prof. John | ABC College                            │
│  📅 Jan 15, 2024 | ⏰ 14:00 (60 mins)                  │
│  [💬 Chat]                    Created: Jan 10, 10:30 AM │
├─────────────────────────────────────────────────────────┤
│  🧮 Machine Learning               🟢 ACCEPTED          │
│  Neural Networks Basics                                 │
│  👤 Dr. Smith | XYZ Institute                           │
│  📅 Jan 20, 2024 | ⏰ 15:00 (90 mins)                  │
│  🎥 Join Google Meet                                    │
│  [💬 Chat (2)]                   Created: Jan 12, 2:00 PM│
└─────────────────────────────────────────────────────────┘
```

### 3. Chat Interface
```
┌─────────────────────────────────────────────────────────┐
│  ← Data Structures - Binary Trees      🟢 ACCEPTED      │
├──────────────────────┬──────────────────────────────────┤
│  Request Details     │  Chat                            │
│  ┌─────────────────┐ │  ┌────────────────────────────┐ │
│  │ Student:        │ │  │ [Student] Hi Prof!         │ │
│  │ Alice Kumar     │ │  │ 10:30 AM                   │ │
│  │ ABC College     │ │  │                            │ │
│  │                 │ │  │ [Faculty] Hello! Ready     │ │
│  │ Faculty:        │ │  │ to help. 10:35 AM          │ │
│  │ Prof. John      │ │  │                            │ │
│  │ XYZ Institute   │ │  │ [Student] Can you explain  │ │
│  │                 │ │  │ BST deletion? 10:40 AM     │ │
│  │ 📅 Jan 15, 2024 │ │  │                            │ │
│  │ ⏰ 14:00        │ │  │ [Faculty] Sure! Meet link: │ │
│  │ ⏱️ 60 mins      │ │  │ meet.google.com/...        │ │
│  │                 │ │  │ 11:00 AM                   │ │
│  │ 🎥 Join Meet    │ │  └────────────────────────────┘ │
│  │                 │ │  [Type message...] [Send]        │
│  │ [✓ Complete]    │ │                                  │
│  └─────────────────┘ │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### 4. Faculty: Pending Requests
```
┌─────────────────────────────────────────────────────────┐
│  Student Requests                                        │
│  [All: 8] [Pending: 3] [Accepted: 2] [Completed: 3]    │
├─────────────────────────────────────────────────────────┤
│  📚 Data Structures                    🟡 PENDING       │
│  Binary Search Trees                                    │
│  👤 Alice Kumar | ABC College                           │
│  📅 Jan 15, 2024 | ⏰ 14:00 (60 mins)                  │
│  📝 "Need help understanding BST deletion algorithm"    │
│  [💬 View & Respond]              Created: Jan 10, 10:30│
├─────────────────────────────────────────────────────────┤
│  🧮 Algorithms                       🟡 PENDING         │
│  Dynamic Programming                                    │
│  👤 Bob Smith | DEF Institute                           │
│  📅 Jan 18, 2024 | ⏰ 16:00 (90 mins)                  │
│  📝 "Want to learn DP optimization techniques"          │
│  [💬 View & Respond]              Created: Jan 12, 3:00 │
└─────────────────────────────────────────────────────────┘
```

### 5. Faculty: Accept/Reject Interface
```
┌─────────────────────────────────────────────────────────┐
│  Request Details                                         │
├─────────────────────────────────────────────────────────┤
│  Student: Alice Kumar (ABC College)                     │
│  Subject: Data Structures                               │
│  Topic: Binary Search Trees                             │
│  Schedule: Jan 15, 2024 @ 14:00 (60 mins)              │
│  Description: Need help understanding BST deletion...   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Google Meet Link (optional)                        │ │
│  │ [https://meet.google.com/abc-defg-hij]             │ │
│  │                                                     │ │
│  │ Response Message (optional)                        │ │
│  │ [Looking forward to our session! I'll prepare...] │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [✅ Accept Request]  [❌ Reject Request]               │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Request Lifecycle

```
┌─────────────┐
│   STUDENT   │
│   Creates   │
│   Request   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  🟡 PENDING │ ←─────────────┐
│   Request   │               │
│   Sent      │               │
└──────┬──────┘               │
       │                      │
       ↓                      │
┌─────────────┐               │
│   FACULTY   │               │
│   Reviews   │               │
└──────┬──────┘               │
       │                      │
    ┌──┴──┐                   │
    │     │                   │
    ↓     ↓                   │
┌─────┐ ┌─────┐               │
│Accept│ │Reject│              │
└──┬──┘ └──┬──┘               │
   │       │                  │
   ↓       ↓                  │
┌──────┐ ┌──────┐             │
│🟢 ACC│ │🔴 REJ│ ─────────→ END
│EPTED │ │ECTED │
└──┬───┘ └──────┘
   │
   │ (Session Happens)
   │
   ↓
┌──────────┐
│🔵 COMPL  │
│  ETED    │ ───────────────→ END
└──────────┘
```

## 💬 Chat Flow

```
Student Side                          Faculty Side
─────────────                         ─────────────

[Student types]
"Hi Prof!"
     │
     ↓
[Save to Sheet] ──────────────→ [Sheet Updated]
     │                               │
     ↓                               ↓
[Message appears]              [Auto-refresh]
                                    │
                                    ↓
                              [Message appears]
                                    │
                                    ↓
                              [Faculty types]
                              "Hello! Ready to help"
                                    │
                                    ↓
[Auto-refresh]   ←────────── [Save to Sheet]
     │
     ↓
[Message appears]

(Repeats every 5 seconds)
```

## 🎨 Color Coding

### Status Colors
- 🟡 **PENDING** - Yellow - Awaiting response
- 🟢 **ACCEPTED** - Green - Scheduled
- 🔴 **REJECTED** - Red - Declined
- 🔵 **COMPLETED** - Blue - Finished
- ⚪ **CANCELLED** - Gray - Cancelled

### UI Elements
- **Primary Actions** - Blue buttons (Send, Accept)
- **Destructive Actions** - Red buttons (Reject, Cancel)
- **Secondary Actions** - Outlined buttons (Chat, View)
- **Info Cards** - Light background with borders
- **Message Bubbles** 
  - Own messages: Primary color
  - Other messages: Light background

## 📊 Data Flow

```
┌─────────────┐
│  Student    │
│  Browser    │
└──────┬──────┘
       │ (createFacultyRequest)
       ↓
┌─────────────────┐
│  Server Action  │
│  facultyRequests│
└──────┬──────────┘
       │
       ↓
┌─────────────────────┐
│  Google Sheets API  │
│  SUPER_MASTER_SHEET │
└──────┬──────────────┘
       │
       ↓
┌──────────────────┐
│ Faculty_Requests │
│ Sheet Tab        │
│ [New Row Added]  │
└──────────────────┘

       │
       │ (getFacultyRequests)
       ↓
       
┌─────────────┐
│   Faculty   │
│   Browser   │
└─────────────┘
```

## 🔐 Security Architecture

```
┌──────────────────┐
│   User Login     │
│   (NextAuth)     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Session Check   │
│  Role Validation │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Server Action   │
│  (Authenticated) │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Service Account  │
│ Google Sheets    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Super Master    │
│  Sheet Access    │
└──────────────────┘
```

## 🌐 Multi-Institution Flow

```
Institution A (Student)
         │
         │ Search Faculty
         ↓
    ┌─────────┐
    │  Super  │
    │ Master  │ → List of ALL faculty
    │  Sheet  │   from ALL institutions
    └─────────┘
         │
         ↓
    Select Faculty
    from Institution B
         │
         ↓
    Create Request
         │
         ↓
    Store in Super Master
         │
         ↓
Institution B (Faculty)
    Receives Notification
         │
         ↓
    Accept & Add Meet Link
         │
         ↓
    Cross-Institution
    Session Happens! 🎉
```

## 📈 Usage Statistics View (Future)

```
┌──────────────────────────────────────────┐
│  Faculty Request Analytics               │
├──────────────────────────────────────────┤
│  📊 Total Requests: 156                  │
│  ⏳ Pending: 12                          │
│  ✅ Completed: 98                        │
│  🎯 Success Rate: 85%                    │
├──────────────────────────────────────────┤
│  Top Requested Topics:                   │
│  1. Data Structures (45)                 │
│  2. Machine Learning (32)                │
│  3. Web Development (28)                 │
├──────────────────────────────────────────┤
│  Most Active Faculty:                    │
│  1. Prof. John (23 sessions)             │
│  2. Dr. Smith (19 sessions)              │
│  3. Prof. Kumar (15 sessions)            │
└──────────────────────────────────────────┘
```

## ✨ Key Features Visual

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🔍 Discovery    │  │  💬 Real-time    │  │  🎥 Google Meet  │
│                  │  │     Chat         │  │   Integration    │
│  • Cross-inst    │  │                  │  │                  │
│  • Search        │  │  • Auto-refresh  │  │  • Easy share    │
│  • Filter        │  │  • Read status   │  │  • One-click     │
│  • Details       │  │  • History       │  │  • Scheduled     │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  📊 Status       │  │  🔔 Updates      │  │  📱 Responsive   │
│   Tracking       │  │                  │  │      Design      │
│                  │  │  • Real-time     │  │                  │
│  • Lifecycle     │  │  • Notifications │  │  • Mobile ready  │
│  • History       │  │  • Badges        │  │  • Clean UI      │
│  • Completion    │  │  • Counters      │  │  • Intuitive     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

**The system is clean, simple, and follows the existing patterns!** ✨
