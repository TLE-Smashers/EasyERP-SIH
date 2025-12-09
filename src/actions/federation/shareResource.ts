/**
 * Share Resource Action (Videos, Lectures, Research Papers, etc.)
 * Syncs local resource to federation super master sheet
 */

"use server";

import { addSharedResource } from "@/lib/google/sheets.federation";
import { SharedResource, AccessType } from "@/types/federation";

interface ShareResourceInput {
  localResourceId?: string;
  type: 'video' | 'lecture' | 'research-paper' | 'presentation' | 'other';
  title: string;
  author?: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: string;
  shareWith: string[]; // ['all'] or ['INST002', 'INST003']
  accessType: AccessType;
  tags?: string[];
}

export async function shareResource(input: ShareResourceInput) {
  try {
    const CURRENT_INSTITUTION_ID = process.env.CURRENT_INSTITUTION_ID || '';
    const CURRENT_INSTITUTION_NAME = process.env.CURRENT_INSTITUTION_NAME || '';

    // Generate federation resource ID
    const federationId = `RES-${Date.now()}-${CURRENT_INSTITUTION_ID}`;
    const currentDate = new Date().toISOString().split('T')[0];

    const sharedResource: Omit<SharedResource, 'rowNumber'> = {
      resourceId: federationId,
      type: input.type,
      title: input.title,
      author: input.author,
      category: input.category,
      description: input.description,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      fileType: input.fileType,
      uploadedBy: input.uploadedBy,
      uploadedByName: input.uploadedByName,
      uploadedByRole: input.uploadedByRole,
      institutionId: CURRENT_INSTITUTION_ID,
      institutionName: CURRENT_INSTITUTION_NAME,
      availableFor: input.shareWith,
      accessType: input.accessType,
      downloads: 0,
      views: 0,
      uploadDate: currentDate,
      tags: input.tags,
      isActive: true,
    };

    // Add to super master sheet
    await addSharedResource(sharedResource);

    return {
      success: true,
      federationId,
      message: 'Resource shared successfully with partner institutions',
    };
  } catch (error) {
    console.error('Error sharing resource:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share resource',
    };
  }
}
