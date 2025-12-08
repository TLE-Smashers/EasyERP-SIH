'use server';

/**
 * Server Actions for Library Resources
 * Handles E-Books and Faculty Resources operations
 */

import {
  uploadResource as uploadResourceToSheet,
  getAllResources as getAllResourcesFromSheet,
  getActiveResources as getActiveResourcesFromSheet,
  getResourceById as getResourceByIdFromSheet,
  incrementDownloadCount as incrementDownloadCountInSheet,
  updateResource as updateResourceInSheet,
  toggleResourceStatus as toggleResourceStatusInSheet,
  deleteResource as deleteResourceFromSheet,
  getResourceStats as getResourceStatsFromSheet,
  getResourcesByUploader as getResourcesByUploaderFromSheet,
} from '@/lib/google/sheets.resources';

import type {
  LibraryResource,
  ResourceUploadInput,
  ResourceFilters,
} from '@/types/library';

/**
 * Upload a new resource (e-book or faculty resource)
 */
export async function uploadResource(
  input: ResourceUploadInput,
  uploadedBy: string,
  uploadedByName: string,
  uploadedByRole: 'librarian' | 'faculty'
) {
  try {
    const result = await uploadResourceToSheet(input, uploadedBy, uploadedByName, uploadedByRole);
    return result;
  } catch (error) {
    console.error('Error in uploadResource action:', error);
    return { success: false, error: 'Failed to upload resource' };
  }
}

/**
 * Get all resources (for admin/librarian view)
 */
export async function getAllResources(filters?: ResourceFilters) {
  try {
    const result = await getAllResourcesFromSheet(filters);
    return result;
  } catch (error) {
    console.error('Error in getAllResources action:', error);
    return { success: false, error: 'Failed to fetch resources' };
  }
}

/**
 * Get active resources (for student view)
 */
export async function getActiveResources(filters?: ResourceFilters) {
  try {
    const result = await getActiveResourcesFromSheet(filters);
    return result;
  } catch (error) {
    console.error('Error in getActiveResources action:', error);
    return { success: false, error: 'Failed to fetch resources' };
  }
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: string) {
  try {
    const result = await getResourceByIdFromSheet(resourceId);
    return result;
  } catch (error) {
    console.error('Error in getResourceById action:', error);
    return { success: false, error: 'Failed to fetch resource' };
  }
}

/**
 * Increment download count when student downloads a resource
 */
export async function incrementDownloadCount(resourceId: string) {
  try {
    const result = await incrementDownloadCountInSheet(resourceId);
    return result;
  } catch (error) {
    console.error('Error in incrementDownloadCount action:', error);
    return { success: false, error: 'Failed to update download count' };
  }
}

/**
 * Update resource (for librarian/faculty editing their resources)
 */
export async function updateResource(resourceId: string, updates: Partial<LibraryResource>) {
  try {
    const result = await updateResourceInSheet(resourceId, updates);
    return result;
  } catch (error) {
    console.error('Error in updateResource action:', error);
    return { success: false, error: 'Failed to update resource' };
  }
}

/**
 * Toggle resource status (archive/unarchive)
 */
export async function toggleResourceStatus(resourceId: string) {
  try {
    const result = await toggleResourceStatusInSheet(resourceId);
    return result;
  } catch (error) {
    console.error('Error in toggleResourceStatus action:', error);
    return { success: false, error: 'Failed to toggle resource status' };
  }
}

/**
 * Delete resource (soft delete by archiving)
 */
export async function deleteResource(resourceId: string) {
  try {
    const result = await deleteResourceFromSheet(resourceId);
    return result;
  } catch (error) {
    console.error('Error in deleteResource action:', error);
    return { success: false, error: 'Failed to delete resource' };
  }
}

/**
 * Get resource statistics
 */
export async function getResourceStats() {
  try {
    const result = await getResourceStatsFromSheet();
    return result;
  } catch (error) {
    console.error('Error in getResourceStats action:', error);
    return { success: false, error: 'Failed to fetch resource statistics' };
  }
}

/**
 * Get resources uploaded by specific user (for faculty to see their resources)
 */
export async function getMyResources(uploaderId: string) {
  try {
    const result = await getResourcesByUploaderFromSheet(uploaderId);
    return result;
  } catch (error) {
    console.error('Error in getMyResources action:', error);
    return { success: false, error: 'Failed to fetch your resources' };
  }
}
