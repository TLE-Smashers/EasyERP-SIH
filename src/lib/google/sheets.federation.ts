/**
 * Google Sheets - Federation Module Helper
 * Handles all Sheet operations for multi-institution resource sharing
 */

import { google } from "googleapis";
import {
  Institution,
  SharedEbook,
  SharedNote,
  SharedResource,
  ResourceAccessLog,
  SearchIndex,
  SharingRequest,
  Partnership,
  InstitutionUpdateData,
  SharedEbookUpdateData,
  SharedNoteUpdateData,
  SharedResourceUpdateData,
  AccessType,
} from "@/types/federation";

// Environment variables
const SUPER_MASTER_SHEET_ID = process.env.SUPER_MASTER_SHEET_ID;
const CURRENT_INSTITUTION_ID = process.env.CURRENT_INSTITUTION_ID;
const CURRENT_INSTITUTION_NAME = process.env.CURRENT_INSTITUTION_NAME;
const LOCAL_SHEET_ID = process.env.GOOGLE_SHEETS_ID;

// Super Master Sheet tab names
const INSTITUTIONS_SHEET = "Institutions";
const SHARED_EBOOKS_SHEET = "Shared_Ebooks";
const SHARED_NOTES_SHEET = "Shared_Notes";
const SHARED_RESOURCES_SHEET = "Shared_Resources";
const ACCESS_LOGS_SHEET = "Access_Logs";
const SEARCH_INDEX_SHEET = "Search_Index";
const SHARING_REQUESTS_SHEET = "Sharing_Requests";
const PARTNERSHIPS_SHEET = "Partnerships";

// Local Institution Sheet tab names
const MY_EBOOKS_SHEET = "My_Ebooks";
const MY_NOTES_SHEET = "My_Notes";

/**
 * Get authenticated Google Sheets client
 */
async function getAuthClient() {
  // Use credentials from environment variable (same as other modules)
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : undefined;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

// ==========================================
// INSTITUTIONS OPERATIONS
// ==========================================

/**
 * Fetch all institutions from Super Master
 */
export async function fetchAllInstitutions(): Promise<Institution[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${INSTITUTIONS_SHEET}!A2:P`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      institutionId: row[0] || '',
      institutionName: row[1] || '',
      institutionCode: row[2] || '',
      location: row[3] || '',
      city: row[4] || '',
      state: row[5] || '',
      type: row[6] || 'government',
      sheetId: row[7] || '',
      contactEmail: row[8] || '',
      contactPerson: row[9] || '',
      phoneNumber: row[10] || '',
      website: row[11] || '',
      status: row[12] || 'active',
      joinedDate: row[13] || '',
      lastSyncDate: row[14] || '',
      partnerInstitutions: row[15] ? row[15].split(',') : [],
      rowNumber: index + 2,
    }));
  } catch (error) {
    console.error("Error fetching institutions:", error);
    throw new Error("Failed to fetch institutions");
  }
}

/**
 * Fetch single institution by ID
 */
export async function fetchInstitutionById(institutionId: string): Promise<Institution | null> {
  const institutions = await fetchAllInstitutions();
  return institutions.find(inst => inst.institutionId === institutionId) || null;
}

/**
 * Add new institution to Super Master
 */
export async function addInstitution(institution: Omit<Institution, 'rowNumber'>): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const row = [
      institution.institutionId,
      institution.institutionName,
      institution.institutionCode,
      institution.location,
      institution.city,
      institution.state,
      institution.type,
      institution.sheetId,
      institution.contactEmail,
      institution.contactPerson,
      institution.phoneNumber,
      institution.website || '',
      institution.status,
      institution.joinedDate,
      institution.lastSyncDate || '',
      institution.partnerInstitutions.join(','),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${INSTITUTIONS_SHEET}!A:P`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error("Error adding institution:", error);
    throw new Error("Failed to add institution");
  }
}

// ==========================================
// SHARED EBOOKS OPERATIONS
// ==========================================

/**
 * Fetch all shared ebooks from Super Master
 */
