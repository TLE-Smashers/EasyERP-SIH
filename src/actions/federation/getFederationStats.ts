/**
 * Get Federation Statistics Action
 * Provides overview of multi-institution resource sharing
 */

"use server";

import { 
  getFederationStats,
  fetchAllInstitutions,
} from "@/lib/google/sheets.federation";

export async function getFederationStatistics() {
  try {
    const stats = await getFederationStats();
    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Error getting federation stats:', error);
    return {
      success: false,
      stats: null,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
    };
  }
}

export async function getPartnerInstitutions() {
  try {
    const institutions = await fetchAllInstitutions();
    
    // Filter active institutions only
    const activeInstitutions = institutions.filter(inst => inst.status === 'active');
    
    return {
      success: true,
      institutions: activeInstitutions,
      total: activeInstitutions.length,
    };
  } catch (error) {
    console.error('Error getting partner institutions:', error);
    return {
      success: false,
      institutions: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch institutions',
    };
  }
}
