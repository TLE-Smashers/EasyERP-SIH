/**
 * Download Resource Action
 * Logs access and increments download counter
 */

"use server";

import {
  incrementEbookDownloads,
  incrementNoteDownloads,
  incrementNoteViews,
  logResourceAccess,
} from "@/lib/google/sheets.federation";
import { auth } from "@/lib/auth/auth";

interface DownloadResourceInput {
  resourceType: 'ebook' | 'note';
  resourceId: string;
  resourceTitle: string;
  ownerInstitutionId: string;
  ownerInstitutionName: string;
  action: 'view' | 'download';
}

export async function downloadResource(input: DownloadResourceInput) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - Please login first',
      };
    }

    const CURRENT_INSTITUTION_ID = process.env.CURRENT_INSTITUTION_ID || '';
    const CURRENT_INSTITUTION_NAME = process.env.CURRENT_INSTITUTION_NAME || '';

    // Update counters
    if (input.action === 'download') {
      if (input.resourceType === 'ebook') {
        await incrementEbookDownloads(input.resourceId);
      } else {
        await incrementNoteDownloads(input.resourceId);
      }
    } else if (input.action === 'view' && input.resourceType === 'note') {
      await incrementNoteViews(input.resourceId);
    }

    // Log the access
    await logResourceAccess({
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceTitle: input.resourceTitle,
      requestedBy: session.user.email || '',
      requestedByName: session.user.name || '',
      userRole: session.user.role || 'student',
      requestingInstitutionId: CURRENT_INSTITUTION_ID,
      requestingInstitutionName: CURRENT_INSTITUTION_NAME,
      ownerInstitutionId: input.ownerInstitutionId,
      ownerInstitutionName: input.ownerInstitutionName,
      accessDate: new Date().toISOString(),
      action: input.action,
      status: 'success',
    });

    return {
      success: true,
      message: `${input.action === 'download' ? 'Download' : 'View'} logged successfully`,
    };
  } catch (error) {
    console.error('Error downloading resource:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request',
    };
  }
}