export async function fetchAllSharedEbooks(filter?: {
  institutionId?: string;
  category?: string;
  searchQuery?: string;
}): Promise<SharedEbook[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_EBOOKS_SHEET}!A2:Z`,
    });

    const rows = response.data.values || [];
    let ebooks = rows.map((row, index) => ({
      ebookId: row[0] || '',
      title: row[1] || '',
      author: row[2] || '',
      isbn: row[3] || '',
      publishedYear: row[4] || '',
      category: row[5] || 'general',
      subject: row[6] || '',
      description: row[7] || '',
      fileUrl: row[8] || '',
      fileSize: row[9] || '',
      fileType: row[10] || 'pdf',
      coverImageUrl: row[11] || '',
      uploadedBy: row[12] || '',
      uploadedByName: row[13] || '',
      institutionId: row[14] || '',
      institutionName: row[15] || '',
      availableFor: row[16] ? (row[16] === 'all' ? ['all'] : row[16].split(',')) : [],
      accessType: row[17] || 'public',
      downloads: parseInt(row[18]) || 0,
      rating: row[19] ? parseFloat(row[19]) : undefined,
      addedDate: row[20] || '',
      lastUpdated: row[21] || '',
      tags: row[22] ? row[22].split(',') : [],
      language: row[23] || 'English',
      pageCount: row[24] ? parseInt(row[24]) : undefined,
      isActive: row[25] === 'TRUE',
      rowNumber: index + 2,
    }));

    // Apply filters
    if (filter?.institutionId) {
      ebooks = ebooks.filter(e => e.institutionId === filter.institutionId);
    }
    if (filter?.category) {
      ebooks = ebooks.filter(e => e.category === filter.category);
    }
    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      ebooks = ebooks.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.author.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query)
      );
    }

    // Filter by access permissions for current institution
    ebooks = ebooks.filter(e => 
      e.availableFor.includes('all') || 
      e.availableFor.includes(CURRENT_INSTITUTION_ID || '')
    );

    return ebooks;
  } catch (error) {
    console.error("Error fetching shared ebooks:", error);
    throw new Error("Failed to fetch shared ebooks");
  }
}

/**
 * Add shared ebook to Super Master
 */
export async function addSharedEbook(ebook: Omit<SharedEbook, 'rowNumber'>): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const row = [
      ebook.ebookId,
      ebook.title,
      ebook.author,
      ebook.isbn || '',
      ebook.publishedYear,
      ebook.category,
      ebook.subject,
      ebook.description || '',
      ebook.fileUrl,
      ebook.fileSize || '',
      ebook.fileType,
      ebook.coverImageUrl || '',
      ebook.uploadedBy,
      ebook.uploadedByName,
      ebook.institutionId,
      ebook.institutionName,
      ebook.availableFor.join(','),
      ebook.accessType,
      ebook.downloads.toString(),
      ebook.rating?.toString() || '',
      ebook.addedDate,
      ebook.lastUpdated || '',
      ebook.tags?.join(',') || '',
      ebook.language,
      ebook.pageCount?.toString() || '',
      ebook.isActive ? 'TRUE' : 'FALSE',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_EBOOKS_SHEET}!A:Z`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    // Also update search index
    await addToSearchIndex({
      resourceId: ebook.ebookId,
      resourceType: 'ebook',
      title: ebook.title,
      author: ebook.author,
      category: ebook.category,
      subject: ebook.subject,
      institutionId: ebook.institutionId,
      institutionName: ebook.institutionName,
      keywords: [ebook.title, ebook.author, ebook.subject, ...(ebook.tags || [])].join(','),
    });
  } catch (error) {
    console.error("Error adding shared ebook:", error);
    throw new Error("Failed to add shared ebook");
  }
}

/**
 * Update ebook download count
 */
export async function incrementEbookDownloads(ebookId: string): Promise<void> {
  try {
    const ebooks = await fetchAllSharedEbooks();
    const ebook = ebooks.find(e => e.ebookId === ebookId);
    
    if (!ebook || !ebook.rowNumber) return;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_EBOOKS_SHEET}!S${ebook.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(ebook.downloads + 1).toString()]],
      },
    });
  } catch (error) {
    console.error("Error updating ebook downloads:", error);
  }
}

// ==========================================
// SHARED NOTES OPERATIONS
// ==========================================

