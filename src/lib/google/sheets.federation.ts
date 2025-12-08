/**
 * Google Sheets - Federation Module Helper
 * Handles all Sheet operations for multi-institution resource sharing
 */

import { google } from "googleapis";
import {
  Institution,
  SharedEbook,
  SharedNote,
  ResourceAccessLog,
  SearchIndex,
  SharingRequest,
  Partnership,
  InstitutionUpdateData,
  SharedEbookUpdateData,
  SharedNoteUpdateData,
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
      noteId: row[0] || '',
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
      institutionId: row[14] || '',
      institutionName: row[15] || '',
      availableFor: row[16] ? (row[16] === 'all' ? ['all'] : row[16].split(',')) : [],
      accessType: row[17] || 'public',
      downloads: parseInt(row[18]) || 0,
      views: parseInt(row[19]) || 0,
      rating: row[20] ? parseFloat(row[20]) : undefined,
      uploadDate: row[21] || '',
      lastUpdated: row[22] || '',
      tags: row[23] ? row[23].split(',') : [],
      academicYear: row[24] || '',
      isActive: row[25] === 'TRUE',
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
  resourceType: 'ebook' | 'note';
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
