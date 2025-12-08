import { google } from 'googleapis';

/**
 * Google Sheets API Utility
 * Handles all interactions with Google Sheets as the database backend
 * Following SOLID principles - Single Responsibility
 */

// Initialize Google Sheets API client
const getGoogleSheetsClient = () => {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

export interface SheetRow {
  [key: string]: string | number | boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetches data from a Google Sheet range
 * @param sheetId - The Google Sheet ID
 * @param range - The A1 notation range (e.g., "Users!A:G")
 * @returns Array of objects with column headers as keys
 */
export async function getSheetData(
  sheetId: string,
  range: string
): Promise<SheetRow[]> {
  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // First row is headers
    const headers = rows[0] as string[];
    const data = rows.slice(1);

    // Convert to array of objects
    return data.map((row) => {
      const obj: SheetRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
}

/**
 * Updates a specific cell or range in Google Sheets
 * @param sheetId - The Google Sheet ID
 * @param range - The A1 notation range
 * @param values - 2D array of values to update
 */
export async function updateSheetRow(
  sheetId: string,
  range: string,
  values: any[][]
): Promise<ApiResponse> {
  try {
    const sheets = getGoogleSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating sheet:', error);
    return {
      success: false,
      error: 'Failed to update Google Sheet',
    };
  }
}

/**
 * Appends a new row to the Google Sheet
 * @param sheetId - The Google Sheet ID
 * @param range - The A1 notation range (sheet name)
 * @param values - 2D array of values to append
 */
export async function appendSheetRow(
  sheetId: string,
  range: string,
  values: any[][]
): Promise<ApiResponse> {
  try {
    const sheets = getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return { success: true };
  } catch (error) {
    console.error('Error appending to sheet:', error);
    return {
      success: false,
      error: 'Failed to append to Google Sheet',
    };
  }
}

/**
 * Batch update multiple ranges in Google Sheets
 * @param sheetId - The Google Sheet ID
 * @param updates - Array of {range, values} objects
 */
export async function batchUpdateSheet(
  sheetId: string,
  updates: { range: string; values: any[][] }[]
): Promise<ApiResponse> {
  try {
    const sheets = getGoogleSheetsClient();
    const data = updates.map((update) => ({
      range: update.range,
      values: update.values,
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error batch updating sheet:', error);
    return {
      success: false,
      error: 'Failed to batch update Google Sheet',
    };
  }
}
