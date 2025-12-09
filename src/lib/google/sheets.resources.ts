/**
 * Google Sheets Integration for Library Resources
 * Handles E-Books and Faculty Resources
 */

import { google } from 'googleapis';
import type {
  LibraryResource,
  ResourceUploadInput,
  ResourceFilters,
  ResourceStats,
  ResourceType,
  ResourceCategory,
  FileType,
  ResourceStatus,
} from '@/types/library';

const SHEET_NAME = 'LibraryResources';

// Column mapping for LibraryResources sheet
const COLUMN_INDEX = {
  resourceId: 0,        // A
  type: 1,              // B
  title: 2,             // C
  author: 3,            // D
  category: 4,          // E
  description: 5,       // F
  fileUrl: 6,           // G
  fileName: 7,          // H
  fileSize: 8,          // I
  fileType: 9,          // J
  uploadedBy: 10,       // K
  uploadedByName: 11,   // L
  uploadedByRole: 12,   // M
  uploadDate: 13,       // N
  tags: 14,             // O
  downloadCount: 15,    // P
  status: 16,           // Q
  rowNumber: 17,        // R
};

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
 * Parse row data into LibraryResource object
 */
function parseResourceRow(row: string[]): LibraryResource {
  const get = (field: keyof typeof COLUMN_INDEX) => row[COLUMN_INDEX[field]] || '';
  const getNum = (field: keyof typeof COLUMN_INDEX) => {
    const val = row[COLUMN_INDEX[field]];
    return val ? parseInt(val, 10) : 0;
  };

  return {
    resourceId: get('resourceId'),
    type: get('type') as ResourceType,
    title: get('title'),
    author: get('author'),
    category: get('category') as ResourceCategory,
    description: get('description'),
    fileUrl: get('fileUrl'),
    fileName: get('fileName'),
    fileSize: getNum('fileSize'),
    fileType: get('fileType') as FileType,
    uploadedBy: get('uploadedBy'),
    uploadedByName: get('uploadedByName'),
    uploadedByRole: get('uploadedByRole') as 'librarian' | 'faculty',
    uploadDate: get('uploadDate'),
    tags: get('tags') ? get('tags').split(',').map((t: string) => t.trim()) : [],
    downloadCount: getNum('downloadCount'),
    status: get('status') as ResourceStatus,
    rowNumber: getNum('rowNumber'),
  };
}

/**
 * Generate next resource ID
 */
async function generateResourceId(): Promise<string> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return 'RES-001'; // First resource

    // Find the highest resource ID
    let maxId = 0;
    for (let i = 1; i < rows.length; i++) {
      const id = rows[i][0];
      if (id && id.startsWith('RES-')) {
        const num = parseInt(id.split('-')[1], 10);
        if (num > maxId) maxId = num;
      }
    }

    return `RES-${String(maxId + 1).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating resource ID:', error);
    throw error;
  }
}

/**
 * Upload a new resource (e-book or faculty resource)
 */
export async function uploadResource(
  input: ResourceUploadInput,
  uploadedBy: string,
  uploadedByName: string,
  uploadedByRole: 'librarian' | 'faculty'
): Promise<{ success: boolean; data?: LibraryResource; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    // Generate new resource ID
    const resourceId = await generateResourceId();

    // Get current row count
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });
    const rowNumber = (response.data.values?.length || 1) + 1;

    // Create resource object
    const resource: LibraryResource = {
      resourceId,
      type: input.type,
      title: input.title,
      author: input.author,
      category: input.category,
      description: input.description,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      fileType: input.fileType,
      uploadedBy,
      uploadedByName,
      uploadedByRole,
      uploadDate: new Date().toISOString(),
      tags: input.tags,
      downloadCount: 0,
      status: 'active',
      rowNumber,
    };

    // Prepare row data
    const rowData = [
      resource.resourceId,
      resource.type,
      resource.title,
      resource.author,
      resource.category,
      resource.description,
      resource.fileUrl,
      resource.fileName,
      resource.fileSize.toString(),
      resource.fileType,
      resource.uploadedBy,
      resource.uploadedByName,
      resource.uploadedByRole,
      resource.uploadDate,
      resource.tags.join(','),
      resource.downloadCount.toString(),
      resource.status,
      resource.rowNumber?.toString() || '',
    ];

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:R`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true, data: resource };
  } catch (error) {
    console.error('Error uploading resource:', error);
    return { success: false, error: 'Failed to upload resource' };
  }
}

/**
 * Get all resources with optional filters
 */