/**
 * Fetch all shared notes from Super Master
 */
export async function fetchAllSharedNotes(filter?: {
  institutionId?: string;
  subject?: string;
  course?: string;
  searchQuery?: string;
}): Promise<SharedNote[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_NOTES_SHEET}!A2:Z`,
    });

    const rows = response.data.values || [];
    let notes = rows.map((row, index) => ({
      noteId: row[0] || '',               // A - noteId
      title: row[1] || '',                // B - title
      subject: row[2] || '',              // C - subject
      topic: row[3] || '',                // D - topic
      course: row[4] || '',               // E - course
      semester: row[5] || '',             // F - semester
      branch: row[6] || '',               // G - branch
      description: row[7] || '',          // H - description
      fileUrl: row[8] || '',              // I - fileUrl
      fileType: (row[9] || 'pdf') as 'pdf' | 'ppt' | 'doc' | 'other',  // J - fileType
      fileSize: row[10] || '',            // K - fileSize
      facultyId: row[11] || '',           // L - facultyId
      facultyName: row[12] || '',         // M - facultyName
      facultyEmail: row[13] || '',        // N - facultyEmail
      institutionId: row[14] || '',       // O - institutionId
      institutionName: row[15] || '',     // P - institutionName
      availableFor: row[16] ? (row[16] === 'all' ? ['all'] : row[16].split(',')) : [], // Q - availableFor
      accessType: (row[17] || 'public') as AccessType,  // R - accessType
      downloads: parseInt(row[18]) || 0,  // S - downloads
      views: parseInt(row[19]) || 0,      // T - views
      rating: row[20] ? parseFloat(row[20]) : undefined,  // U - rating
      uploadDate: row[21] || '',          // V - uploadDate
      lastUpdated: row[22] || '',         // W - lastUpdated
      tags: row[23] ? row[23].split(',').map((t: string) => t.trim()) : [],  // X - tags
      academicYear: row[24] || '',        // Y - academicYear
      isActive: row[25] === 'TRUE',       // Z - isActive
      rowNumber: index + 2,
    }));

    // Apply filters
    if (filter?.institutionId) {
      notes = notes.filter(n => n.institutionId === filter.institutionId);
    }
    if (filter?.subject) {
      notes = notes.filter(n => n.subject.toLowerCase().includes(filter.subject!.toLowerCase()));
    }
    if (filter?.course) {
      notes = notes.filter(n => n.course.toLowerCase().includes(filter.course!.toLowerCase()));
    }
    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.subject.toLowerCase().includes(query) ||
        n.topic.toLowerCase().includes(query)
      );
    }

    // Filter by access permissions
    notes = notes.filter(n => 
      n.availableFor.includes('all') || 
      n.availableFor.includes(CURRENT_INSTITUTION_ID || '')
    );

    return notes;
  } catch (error) {
    console.error("Error fetching shared notes:", error);
    throw new Error("Failed to fetch shared notes");
  }
}

/**
 * Add shared note to Super Master
 */
export async function addSharedNote(note: Omit<SharedNote, 'rowNumber'>): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const row = [
      note.noteId,
      note.title,
      note.subject,
      note.topic,
      note.course,
      note.semester,
      note.branch || '',
      note.description || '',
      note.fileUrl,
      note.fileType,
      note.fileSize || '',
      note.facultyId,
      note.facultyName,
      note.facultyEmail,
      note.institutionId,
      note.institutionName,
      note.availableFor.join(','),
      note.accessType,
      note.downloads.toString(),
      note.views.toString(),
      note.rating?.toString() || '',
      note.uploadDate,
      note.lastUpdated || '',
      note.tags?.join(',') || '',
      note.academicYear || '',
      note.isActive ? 'TRUE' : 'FALSE',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_NOTES_SHEET}!A:Z`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    // Also update search index
    await addToSearchIndex({
      resourceId: note.noteId,
      resourceType: 'note',
      title: note.title,
      author: note.facultyName,
      category: note.course,
      subject: note.subject,
      institutionId: note.institutionId,
      institutionName: note.institutionName,
      keywords: [note.title, note.subject, note.topic, ...(note.tags || [])].join(','),
    });
  } catch (error) {
    console.error("Error adding shared note:", error);
    throw new Error("Failed to add shared note");
  }
}

