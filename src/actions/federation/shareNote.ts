/**
 * Share Note Action
 * Syncs local faculty note to federation super master sheet
 */

"use server";

import { addSharedNote } from "@/lib/google/sheets.federation";
import { SharedNote, AccessType } from "@/types/federation";

interface ShareNoteInput {
  localNoteId: string;
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
  facultyId: string;
  facultyName: string;
  facultyEmail: string;
  shareWith: string[]; // ['all'] or ['INST002', 'INST003']
  accessType: AccessType;
  tags?: string[];
  academicYear?: string;
}

export async function shareNote(input: ShareNoteInput) {
  try {
    const CURRENT_INSTITUTION_ID = process.env.CURRENT_INSTITUTION_ID || '';
    const CURRENT_INSTITUTION_NAME = process.env.CURRENT_INSTITUTION_NAME || '';

    // Generate federation note ID
    const federationId = `NOTE-${Date.now()}-${CURRENT_INSTITUTION_ID}`;
    const currentDate = new Date().toISOString().split('T')[0];

    const sharedNote: Omit<SharedNote, 'rowNumber'> = {
      noteId: federationId,
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
      facultyId: input.facultyId,
      facultyName: input.facultyName,
      facultyEmail: input.facultyEmail,
      institutionId: CURRENT_INSTITUTION_ID,
      institutionName: CURRENT_INSTITUTION_NAME,
      availableFor: input.shareWith,
      accessType: input.accessType,
      downloads: 0,
      views: 0,
      uploadDate: currentDate,
      tags: input.tags,
      academicYear: input.academicYear,
      isActive: true,
    };

    // Add to super master sheet
    await addSharedNote(sharedNote);

    // TODO: Update local sheet My_Notes tab with federation ID and sync status

    return {
      success: true,
      federationId,
      message: 'Note shared successfully with partner institutions',
    };
  } catch (error) {
    console.error('Error sharing note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share note',
    };
  }
}
