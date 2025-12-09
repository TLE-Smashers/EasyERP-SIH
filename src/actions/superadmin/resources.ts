'use server';

import { 
  getAllSharedResources, 
  addSharedResource,
  getSuperAdminStats 
} from '@/lib/google/sheets.superadmin';
import { SharedResource } from '@/types/auth';

export async function getSharedResources() {
  try {
    const resources = await getAllSharedResources();
    return {
      success: true,
      data: resources,
    };
  } catch (error) {
    console.error('Error in getSharedResources:', error);
    return {
      success: false,
      error: 'Failed to fetch shared resources',
    };
  }
}

export async function createSharedResource(
  data: Omit<SharedResource, 'id' | 'uploadedDate' | 'accessCount'>
) {
  try {
    const success = await addSharedResource(data);
    if (!success) {
      return {
        success: false,
        error: 'Failed to create shared resource',
      };
    }
    return {
      success: true,
      message: 'Shared resource created successfully',
    };
  } catch (error) {
    console.error('Error in createSharedResource:', error);
    return {
      success: false,
      error: 'Failed to create shared resource',
    };
  }
}

export async function getDashboardStats() {
  try {
    const stats = await getSuperAdminStats();
    if (!stats) {
      return {
        success: false,
        error: 'Failed to fetch dashboard stats',
      };
    }
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard stats',
    };
  }
}
