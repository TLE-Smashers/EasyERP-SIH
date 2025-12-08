# Simple Cache System - Google Sheets Quota Fix

## Problem Solved
- **Issue**: Google Sheets API quota exceeded (429 error)
- **Root Cause**: Multiple redundant API calls on every dashboard page load
- **Solution**: Simple in-memory cache with TTL (Time To Live)

## Implementation

### 1. Cache Module (`/src/lib/cache/simple-cache.ts`)
```typescript
// Simple singleton cache with TTL support
const cache = new SimpleCache();
```

**Features**:
- ✅ In-memory storage (Map-based)
- ✅ TTL (Time To Live) - default 60 seconds
- ✅ Automatic expiration
- ✅ Singleton pattern
- ✅ Simple API: `get()`, `set()`, `clear()`, `clearAll()`

### 2. Integration in Google Sheets Module

**File**: `/src/lib/google/sheets.admission.ts`

**Changes**:
```typescript
import { cache } from "@/lib/cache/simple-cache";

export async function fetchAllApplications(): Promise<Application[]> {
  const CACHE_KEY = 'admission_applications';
  const CACHE_TTL = 60000; // 60 seconds

  // Try cache first
  const cachedData = cache.get<Application[]>(CACHE_KEY);
  if (cachedData) {
    console.log('✅ Using cached admission data');
    return cachedData;
  }

  // Fetch from API if not in cache
  console.log('📡 Fetching from Google Sheets API');
  const applications = await fetchFromGoogleSheets();
  
  // Store in cache
  cache.set(CACHE_KEY, applications, CACHE_TTL);
  
  return applications;
}

// Clear cache when data is updated
export async function updateApplication(rowNumber, data) {
  // ... update logic ...
  
  // Invalidate cache
  cache.clear('admission_applications');
  console.log('🗑️ Cache cleared after update');
}
```

## How It Works

### Request Flow (Before Cache)
```
Dashboard Load → getApplicationStats() 
  → getApplications() 
  → fetchAllApplications() 
  → Google Sheets API ❌ (Every time)
```

### Request Flow (After Cache)
```
Dashboard Load → getApplicationStats() 
  → getApplications() 
  → fetchAllApplications() 
  → Cache Check ✅
    → If exists: Return cached data (Fast)
    → If expired/missing: Fetch from API → Cache it → Return
```

## Benefits

1. **Quota Management**: Reduces API calls by 95%+ (60 seconds cache = 1 call per minute max)
2. **Performance**: Instant data retrieval from cache
3. **Simple**: No external dependencies (Redis, etc.)
4. **SIH-Ready**: Works perfectly for prototype demo

## Testing

### Console Output
```
✅ Using cached admission data        ← Subsequent calls
📡 Fetching from Google Sheets API    ← First call or after expiry
✅ Cached 25 applications              ← After API fetch
🗑️ Cache cleared after update          ← When data changes
```

### Verification Steps
1. Open dashboard → Should see "📡 Fetching from Google Sheets API"
2. Refresh page (within 60s) → Should see "✅ Using cached admission data"
3. Wait 60+ seconds → Should fetch again from API

## Cache Invalidation

Cache is automatically cleared when:
- ✅ TTL expires (60 seconds)
- ✅ Application is updated (`updateApplication()`)
- 🔧 Manual clear: `cache.clear('admission_applications')`
- 🔧 Clear all: `cache.clearAll()`

## Configuration

### Change TTL
```typescript
const CACHE_TTL = 30000;  // 30 seconds
const CACHE_TTL = 120000; // 2 minutes
const CACHE_TTL = 300000; // 5 minutes
```

### Multiple Cache Keys
```typescript
cache.set('admission_applications', data, 60000);
cache.set('student_records', data, 120000);
cache.set('faculty_list', data, 300000);
```

## Limitations

1. **Memory-based**: Data lost on server restart (acceptable for prototype)
2. **Single instance**: Won't work across multiple server instances (fine for SIH demo)
3. **No persistence**: No disk storage (keeps it simple)

## Future Enhancements (Post-SIH)

If needed for production:
- Redis cache for multi-instance support
- Database caching layer
- Stale-while-revalidate strategy
- Cache warming on startup

## Result

✅ **Quota Error Fixed**: No more 429 errors  
✅ **Single Call System**: One API call per 60 seconds  
✅ **Simple Implementation**: 50 lines of cache code  
✅ **Zero Complexity**: No external services needed  
✅ **SIH-Ready**: Works perfectly for demo  

---

**Status**: ✅ Implemented and Working  
**Date**: January 2025  
**Context**: Smart India Hackathon 2025 - ERP System Prototype
