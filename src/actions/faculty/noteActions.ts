'use server';

/**
 * Server Actions for Faculty Notes
 * Upload and manage notes in Super Master sheet
 */

import { auth } from '@/lib/auth/auth';
import {
  uploadNote,
  getAllNotes,
  getNoteById,
  getNotesByFaculty,
  incrementNoteDownloads,
  updateNote,
  deleteNote,
  getNoteStats,
  type NoteUploadInput,
  type NoteFilters,
} from '@/lib/google/sheets.notes';
import { SharedNote } from '@/types/federation';

/**
 * Upload a new faculty note
 */
export async function uploadFacultyNote(input: NoteUploadInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const facultyId = session.user.id || '';
    const facultyName = session.user.name || '';
    const facultyEmail = session.user.email || '';

    return await uploadNote(input, facultyId, facultyName, facultyEmail);
  } catch (error) {
    console.error('Error in uploadFacultyNote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload note',
    };
  }
}

/**
 * Get all notes with optional filters
 */
export async function fetchAllNotes(filters?: NoteFilters) {
  try {
    return await getAllNotes(filters);
  } catch (error) {
    console.error('Error in fetchAllNotes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notes',
    };
  }
}

/**
 * Get a single note by ID
 */
export async function fetchNoteById(noteId: string) {
  try {
    return await getNoteById(noteId);
  } catch (error) {
    console.error('Error in fetchNoteById:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch note',
    };
  }
}

/**
 * Get notes uploaded by current faculty member
 */
export async function fetchMyNotes() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const facultyId = session.user.id || '';
    return await getNotesByFaculty(facultyId);
  } catch (error) {
    console.error('Error in fetchMyNotes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notes',
    };
  }
}

/**
 * Increment download count for a note
 */
export async function recordNoteDownload(noteId: string) {
  try {
    return await incrementNoteDownloads(noteId);
  } catch (error) {
    console.error('Error in recordNoteDownload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record download',
    };
  }
}

/**
 * Update a note
 */
export async function updateFacultyNote(noteId: string, updates: Partial<NoteUploadInput>) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const noteResult = await getNoteById(noteId);
    if (!noteResult.success || !noteResult.data) {
      return { success: false, error: 'Note not found' };
    }

    if (noteResult.data.facultyId !== session.user.id) {
      return { success: false, error: 'Unauthorized to update this note' };
    }

    return await updateNote(noteId, updates);
  } catch (error) {
    console.error('Error in updateFacultyNote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
    };
  }
}

/**
 * Delete a note (set as inactive)
 */
export async function deleteFacultyNote(noteId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const noteResult = await getNoteById(noteId);
    if (!noteResult.success || !noteResult.data) {
      return { success: false, error: 'Note not found' };
    }

    if (noteResult.data.facultyId !== session.user.id) {
      return { success: false, error: 'Unauthorized to delete this note' };
    }

    return await deleteNote(noteId);
  } catch (error) {
    console.error('Error in deleteFacultyNote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
    };
  }
}

/**
 * Get statistics for notes
 */
export async function fetchNoteStats() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const facultyId = session.user.id || '';
    return await getNoteStats(facultyId);
  } catch (error) {
    console.error('Error in fetchNoteStats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    };
  }
}
