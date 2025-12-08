# AI Chatbot Implementation Guide

## Overview
An intelligent AI-powered chatbot integrated into the ERP system using Google Gemini AI. The chatbot provides contextual assistance to students, faculty, and staff by querying institutional data from Google Sheets.

## Features Implemented

### Core Components

1. **Gemini AI Integration** (`src/lib/ai/gemini.ts`)
   - Google Gemini 1.5 Flash model integration
   - Streaming and non-streaming response generation
   - Conversation history support
   - Error handling and retry logic

2. **Context Provider** (`src/lib/ai/contextProvider.ts`)
   - Role-based data fetching from Google Sheets
   - Automatic context generation for user queries
   - Supports: Students, Faculty, Admission, Librarian, Accountant, Admin
   - Efficient data filtering and summarization

3. **Intent Classifier** (`src/lib/ai/intentClassifier.ts`)
   - Automatic query intent detection
   - Categories: attendance, marks, library, fees, hostel, admission, helpdesk
   - Optimized prompt building for each intent
   - Role-specific suggestion system

4. **Chat API** (`src/app/api/chat/route.ts`)
   - RESTful endpoint for chat interactions
   - Session-based authentication
   - Conversation history tracking (last 5 messages)
   - Health check endpoint

5. **UI Components**
   - `ChatWidget.tsx` - Floating chat button
   - `ChatInterface.tsx` - Full chat interface with message history
   - `QuickActions.tsx` - One-click query shortcuts

## Setup Instructions

### 1. Environment Configuration

Add to your `.env.local`:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Sheets (already configured)
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

To get a Gemini API key:
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and add to `.env.local`

### 2. Install Dependencies

```bash
npm install @google/generative-ai
```

### 3. Test the Implementation

```bash
# Test context provider
npx tsx scripts/testChatbotContext.ts

# Test chat API (requires server running)
npm run dev
# Then visit: http://localhost:3000/api/chat
```

### 4. Verify Integration

1. Start the development server: `npm run dev`
2. Login to the dashboard
3. Look for the floating chat button (bottom-right corner)
4. Click to open the chat interface
5. Try quick actions or type a query

## Supported Queries

### For Students
- "Show my attendance"
- "What are my Mid-1 marks?"
- "Which books do I have issued?"
- "What is my fee status?"
- "Show my hostel details"
- "How do I apply for TC?"

### For Faculty
- "List absent students today"
- "Show marks I uploaded for CSE-A"
- "Which students failed Mid-1?"
- "What is the class average?"

### For Admission Officers
- "How many applications today?"
- "Show pending verifications"
- "Branch-wise admission summary"

### For Librarians
- "Show overdue books"
- "Is 'Clean Code' available?"
- "List pending return requests"
- "Check issue history for student XYZ"

### For Accountants
- "Show pending fees"
- "Daily collection summary"
- "Branch-wise fee status"

## Architecture

```
User Query
    ↓
Chat API (/api/chat)
    ↓
[Authentication Check]
    ↓
[Fetch User Context from Google Sheets]
    ↓
[Classify Intent]
    ↓
[Build Optimized Prompt]
    ↓
[Send to Gemini AI]
    ↓
[Return Response]
    ↓
Display in UI
```

## Data Flow

1. **User sends message** → Chat interface captures input
2. **API receives request** → Validates session and role
3. **Context fetching** → Pulls relevant data from Google Sheets based on:
   - User role
   - User ID
   - Query intent
4. **AI processing** → Gemini AI analyzes query with context
5. **Response generation** → AI creates contextual, accurate response
6. **Display to user** → Message appears in chat interface

## Google Sheets Integration

The chatbot queries the following sheets:

- **Students** - Basic student information
- **Attendance** - Attendance records
- **Marks** - Assessment scores
- **Library_Issues** - Issued books
- **Library_Books** - Book catalog
- **Payments** - Fee transactions
- **HostelAllocation** - Hostel assignments
- **Admissions** - Application records
- **Faculty** - Faculty information

## Performance Optimizations

