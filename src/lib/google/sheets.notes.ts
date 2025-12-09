/**
 * Google Sheets Integration for Faculty Notes
 * Handles notes upload and fetch from Super Master sheet
 */

import { google } from 'googleapis';
import { SharedNote, AccessType } from '@/types/federation';

const SHEET_NAME = 'Shared_Notes';

// Column mapping for Shared_Notes sheet (26 columns A-Z)
const COLUMN_INDEX = {
  noteId: 0,          // A
  title: 1,           // B
  subject: 2,         // C
  topic: 3,           // D
  course: 4,          // E
  semester: 5,        // F
  branch: 6,          // G
  description: 7,     // H
  fileUrl: 8,         // I
  fileType: 9,        // J
  fileSize: 10,       // K
  facultyId: 11,      // L
  facultyName: 12,    // M
  facultyEmail: 13,   // N
  institutionId: 14,  // O
  institutionName: 15,// P
  availableFor: 16,   // Q
  accessType: 17,     // R
  downloads: 18,      // S
  views: 19,          // T
  rating: 20,         // U
  uploadDate: 21,     // V
  lastUpdated: 22,    // W
  tags: 23,           // X
  academicYear: 24,   // Y
  isActive: 25,       // Z
};

export interface NoteUploadInput {
  title: string;
  subject: string;
  topic: string;
  course: string;
  semester: string;
  branch?: string;
  description?: string;
  fileUrl: string;
  fileType: 'pdf' | 'ppt' | 'doc' | 'other';
  fileSize?: string;
  tags?: string[];
  academicYear?: string;
}

export interface NoteFilters {
  subject?: string;
  course?: string;
  semester?: string;
  branch?: string;
  facultyId?: string;
  searchQuery?: string;
}

/**
 * Get authenticated Google Sheets client
 */
async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

/**
 * Parse row data into SharedNote object
 */
function parseNoteRow(row: string[]): SharedNote {
  const get = (field: keyof typeof COLUMN_INDEX) => row[COLUMN_INDEX[field]] || '';
  const getNum = (field: keyof typeof COLUMN_INDEX) => {
    const val = row[COLUMN_INDEX[field]];
    return val ? parseInt(val, 10) : 0;
  };

  return {
    noteId: get('noteId'),
    title: get('title'),
    subject: get('subject'),
    topic: get('topic'),
    course: get('course'),
    semester: get('semester'),
    branch: get('branch'),
    description: get('description'),
    fileUrl: get('fileUrl'),
    fileType: get('fileType') as 'pdf' | 'ppt' | 'doc' | 'other',
    fileSize: get('fileSize'),
    facultyId: get('facultyId'),
    facultyName: get('facultyName'),
    facultyEmail: get('facultyEmail'),
    institutionId: get('institutionId'),
    institutionName: get('institutionName'),
    availableFor: get('availableFor') ? (get('availableFor') === 'all' ? ['all'] : get('availableFor').split(',')) : ['all'],
    accessType: (get('accessType') as AccessType) || AccessType.PUBLIC,
    downloads: getNum('downloads'),
    views: getNum('views'),
    rating: get('rating') ? parseFloat(get('rating')) : undefined,
    uploadDate: get('uploadDate'),
    lastUpdated: get('lastUpdated'),
    tags: get('tags') ? get('tags').split(',').map(t => t.trim()) : [],
    academicYear: get('academicYear'),
    isActive: get('isActive') === 'TRUE',
  };
}

/**
 * Generate next note ID
 */
async function generateNoteId(): Promise<string> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return 'NOTE-001'; // First note

    // Find the highest note ID
    let maxId = 0;
    for (let i = 1; i < rows.length; i++) {
      const id = rows[i][0];
      if (id && id.startsWith('NOTE-')) {
        const num = parseInt(id.split('-')[1], 10);
        if (num > maxId) maxId = num;
      }
    }

    return `NOTE-${String(maxId + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating note ID:', error);
    throw error;
  }
}

/**
 * Upload a new note to Super Master sheet
 */
export async function uploadNote(
  input: NoteUploadInput,
  facultyId: string,
  facultyName: string,
  facultyEmail: string
): Promise<{ success: boolean; data?: SharedNote; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;
    
    if (!spreadsheetId) {
      return { success: false, error: 'Super Master Sheet ID not configured' };
    }

    // Get institution info from environment
    const institutionId = process.env.CURRENT_INSTITUTION_ID || 'INST001';
    const institutionName = process.env.CURRENT_INSTITUTION_NAME || 'Unknown Institution';

    // Generate new note ID
    const noteId = await generateNoteId();

    // Create note object
    const currentDate = new Date().toISOString();
    const note: SharedNote = {
      noteId,
      title: input.title,
      subject: input.subject,
      topic: input.topic,
      course: input.course,
      semester: input.semester,
      branch: input.branch,
      description: input.description,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize,
      facultyId,
      facultyName,
      facultyEmail,
      institutionId,
      institutionName,
      availableFor: ['all'], // Default to public
      accessType: AccessType.PUBLIC,
      downloads: 0,
      views: 0,
      uploadDate: currentDate,
      lastUpdated: currentDate,
      tags: input.tags || [],
      academicYear: input.academicYear,
      isActive: true,
    };

    // Prepare row data
    const rowData = [
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

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true, data: note };
  } catch (error) {
    console.error('Error uploading note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload note',
    };
  }
}

/**
 * Get all notes with optional filters
 */
export async function getAllNotes(
  filters?: NoteFilters
): Promise<{ success: boolean; data?: SharedNote[]; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    if (!spreadsheetId) {
      return { success: false, error: 'Super Master Sheet ID not configured' };
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Z`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return { success: true, data: [] };
    }

    // Parse all notes (skip header row)
    let notes = rows.slice(1).map(parseNoteRow);

    // Apply filters
    if (filters) {
      if (filters.subject) {
        notes = notes.filter(n => 
          n.subject.toLowerCase().includes(filters.subject!.toLowerCase())
        );
      }
      if (filters.course) {
        notes = notes.filter(n => 
          n.course.toLowerCase().includes(filters.course!.toLowerCase())
        );
      }
      if (filters.semester) {
        notes = notes.filter(n => n.semester === filters.semester);
      }
      if (filters.branch) {
        notes = notes.filter(n => 
          n.branch?.toLowerCase().includes(filters.branch!.toLowerCase())
        );
      }
      if (filters.facultyId) {
        notes = notes.filter(n => n.facultyId === filters.facultyId);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        notes = notes.filter(n =>
          n.title.toLowerCase().includes(query) ||
          n.subject.toLowerCase().includes(query) ||
          n.topic.toLowerCase().includes(query) ||
          n.description?.toLowerCase().includes(query)
        );
      }
    }

    // Filter only active notes
    notes = notes.filter(n => n.isActive);

    return { success: true, data: notes };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notes',
    };
  }
}

