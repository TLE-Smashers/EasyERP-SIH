/**
 * Google Sheets Payment Period Service
 * Handles payment period configuration for controlling student payment availability
 */

import { google } from 'googleapis';
import type { PaymentPeriod, CreatePaymentPeriodParams, UpdatePaymentPeriodParams } from '@/types/paymentPeriod';

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = 'PaymentPeriods';
const SHEET_RANGE = `${SHEET_NAME}!1:1000`;

/**
 * Column Header Keys (must match Google Sheets header row exactly)
 */
const COLUMN_KEYS = {
  PERIOD_ID: 'periodId',
  TYPE: 'type',
  TITLE: 'title',
  DESCRIPTION: 'description',
  ACADEMIC_YEAR: 'academicYear',
  SEMESTER: 'semester',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  STATUS: 'status',
  TARGET_COURSES: 'targetCourses',
  TARGET_BRANCHES: 'targetBranches',
  TARGET_YEARS: 'targetYears',
  TUITION_FEE: 'tuitionFee',
  AMALGAMATED_FUND: 'amalgamatedFund',
  SPORTS_FEE: 'sportsFee',
  CAUTION_MONEY: 'cautionMoney',
  TRANSFER_CERT_FEE: 'transferCertificateFee',
  LIBRARY_CARD_FEE: 'libraryCardReissueFee',
  PENALTY_FEE: 'penaltyFee',
  OTHER_FEES: 'otherFees',
  TRANSACTION_CHARGES: 'transactionCharges',
  TOTAL_AMOUNT: 'totalAmount',
  CREATED_BY: 'createdBy',
  CREATED_DATE: 'createdDate',
  UPDATED_BY: 'updatedBy',
  UPDATED_DATE: 'updatedDate',
};

/**
 * Get authenticated Google Sheets client
 */
function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  if (!SHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is not set');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

async function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Get column index mapping from header row
 */
async function getColumnIndexMapping(): Promise<Record<string, number>> {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });

    const headers = response.data.values?.[0] || [];
    
    if (headers.length === 0) {
      throw new Error(
        `PaymentPeriods sheet is empty or doesn't have headers. Please add the column headers first.`
      );
    }

    const mapping: Record<string, number> = {};

    headers.forEach((header: string, index: number) => {
      mapping[header] = index;
    });

    return mapping;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unable to parse')) {
        throw new Error(
          'PaymentPeriods sheet not found. Please create a sheet named "PaymentPeriods" in your Google Sheets with the required column headers.'
        );
      }
      throw error;
    }
    throw new Error('Failed to get column mapping from PaymentPeriods sheet');
  }
}

/**
 * Convert PaymentPeriod object to row object (key-value pairs)
 */
function periodToRowObject(period: PaymentPeriod): Record<string, any> {
  return {
    [COLUMN_KEYS.PERIOD_ID]: period.id,
    [COLUMN_KEYS.TYPE]: period.type,
    [COLUMN_KEYS.TITLE]: period.title,
    [COLUMN_KEYS.DESCRIPTION]: period.description || '',
    [COLUMN_KEYS.ACADEMIC_YEAR]: period.academicYear,
    [COLUMN_KEYS.SEMESTER]: period.semester || '',
    [COLUMN_KEYS.START_DATE]: period.startDate,
    [COLUMN_KEYS.END_DATE]: period.endDate,
    [COLUMN_KEYS.STATUS]: period.status,
    [COLUMN_KEYS.TARGET_COURSES]: period.targetCourses,
    [COLUMN_KEYS.TARGET_BRANCHES]: period.targetBranches,
    [COLUMN_KEYS.TARGET_YEARS]: period.targetYears,
    [COLUMN_KEYS.TUITION_FEE]: period.tuitionFee,
    [COLUMN_KEYS.AMALGAMATED_FUND]: period.amalgamatedFund,
    [COLUMN_KEYS.SPORTS_FEE]: period.sportsFee,
    [COLUMN_KEYS.CAUTION_MONEY]: period.cautionMoney,
    [COLUMN_KEYS.TRANSFER_CERT_FEE]: period.transferCertificateFee,
    [COLUMN_KEYS.LIBRARY_CARD_FEE]: period.libraryCardReissueFee,
    [COLUMN_KEYS.PENALTY_FEE]: period.penaltyFee,
    [COLUMN_KEYS.OTHER_FEES]: period.otherFees,
    [COLUMN_KEYS.TRANSACTION_CHARGES]: period.transactionCharges,
    [COLUMN_KEYS.TOTAL_AMOUNT]: period.totalAmount,
    [COLUMN_KEYS.CREATED_BY]: period.createdBy,
    [COLUMN_KEYS.CREATED_DATE]: period.createdDate,
    [COLUMN_KEYS.UPDATED_BY]: period.updatedBy || '',
    [COLUMN_KEYS.UPDATED_DATE]: period.updatedDate || '',
  };
}

