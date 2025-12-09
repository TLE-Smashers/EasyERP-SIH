'use server';

import { 
  getAllInstitutions, 
  getInstitutionById, 
  addInstitution, 
  updateInstitutionStatus 
} from '@/lib/google/sheets.superadmin';
import { Institution } from '@/types/auth';

export async function getInstitutions() {
  try {
    const institutions = await getAllInstitutions();
    return {
      success: true,
      data: institutions,
    };
  } catch (error) {
    console.error('Error in getInstitutions:', error);
    return {
      success: false,
      error: 'Failed to fetch institutions',
    };
  }
}

export async function getInstitution(institutionId: string) {
  try {
    const institution = await getInstitutionById(institutionId);
    if (!institution) {
      return {
        success: false,
        error: 'Institution not found',
      };
    }
    return {
      success: true,
      data: institution,
    };
  } catch (error) {
    console.error('Error in getInstitution:', error);
    return {
      success: false,
      error: 'Failed to fetch institution',
    };
  }
}

export async function createInstitution(data: Omit<Institution, 'id' | 'registeredDate'>) {
  try {
    const success = await addInstitution(data);
    if (!success) {
      return {
        success: false,
        error: 'Failed to create institution',
      };
    }
    return {
      success: true,
      message: 'Institution created successfully',
    };
  } catch (error) {
    console.error('Error in createInstitution:', error);
    return {
      success: false,
      error: 'Failed to create institution',
    };
  }
}

export async function changeInstitutionStatus(
  institutionId: string, 
  status: 'active' | 'inactive' | 'suspended'
) {
  try {
    const success = await updateInstitutionStatus(institutionId, status);
    if (!success) {
      return {
        success: false,
        error: 'Failed to update institution status',
      };
    }
    return {
      success: true,
      message: 'Institution status updated successfully',
    };
  } catch (error) {
    console.error('Error in changeInstitutionStatus:', error);
    return {
      success: false,
      error: 'Failed to update institution status',
    };
  }
}