/**
 * Get note by ID
 */
export async function getNoteById(
  noteId: string
): Promise<{ success: boolean; data?: SharedNote; error?: string }> {
  try {
    const result = await getAllNotes();
    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Failed to fetch notes' };
    }

    const note = result.data.find(n => n.noteId === noteId);
    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    return { success: true, data: note };
  } catch (error) {
    console.error('Error fetching note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch note',
    };
  }
}

/**
 * Get notes by faculty ID
 */
export async function getNotesByFaculty(
  facultyId: string
): Promise<{ success: boolean; data?: SharedNote[]; error?: string }> {
  return getAllNotes({ facultyId });
}

/**
 * Increment download count for a note
 */
export async function incrementNoteDownloads(
  noteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    // Get note
    const result = await getNoteById(noteId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Note not found' };
    }

    const note = result.data;
    
    // Find row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });
    
    const rows = response.data.values || [];
    let rowNumber = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === noteId) {
        rowNumber = i + 1;
        break;
      }
    }

    if (rowNumber === 0) {
      return { success: false, error: 'Note row not found' };
    }

    const newCount = note.downloads + 1;

    // Update download count (column S)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!S${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount.toString()]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating download count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update download count',
    };
  }
}

/**
 * Update note
 */
export async function updateNote(
  noteId: string,
  updates: Partial<NoteUploadInput>
): Promise<{ success: boolean; data?: SharedNote; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    // Get existing note
    const result = await getNoteById(noteId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Note not found' };
    }

    const note = result.data;
    
    // Find row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });
    
    const rows = response.data.values || [];
    let rowNumber = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === noteId) {
        rowNumber = i + 1;
        break;
      }
    }

    if (rowNumber === 0) {
      return { success: false, error: 'Note row not found' };
    }

    // Merge updates
    const updatedNote: SharedNote = {
      ...note,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    // Prepare row data
    const rowData = [
      updatedNote.noteId,
      updatedNote.title,
      updatedNote.subject,
      updatedNote.topic,
      updatedNote.course,
      updatedNote.semester,
      updatedNote.branch || '',
      updatedNote.description || '',
      updatedNote.fileUrl,
      updatedNote.fileType,
      updatedNote.fileSize || '',
      updatedNote.facultyId,
      updatedNote.facultyName,
      updatedNote.facultyEmail,
      updatedNote.institutionId,
      updatedNote.institutionName,
      updatedNote.availableFor.join(','),
      updatedNote.accessType,
      updatedNote.downloads.toString(),
      updatedNote.views.toString(),
      updatedNote.rating?.toString() || '',
      updatedNote.uploadDate,
      updatedNote.lastUpdated || '',
      updatedNote.tags?.join(',') || '',
      updatedNote.academicYear || '',
      updatedNote.isActive ? 'TRUE' : 'FALSE',
    ];

    // Update entire row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true, data: updatedNote };
  } catch (error) {
    console.error('Error updating note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
    };
  }
}

/**
 * Delete note (set isActive to false)
 */
export async function deleteNote(
  noteId: string
): Promise<{ success: boolean; error?: string }> {
  return updateNote(noteId, { isActive: false } as any);
}

/**
 * Get note statistics
 */
export async function getNoteStats(
  facultyId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const result = await getAllNotes(facultyId ? { facultyId } : undefined);
    if (!result.success || !result.data) {
      return result;
    }

    const notes = result.data;
    const stats = {
      totalNotes: notes.length,
      totalDownloads: notes.reduce((sum, n) => sum + n.downloads, 0),
      totalViews: notes.reduce((sum, n) => sum + n.views, 0),
      averageRating: notes.filter(n => n.rating).length > 0
        ? notes.reduce((sum, n) => sum + (n.rating || 0), 0) / notes.filter(n => n.rating).length
        : 0,
      notesBySubject: notes.reduce((acc: any, n) => {
        acc[n.subject] = (acc[n.subject] || 0) + 1;
        return acc;
      }, {}),
      notesByCourse: notes.reduce((acc: any, n) => {
        acc[n.course] = (acc[n.course] || 0) + 1;
        return acc;
      }, {}),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching note stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch note stats',
    };
  }
}