/**
 * Convert row object to array based on column mapping
 */
async function rowObjectToArray(rowObject: Record<string, any>): Promise<any[]> {
  const mapping = await getColumnIndexMapping();
  const maxIndex = Math.max(...Object.values(mapping));
  const row = new Array(maxIndex + 1).fill('');

  Object.entries(rowObject).forEach(([key, value]) => {
    const index = mapping[key];
    if (index !== undefined) {
      row[index] = value;
    }
  });

  return row;
}

/**
 * Parse Google Sheets row to PaymentPeriod object
 */
async function rowToPeriod(row: any[], rowNumber: number): Promise<PaymentPeriod> {
  const mapping = await getColumnIndexMapping();
  
  const getValue = (key: string) => {
    const index = mapping[key];
    return index !== undefined ? row[index] : undefined;
  };

  return {
    id: getValue(COLUMN_KEYS.PERIOD_ID) || '',
    type: getValue(COLUMN_KEYS.TYPE) as any || 'other',
    title: getValue(COLUMN_KEYS.TITLE) || '',
    description: getValue(COLUMN_KEYS.DESCRIPTION) || undefined,
    academicYear: getValue(COLUMN_KEYS.ACADEMIC_YEAR) || '',
    semester: getValue(COLUMN_KEYS.SEMESTER) ? Number(getValue(COLUMN_KEYS.SEMESTER)) : undefined,
    startDate: getValue(COLUMN_KEYS.START_DATE) || '',
    endDate: getValue(COLUMN_KEYS.END_DATE) || '',
    status: getValue(COLUMN_KEYS.STATUS) as any || 'disabled',
    targetCourses: getValue(COLUMN_KEYS.TARGET_COURSES) || 'ALL',
    targetBranches: getValue(COLUMN_KEYS.TARGET_BRANCHES) || 'ALL',
    targetYears: getValue(COLUMN_KEYS.TARGET_YEARS) || 'ALL',
    tuitionFee: Number(getValue(COLUMN_KEYS.TUITION_FEE)) || 0,
    amalgamatedFund: Number(getValue(COLUMN_KEYS.AMALGAMATED_FUND)) || 0,
    sportsFee: Number(getValue(COLUMN_KEYS.SPORTS_FEE)) || 0,
    cautionMoney: Number(getValue(COLUMN_KEYS.CAUTION_MONEY)) || 0,
    transferCertificateFee: Number(getValue(COLUMN_KEYS.TRANSFER_CERT_FEE)) || 0,
    libraryCardReissueFee: Number(getValue(COLUMN_KEYS.LIBRARY_CARD_FEE)) || 0,
    penaltyFee: Number(getValue(COLUMN_KEYS.PENALTY_FEE)) || 0,
    otherFees: Number(getValue(COLUMN_KEYS.OTHER_FEES)) || 0,
    transactionCharges: Number(getValue(COLUMN_KEYS.TRANSACTION_CHARGES)) || 0,
    totalAmount: Number(getValue(COLUMN_KEYS.TOTAL_AMOUNT)) || 0,
    createdBy: getValue(COLUMN_KEYS.CREATED_BY) || '',
    createdDate: getValue(COLUMN_KEYS.CREATED_DATE) || '',
    updatedBy: getValue(COLUMN_KEYS.UPDATED_BY) || undefined,
    updatedDate: getValue(COLUMN_KEYS.UPDATED_DATE) || undefined,
    rowNumber,
  };
}