export async function getAllResources(
  filters?: ResourceFilters
): Promise<{ success: boolean; data?: LibraryResource[]; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:R`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      return { success: true, data: [] };
    }

    // Parse all resources (skip header row)
    let resources = rows.slice(1).map(parseResourceRow);

    // Apply filters
    if (filters) {
      if (filters.type) {
        resources = resources.filter((r) => r.type === filters.type);
      }
      if (filters.category) {
        resources = resources.filter((r) => r.category === filters.category);
      }
      if (filters.uploadedByRole) {
        resources = resources.filter((r) => r.uploadedByRole === filters.uploadedByRole);
      }
      if (filters.status) {
        resources = resources.filter((r) => r.status === filters.status);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        resources = resources.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.author.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        resources = resources.filter((r) =>
          filters.tags!.some((tag) =>
            r.tags.some((rTag) => rTag.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      }
    }

    return { success: true, data: resources };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error: 'Failed to fetch resources' };
  }
}

/**
 * Get active resources (for students)
 */
export async function getActiveResources(
  filters?: ResourceFilters
): Promise<{ success: boolean; data?: LibraryResource[]; error?: string }> {
  const result = await getAllResources({ ...filters, status: 'active' });
  return result;
}

/**
 * Get resource by ID
 */
export async function getResourceById(
  resourceId: string
): Promise<{ success: boolean; data?: LibraryResource; error?: string }> {
  try {
    const result = await getAllResources();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch resources' };
    }

    const resource = result.data.find((r) => r.resourceId === resourceId);
    if (!resource) {
      return { success: false, error: 'Resource not found' };
    }

    return { success: true, data: resource };
  } catch (error) {
    console.error('Error fetching resource:', error);
    return { success: false, error: 'Failed to fetch resource' };
  }
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    // Get resource
    const result = await getResourceById(resourceId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Resource not found' };
    }

    const resource = result.data;
    const newCount = resource.downloadCount + 1;

    // Update download count
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!P${resource.rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount.toString()]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing download count:', error);
    return { success: false, error: 'Failed to update download count' };
  }
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  updates: Partial<LibraryResource>
): Promise<{ success: boolean; data?: LibraryResource; error?: string }> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SUPER_MASTER_SHEET_ID;

    // Get existing resource
    const result = await getResourceById(resourceId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Resource not found' };
    }

    const resource = result.data;
    const updatedResource = { ...resource, ...updates };

    // Prepare row data
    const rowData = [
      updatedResource.resourceId,
      updatedResource.type,
      updatedResource.title,
      updatedResource.author,
      updatedResource.category,
      updatedResource.description,
      updatedResource.fileUrl,
      updatedResource.fileName,
      updatedResource.fileSize.toString(),
      updatedResource.fileType,
      updatedResource.uploadedBy,
      updatedResource.uploadedByName,
      updatedResource.uploadedByRole,
      updatedResource.uploadDate,
      updatedResource.tags.join(','),
      updatedResource.downloadCount.toString(),
      updatedResource.status,
      updatedResource.rowNumber?.toString() || '',
    ];

    // Update row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A${resource.rowNumber}:R${resource.rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true, data: updatedResource };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { success: false, error: 'Failed to update resource' };
  }
}

/**
 * Archive/Unarchive resource
 */
export async function toggleResourceStatus(
  resourceId: string
): Promise<{ success: boolean; data?: LibraryResource; error?: string }> {
  try {
    const result = await getResourceById(resourceId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Resource not found' };
    }

    const newStatus: ResourceStatus = result.data.status === 'active' ? 'archived' : 'active';
    return await updateResource(resourceId, { status: newStatus });
  } catch (error) {
    console.error('Error toggling resource status:', error);
    return { success: false, error: 'Failed to toggle resource status' };
  }
}

/**
 * Delete resource (soft delete by archiving)
 */
export async function deleteResource(
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await updateResource(resourceId, { status: 'archived' });
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { success: false, error: 'Failed to delete resource' };
  }
}

/**
 * Get resource statistics
 */
export async function getResourceStats(): Promise<{
  success: boolean;
  data?: ResourceStats;
  error?: string;
}> {
  try {
    const result = await getAllResources({ status: 'active' });
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch resources' };
    }

    const resources = result.data;

    const stats: ResourceStats = {
      totalResources: resources.length,
      totalEbooks: resources.filter((r) => r.type === 'ebook').length,
      totalFacultyResources: resources.filter((r) => r.type === 'resource').length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
      resourcesByCategory: {} as Record<string, number>,
      topDownloadedResources: resources
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 10),
    };

    // Calculate resources by category
    resources.forEach((r) => {
      stats.resourcesByCategory[r.category] = (stats.resourcesByCategory[r.category] || 0) + 1;
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    return { success: false, error: 'Failed to fetch resource statistics' };
  }
}

/**
 * Get resources uploaded by specific user
 */
export async function getResourcesByUploader(
  uploaderId: string
): Promise<{ success: boolean; data?: LibraryResource[]; error?: string }> {
  try {
    const result = await getAllResources();
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch resources' };
    }

    const resources = result.data.filter((r) => r.uploadedBy === uploaderId);
    return { success: true, data: resources };
  } catch (error) {
    console.error('Error fetching resources by uploader:', error);
    return { success: false, error: 'Failed to fetch resources' };
  }
}
