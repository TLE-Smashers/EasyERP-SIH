/**
 * Get Shared Resources Action
 * Fetches ebooks and notes from federation
 */

"use server";

import { 
  fetchAllSharedEbooks, 
  fetchAllSharedNotes,
  searchResources,
} from "@/lib/google/sheets.federation";
import { SharedResourceFilter } from "@/types/federation";

/**
 * Get all shared ebooks with optional filters
 */
export async function getSharedEbooks(filter?: {
  institutionId?: string;
  category?: string;
  searchQuery?: string;
}) {
  try {
    const ebooks = await fetchAllSharedEbooks(filter);
    return {
      success: true,
      ebooks,
      total: ebooks.length,
    };
  } catch (error) {
    console.error('Error getting shared ebooks:', error);
    return {
      success: false,
      ebooks: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch shared ebooks',
    };
  }
}

/**
 * Get all shared notes with optional filters
 */
export async function getSharedNotes(filter?: {
  institutionId?: string;
  subject?: string;
  course?: string;
  searchQuery?: string;
}) {
  try {
    const notes = await fetchAllSharedNotes(filter);
    return {
      success: true,
      notes,
      total: notes.length,
    };
  } catch (error) {
    console.error('Error getting shared notes:', error);
    return {
      success: false,
      notes: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch shared notes',
    };
  }
}

/**
 * Search across all shared resources
 */
export async function searchSharedResources(query: string) {
  try {
    const results = await searchResources(query);
    return {
      success: true,
      ebooks: results.ebooks,
      notes: results.notes,
      totalEbooks: results.ebooks.length,
      totalNotes: results.notes.length,
    };
  } catch (error) {
    console.error('Error searching shared resources:', error);
    return {
      success: false,
      ebooks: [],
      notes: [],
      totalEbooks: 0,
      totalNotes: 0,
      error: error instanceof Error ? error.message : 'Failed to search resources',
    };
  }
}