/**
 * Fetch all payment periods
 */
export async function fetchAllPaymentPeriods(): Promise<PaymentPeriod[]> {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // No data or only headers

    const periods: PaymentPeriod[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length > 0 && row[0]) { // Has periodId
        const period = await rowToPeriod(row, i + 1);
        periods.push(period);
      }
    }

    return periods;
  } catch (error) {
    console.error('Error fetching payment periods:', error);
    throw error;
  }
}

/**
 * Fetch active payment periods for a specific student
 */
export async function fetchActivePaymentPeriodsForStudent(
  course: string,
  branch: string,
  year: number
): Promise<PaymentPeriod[]> {
  const allPeriods = await fetchAllPaymentPeriods();
  const now = new Date();

  return allPeriods.filter((period) => {
    // Must be enabled
    if (period.status !== 'enabled') return false;

    // Check if period is within date range
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    if (now < startDate || now > endDate) return false;

    // Check course filter
    if (period.targetCourses !== 'ALL') {
      const courses = period.targetCourses.split(',').map((c) => c.trim());
      if (!courses.includes(course)) return false;
    }

    // Check branch filter
    if (period.targetBranches !== 'ALL') {
      const branches = period.targetBranches.split(',').map((b) => b.trim());
      if (!branches.includes(branch)) return false;
    }

    // Check year filter
    if (period.targetYears !== 'ALL') {
      const years = period.targetYears.split(',').map((y) => Number(y.trim()));
      if (!years.includes(year)) return false;
    }

    return true;
  });
}

/**
 * Create new payment period
 */
export async function createPaymentPeriod(params: CreatePaymentPeriodParams): Promise<PaymentPeriod> {
  try {
    const sheets = await getSheetsClient();
    
    // Calculate total amount
    const totalAmount =
      params.tuitionFee +
      params.amalgamatedFund +
      params.sportsFee +
      params.cautionMoney +
      params.transferCertificateFee +
      params.libraryCardReissueFee +
      params.penaltyFee +
      params.otherFees +
      params.transactionCharges;

    // Generate period ID
    const timestamp = Date.now();
    const periodId = `PERIOD-${new Date().getFullYear()}-${timestamp}`;

    const period: PaymentPeriod = {
      id: periodId,
      type: params.type,
      title: params.title,
      description: params.description,
      academicYear: params.academicYear,
      semester: params.semester,
      startDate: params.startDate,
      endDate: params.endDate,
      status: 'enabled',
      targetCourses: params.targetCourses,
      targetBranches: params.targetBranches,
      targetYears: params.targetYears,
      tuitionFee: params.tuitionFee,
      amalgamatedFund: params.amalgamatedFund,
      sportsFee: params.sportsFee,
      cautionMoney: params.cautionMoney,
      transferCertificateFee: params.transferCertificateFee,
      libraryCardReissueFee: params.libraryCardReissueFee,
      penaltyFee: params.penaltyFee,
      otherFees: params.otherFees,
      transactionCharges: params.transactionCharges,
      totalAmount,
      createdBy: params.createdBy,
      createdDate: new Date().toISOString(),
    };

    const rowObject = periodToRowObject(period);
    const row = await rowObjectToArray(rowObject);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return period;
  } catch (error) {
    console.error('Error creating payment period:', error);
    if (error instanceof Error) {
      if (error.message.includes('PaymentPeriods sheet')) {
        // Re-throw our custom sheet error messages
        throw error;
      }
      throw new Error(`Failed to create payment period: ${error.message}`);
    }
    throw new Error('Failed to create payment period due to an unknown error');
  }
}