/**
 * Update note download count
 */
export async function incrementNoteDownloads(noteId: string): Promise<void> {
  try {
    const notes = await fetchAllSharedNotes();
    const note = notes.find(n => n.noteId === noteId);
    
    if (!note || !note.rowNumber) return;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_NOTES_SHEET}!S${note.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(note.downloads + 1).toString()]],
      },
    });
  } catch (error) {
    console.error("Error updating note downloads:", error);
  }
}

/**
 * Update note view count
 */
export async function incrementNoteViews(noteId: string): Promise<void> {
  try {
    const notes = await fetchAllSharedNotes();
    const note = notes.find(n => n.noteId === noteId);
    
    if (!note || !note.rowNumber) return;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_NOTES_SHEET}!T${note.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(note.views + 1).toString()]],
      },
    });
  } catch (error) {
    console.error("Error updating note views:", error);
  }
}

// ============================================
// SHARED RESOURCES (Videos, Lectures, etc.)
// ============================================

/**
 * Fetch all shared resources from Super Master with optional filters
 */
export async function fetchAllSharedResources(filter?: {
  institutionId?: string;
  type?: string;
  category?: string;
  searchQuery?: string;
}): Promise<SharedResource[]> {
  try {
    // Check if Super Master Sheet is configured
    if (!SUPER_MASTER_SHEET_ID) {
      console.warn('Super Master Sheet not configured, returning empty array');
      return [];
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_RESOURCES_SHEET}!A2:X`,
    });

    const rows = response.data.values || [];
    
    let resources: SharedResource[] = rows.map((row: any[], index: number) => ({
      resourceId: row[0] || '',
      type: (row[1] || 'other') as 'video' | 'lecture' | 'research-paper' | 'presentation' | 'other',
      title: row[2] || '',
      author: row[3] || '',
      category: row[4] || '',
      description: row[5] || '',
      fileUrl: row[6] || '',
      fileName: row[7] || '',
      fileSize: row[8] || '',
      fileType: row[9] || '',
      uploadedBy: row[10] || '',
      uploadedByName: row[11] || '',
      uploadedByRole: row[12] || '',
      institutionId: row[13] || '',
      institutionName: row[14] || '',
      availableFor: row[15] ? (row[15] === 'all' ? ['all'] : row[15].split(',')) : [],
      accessType: (row[16] || 'public') as AccessType,
      downloads: parseInt(row[17]) || 0,
      views: parseInt(row[18]) || 0,
      rating: row[19] ? parseFloat(row[19]) : undefined,
      uploadDate: row[20] || '',
      lastUpdated: row[21] || '',
      tags: row[22] ? row[22].split(',').map((t: string) => t.trim()) : [],
      isActive: row[23] === 'TRUE',
      rowNumber: index + 2,
    }));

    // Apply filters
    if (filter?.institutionId) {
      resources = resources.filter(r => r.institutionId === filter.institutionId);
    }
    if (filter?.type) {
      resources = resources.filter(r => r.type === filter.type);
    }
    if (filter?.category) {
      resources = resources.filter(r => r.category === filter.category);
    }
    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      resources = resources.filter(r => 
        r.title.toLowerCase().includes(query) ||
        (r.author && r.author.toLowerCase().includes(query)) ||
        r.category.toLowerCase().includes(query)
      );
    }

    // Filter by access permissions
    resources = resources.filter(r => 
      r.availableFor.includes('all') || 
      r.availableFor.includes(CURRENT_INSTITUTION_ID || '')
    );

    return resources;
  } catch (error: any) {
    // If the sheet doesn't exist (400 error), return empty array instead of throwing
    if (error?.code === 400 || error?.status === 400) {
      console.warn('Shared_Resources sheet does not exist in Super Master spreadsheet. Create it or resources will only show local data.');
      return [];
    }
    console.error("Error fetching shared resources:", error);
    throw new Error("Failed to fetch shared resources");
  }
}

/**
 * Add shared resource to Super Master
 */
export async function addSharedResource(resource: Omit<SharedResource, 'rowNumber'>): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const row = [
      resource.resourceId,
      resource.type,
      resource.title,
      resource.author || '',
      resource.category,
      resource.description || '',
      resource.fileUrl,
      resource.fileName || '',
      resource.fileSize || '',
      resource.fileType || '',
      resource.uploadedBy,
      resource.uploadedByName,
      resource.uploadedByRole,
      resource.institutionId,
      resource.institutionName,
      resource.availableFor.join(','),
      resource.accessType,
      resource.downloads.toString(),
      resource.views?.toString() || '0',
      resource.rating?.toString() || '',
      resource.uploadDate,
      resource.lastUpdated || '',
      resource.tags?.join(',') || '',
      resource.isActive ? 'TRUE' : 'FALSE',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_RESOURCES_SHEET}!A:X`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });

    // Also update search index
    await addToSearchIndex({
      resourceId: resource.resourceId,
      resourceType: 'resource',
      title: resource.title,
      author: resource.author || resource.uploadedByName,
      category: resource.category,
      subject: resource.category,
      institutionId: resource.institutionId,
      institutionName: resource.institutionName,
      keywords: [resource.title, resource.category, ...(resource.tags || [])].join(','),
    });
  } catch (error) {
    console.error("Error adding shared resource:", error);
    throw new Error("Failed to add shared resource");
  }
}

