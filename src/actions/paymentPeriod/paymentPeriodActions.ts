/**
 * Server Actions for Payment Period Management
 */

'use server';

import {
  fetchAllPaymentPeriods,
  fetchActivePaymentPeriodsForStudent,
  createPaymentPeriod,
  updatePaymentPeriodStatus,
  updatePaymentPeriod,
} from '@/lib/google/sheets.paymentPeriod';
import type {
  PaymentPeriod,
  CreatePaymentPeriodParams,
  UpdatePaymentPeriodParams,
} from '@/types/paymentPeriod';

/**
 * Fetch all payment periods (for accountant)
 */
export async function fetchAllPeriodsAction(): Promise<{
  success: boolean;
  periods?: PaymentPeriod[];
  error?: string;
}> {
  try {
    const periods = await fetchAllPaymentPeriods();
    return { success: true, periods };
  } catch (error) {
    console.error('Error in fetchAllPeriodsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment periods',
    };
  }
}

/**
 * Fetch active payment periods for student
 */
export async function fetchStudentPaymentPeriodsAction(
  course: string,
  branch: string,
  year: number
): Promise<{
  success: boolean;
  periods?: PaymentPeriod[];
  error?: string;
}> {
  try {
    const periods = await fetchActivePaymentPeriodsForStudent(course, branch, year);
    return { success: true, periods };
  } catch (error) {
    console.error('Error in fetchStudentPaymentPeriodsAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active payment periods',
    };
  }
}

/**
 * Create new payment period (accountant only)
 */
export async function createPeriodAction(
  params: CreatePaymentPeriodParams
): Promise<{
  success: boolean;
  period?: PaymentPeriod;
  error?: string;
}> {
  try {
    const period = await createPaymentPeriod(params);
    return { success: true, period };
  } catch (error) {
    console.error('Error in createPeriodAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment period',
    };
  }
}

/**
 * Update payment period status (accountant only)
 */
export async function updatePeriodStatusAction(
  periodId: string,
  status: 'enabled' | 'disabled',
  updatedBy: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await updatePaymentPeriodStatus(periodId, status, updatedBy);
    return { success: true };
  } catch (error) {
    console.error('Error in updatePeriodStatusAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment period status',
    };
  }
}

/**
 * Update payment period details (accountant only)
 */
export async function updatePeriodAction(
  periodId: string,
  updates: UpdatePaymentPeriodParams
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await updatePaymentPeriod(periodId, updates);
    return { success: true };
  } catch (error) {
    console.error('Error in updatePeriodAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment period',
    };
  }
}