1. **Context Caching** - User context cached for 60 seconds
2. **Selective Data Fetching** - Only relevant sheets queried based on intent
3. **Conversation History** - Limited to last 5 messages
4. **Streaming Responses** - Real-time text generation (ready for implementation)
5. **Rate Limiting** - Built-in Gemini API rate limiting

## Security Measures

1. **Session Validation** - All requests require valid authentication
2. **Role-Based Access** - Users only see their own data
3. **Data Sanitization** - Input validation and output filtering
4. **No Raw Sheet Access** - Sheet IDs and credentials never exposed
5. **Audit Logging** - All queries logged for review

## Customization

### Add New Quick Actions

Edit `src/components/chat/QuickActions.tsx`:

```typescript
const defaultActions: QuickAction[] = [
  {
    label: 'Your Label',
    icon: <YourIcon className="h-4 w-4" />,
    query: 'Your predefined query',
  },
  // ... more actions
];
```

### Add New Intents

Edit `src/lib/ai/intentClassifier.ts`:

```typescript
// Add to QueryIntent type
export type QueryIntent = '...' | 'your_new_intent';

// Add classification logic
if (lowerQuery.includes('your_keyword')) {
  return { intent: 'your_new_intent', confidence: 0.9, keywords: [...] };
}

// Add prompt instructions
const intentInstructions: Record<QueryIntent, string> = {
  // ...
  your_new_intent: `Your instructions for AI...`,
};
```

### Modify Context Data

Edit `src/lib/ai/contextProvider.ts`:

```typescript
// Add new data source for a role
async function getRoleContext(userId: string, userName: string): Promise<ContextData> {
  // ... fetch from new sheet
  const newDataResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'NewSheet!A:Z',
  });
  
  data.newData = newDataResponse.data.values || [];
  // ...
}
```

## Troubleshooting

### Chatbot not appearing
- Check if `ChatWidget` is imported in dashboard layout
- Verify no CSS z-index conflicts
- Check browser console for errors

### "AI not configured" error
- Verify `GEMINI_API_KEY` in `.env.local`
- Restart development server after adding env variables
- Check API key is valid at https://makersuite.google.com

### Empty/incorrect responses
- Verify Google Sheets data is populated
- Check user role matches available data
- Review API logs for context fetching errors
- Ensure `GOOGLE_SERVICE_ACCOUNT_KEY` has read access

### Slow responses
- Check internet connection to Gemini API
- Consider implementing streaming responses
- Verify sheet data isn't too large (optimize queries)
- Check Gemini API quota limits

## Future Enhancements

1. **Streaming Responses** - Real-time text generation (code ready)
2. **Voice Input** - Speech-to-text integration
3. **Multilingual Support** - Hindi and regional languages
4. **Analytics Dashboard** - Query tracking and insights
5. **Feedback System** - Rating responses for improvement
6. **Export Chat History** - Download conversations
7. **Proactive Suggestions** - Context-aware recommendations
8. **Rich Media** - Charts, tables, images in responses

## API Reference

### POST /api/chat

**Request:**
```json
{
  "message": "Show my attendance",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "AI response here...",
    "intent": "attendance",
    "timestamp": "2025-12-09T10:30:00.000Z"
  }
}
```

### GET /api/chat

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "message": "AI Chatbot is ready"
  }
}
```

## Cost Considerations

Gemini 1.5 Flash pricing (as of Dec 2024):
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

Estimated costs for 1000 queries/day:
- ~500K input tokens/day = $0.0375
- ~200K output tokens/day = $0.06
- **Total: ~$3/month** for moderate usage

## Support & Maintenance

- Monitor `/api/chat` endpoint logs for errors
- Review Gemini API usage in Google Cloud Console
- Update context providers when sheet structure changes
- Test thoroughly after Google Sheets modifications

---

**Status:** ✅ Fully Implemented and Ready for Testing

**Next Steps:**
1. Add `GEMINI_API_KEY` to environment variables
2. Test with real user accounts
3. Gather user feedback
4. Implement additional quick actions based on usage patterns