/**
 * Update resource download count
 */
export async function incrementResourceDownloads(resourceId: string): Promise<void> {
  try {
    const resources = await fetchAllSharedResources();
    const resource = resources.find(r => r.resourceId === resourceId);
    
    if (!resource || !resource.rowNumber) return;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_RESOURCES_SHEET}!R${resource.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(resource.downloads + 1).toString()]],
      },
    });
  } catch (error) {
    console.error("Error updating resource downloads:", error);
  }
}

/**
 * Update resource view count
 */
export async function incrementResourceViews(resourceId: string): Promise<void> {
  try {
    const resources = await fetchAllSharedResources();
    const resource = resources.find(r => r.resourceId === resourceId);
    
    if (!resource || !resource.rowNumber) return;

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SHARED_RESOURCES_SHEET}!S${resource.rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[(resource.views! + 1).toString()]],
      },
    });
  } catch (error) {
    console.error("Error updating resource views:", error);
  }
}

// ==========================================
// ACCESS LOGS
// ==========================================

/**
 * Log resource access
 */
export async function logResourceAccess(log: Omit<ResourceAccessLog, 'logId' | 'rowNumber'>): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    // Generate log ID
    const logId = `LOG-${Date.now()}`;

    const row = [
      logId,
      log.resourceType,
      log.resourceId,
      log.resourceTitle,
      log.requestedBy,
      log.requestedByName,
      log.userRole,
      log.requestingInstitutionId,
      log.requestingInstitutionName,
      log.ownerInstitutionId,
      log.ownerInstitutionName,
      log.accessDate,
      log.action,
      log.status,
      log.ipAddress || '',
      log.deviceInfo || '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${ACCESS_LOGS_SHEET}!A:P`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error("Error logging resource access:", error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

// ==========================================
// SEARCH INDEX
// ==========================================

/**
 * Add to search index
 */
async function addToSearchIndex(data: {
  resourceId: string;
  resourceType: 'ebook' | 'note' | 'resource';
  title: string;
  author?: string;
  category: string;
  subject: string;
  institutionId: string;
  institutionName: string;
  keywords: string;
}): Promise<void> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const indexId = `IDX-${Date.now()}`;

    const row = [
      indexId,
      data.resourceId,
      data.resourceType,
      data.title,
      data.keywords,
      data.author || '',
      data.category,
      data.subject,
      data.institutionId,
      data.institutionName,
      'available',
      'public',
      new Date().toISOString().split('T')[0],
      '0',
      '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${SEARCH_INDEX_SHEET}!A:O`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error("Error adding to search index:", error);
  }
}

/**
 * Search across all resources
 */
export async function searchResources(query: string): Promise<{
  ebooks: SharedEbook[];
  notes: SharedNote[];
}> {
  const [ebooks, notes] = await Promise.all([
    fetchAllSharedEbooks({ searchQuery: query }),
    fetchAllSharedNotes({ searchQuery: query }),
  ]);

  return { ebooks, notes };
}

