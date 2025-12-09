/**
 * Get Library Resources Action
 * Fetches library resources (ebooks and research papers) from LibraryResources sheet
 */

"use server";

import { getActiveResources } from "@/lib/google/sheets.resources";
import { ResourceFilters } from "@/types/library";

/**
 * Get all library resources for shared access
 * This includes ebooks and research papers uploaded by librarians and faculty
 */
export async function getSharedLibraryResources(filter?: {
  type?: 'ebook' | 'resource';
  category?: string;
  searchQuery?: string;
}) {
  try {
    const filters: ResourceFilters = {
      status: 'active',
      ...(filter?.type && { type: filter.type }),
      ...(filter?.category && { category: filter.category as any }),
      ...(filter?.searchQuery && { searchQuery: filter.searchQuery }),
    };

    const result = await getActiveResources(filters);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        resources: [],
        total: 0,
        error: result.error || 'Failed to fetch library resources',
      };
    }

    return {
      success: true,
      resources: result.data,
      total: result.data.length,
    };
  } catch (error) {
    console.error('Error getting shared library resources:', error);
    return {
      success: false,
      resources: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch library resources',
    };
  }
}