/**
 * Update payment period status (enable/disable)
 */
export async function updatePaymentPeriodStatus(
  periodId: string,
  status: 'enabled' | 'disabled',
  updatedBy: string
): Promise<void> {
  try {
    const periods = await fetchAllPaymentPeriods();
    const period = periods.find((p) => p.id === periodId);

    if (!period || !period.rowNumber) {
      throw new Error('Payment period not found');
    }

    const sheets = await getSheetsClient();
    const mapping = await getColumnIndexMapping();

    const statusColIndex = mapping[COLUMN_KEYS.STATUS];
    const updatedByColIndex = mapping[COLUMN_KEYS.UPDATED_BY];
    const updatedDateColIndex = mapping[COLUMN_KEYS.UPDATED_DATE];

    if (statusColIndex === undefined) {
      throw new Error('Status column not found');
    }

    const statusCol = String.fromCharCode(65 + statusColIndex);
    const updatedByCol = updatedByColIndex !== undefined ? String.fromCharCode(65 + updatedByColIndex) : null;
    const updatedDateCol = updatedDateColIndex !== undefined ? String.fromCharCode(65 + updatedDateColIndex) : null;

    const updates: Array<{ range: string; values: any[][] }> = [
      {
        range: `${SHEET_NAME}!${statusCol}${period.rowNumber}`,
        values: [[status]],
      },
    ];

    if (updatedByCol) {
      updates.push({
        range: `${SHEET_NAME}!${updatedByCol}${period.rowNumber}`,
        values: [[updatedBy]],
      });
    }

    if (updatedDateCol) {
      updates.push({
        range: `${SHEET_NAME}!${updatedDateCol}${period.rowNumber}`,
        values: [[new Date().toISOString()]],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    });
  } catch (error) {
    console.error('Error updating payment period status:', error);
    throw error;
  }
}

/**
 * Update payment period details
 */
export async function updatePaymentPeriod(
  periodId: string,
  updates: UpdatePaymentPeriodParams
): Promise<void> {
  try {
    const periods = await fetchAllPaymentPeriods();
    const period = periods.find((p) => p.id === periodId);

    if (!period || !period.rowNumber) {
      throw new Error('Payment period not found');
    }

    // Calculate new total if fee fields updated
    let totalAmount = period.totalAmount;
    if (
      updates.tuitionFee !== undefined ||
      updates.amalgamatedFund !== undefined ||
      updates.sportsFee !== undefined ||
      updates.cautionMoney !== undefined ||
      updates.transferCertificateFee !== undefined ||
      updates.libraryCardReissueFee !== undefined ||
      updates.penaltyFee !== undefined ||
      updates.otherFees !== undefined ||
      updates.transactionCharges !== undefined
    ) {
      totalAmount =
        (updates.tuitionFee ?? period.tuitionFee) +
        (updates.amalgamatedFund ?? period.amalgamatedFund) +
        (updates.sportsFee ?? period.sportsFee) +
        (updates.cautionMoney ?? period.cautionMoney) +
        (updates.transferCertificateFee ?? period.transferCertificateFee) +
        (updates.libraryCardReissueFee ?? period.libraryCardReissueFee) +
        (updates.penaltyFee ?? period.penaltyFee) +
        (updates.otherFees ?? period.otherFees) +
        (updates.transactionCharges ?? period.transactionCharges);
    }

    const updatedPeriod: PaymentPeriod = {
      ...period,
      ...updates,
      totalAmount,
      updatedBy: updates.updatedBy,
      updatedDate: new Date().toISOString(),
    };

    const sheets = await getSheetsClient();
    const rowObject = periodToRowObject(updatedPeriod);
    const row = await rowObjectToArray(rowObject);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${period.rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    console.error('Error updating payment period:', error);
    throw error;
  }
}