// ==========================================
// LOCAL INSTITUTION OPERATIONS
// ==========================================

/**
 * Fetch my institution's ebooks (local sheet)
 */
export async function fetchMyEbooks(): Promise<any[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LOCAL_SHEET_ID,
      range: `${MY_EBOOKS_SHEET}!A2:AB`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      localEbookId: row[0] || '',
      title: row[1] || '',
      author: row[2] || '',
      isbn: row[3] || '',
      publishedYear: row[4] || '',
      category: row[5] || '',
      subject: row[6] || '',
      description: row[7] || '',
      fileUrl: row[8] || '',
      fileSize: row[9] || '',
      fileType: row[10] || 'pdf',
      coverImageUrl: row[11] || '',
      uploadedBy: row[12] || '',
      uploadedByName: row[13] || '',
      isShared: row[14] === 'TRUE',
      sharedWith: row[15] || '',
      shareDate: row[16] || '',
      sharedBy: row[17] || '',
      syncStatus: row[18] || 'pending',
      federationId: row[19] || '',
      downloads: parseInt(row[20]) || 0,
      rating: row[21] ? parseFloat(row[21]) : undefined,
      addedDate: row[22] || '',
      lastUpdated: row[23] || '',
      tags: row[24] ? row[24].split(',') : [],
      language: row[25] || 'English',
      pageCount: row[26] ? parseInt(row[26]) : undefined,
      isActive: row[27] === 'TRUE',
      rowNumber: index + 2,
    }));
  } catch (error) {
    console.error("Error fetching my ebooks:", error);
    throw new Error("Failed to fetch my ebooks");
  }
}

/**
 * Fetch my institution's notes (local sheet)
 */
export async function fetchMyNotes(): Promise<any[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: LOCAL_SHEET_ID,
      range: `${MY_NOTES_SHEET}!A2:AB`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      localNoteId: row[0] || '',
      title: row[1] || '',
      subject: row[2] || '',
      topic: row[3] || '',
      course: row[4] || '',
      semester: row[5] || '',
      branch: row[6] || '',
      description: row[7] || '',
      fileUrl: row[8] || '',
      fileType: row[9] || 'pdf',
      fileSize: row[10] || '',
      facultyId: row[11] || '',
      facultyName: row[12] || '',
      facultyEmail: row[13] || '',
      isShared: row[14] === 'TRUE',
      sharedWith: row[15] || '',
      shareDate: row[16] || '',
      sharedBy: row[17] || '',
      syncStatus: row[18] || 'pending',
      federationId: row[19] || '',
      downloads: parseInt(row[20]) || 0,
      views: parseInt(row[21]) || 0,
      rating: row[22] ? parseFloat(row[22]) : undefined,
      uploadDate: row[23] || '',
      lastUpdated: row[24] || '',
      tags: row[25] ? row[25].split(',') : [],
      academicYear: row[26] || '',
      isActive: row[27] === 'TRUE',
      rowNumber: index + 2,
    }));
  } catch (error) {
    console.error("Error fetching my notes:", error);
    throw new Error("Failed to fetch my notes");
  }
}

/**
 * Get federation statistics
 */
export async function getFederationStats() {
  try {
    const [institutions, ebooks, notes] = await Promise.all([
      fetchAllInstitutions(),
      fetchAllSharedEbooks(),
      fetchAllSharedNotes(),
    ]);

    const totalDownloads = ebooks.reduce((sum, e) => sum + e.downloads, 0) +
                          notes.reduce((sum, n) => sum + n.downloads, 0);
    const totalViews = notes.reduce((sum, n) => sum + n.views, 0);

    return {
      totalInstitutions: institutions.length,
      activeInstitutions: institutions.filter(i => i.status === 'active').length,
      totalSharedEbooks: ebooks.length,
      totalSharedNotes: notes.length,
      totalDownloads,
      totalViews,
    };
  } catch (error) {
    console.error("Error getting federation stats:", error);
    throw new Error("Failed to get federation statistics");
  }
}
