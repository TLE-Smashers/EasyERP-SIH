/**
 * Share Ebook Action
 * Syncs local ebook to federation super master sheet
 */

"use server";

import { addSharedEbook } from "@/lib/google/sheets.federation";
import { SharedEbook, AccessType } from "@/types/federation";

interface ShareEbookInput {
  localEbookId: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear: string;
  category: string;
  subject: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType: 'pdf' | 'epub' | 'mobi' | 'other';
  coverImageUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  shareWith: string[]; // ['all'] or ['INST002', 'INST003']
  accessType: AccessType;
  tags?: string[];
  language?: string;
  pageCount?: number;
}

export async function shareEbook(input: ShareEbookInput) {
  try {
    const CURRENT_INSTITUTION_ID = process.env.CURRENT_INSTITUTION_ID || '';
    const CURRENT_INSTITUTION_NAME = process.env.CURRENT_INSTITUTION_NAME || '';

    // Generate federation ebook ID
    const federationId = `EBOOK-${Date.now()}-${CURRENT_INSTITUTION_ID}`;
    const currentDate = new Date().toISOString().split('T')[0];

    const sharedEbook: Omit<SharedEbook, 'rowNumber'> = {
      ebookId: federationId,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publishedYear: input.publishedYear,
      category: input.category as any,
      subject: input.subject,
      description: input.description,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      fileType: input.fileType,
      coverImageUrl: input.coverImageUrl,
      uploadedBy: input.uploadedBy,
      uploadedByName: input.uploadedByName,
      institutionId: CURRENT_INSTITUTION_ID,
      institutionName: CURRENT_INSTITUTION_NAME,
      availableFor: input.shareWith,
      accessType: input.accessType,
      downloads: 0,
      addedDate: currentDate,
      tags: input.tags,
      language: input.language || 'English',
      pageCount: input.pageCount,
      isActive: true,
    };

    // Add to super master sheet
    await addSharedEbook(sharedEbook);

    // TODO: Update local sheet My_Ebooks tab with federation ID and sync status

    return {
      success: true,
      federationId,
      message: 'Ebook shared successfully with partner institutions',
    };
  } catch (error) {
    console.error('Error sharing ebook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share ebook',
    };
  }
}
