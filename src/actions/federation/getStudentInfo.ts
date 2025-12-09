"use server";

import { google } from "googleapis";

const SUPER_MASTER_SHEET_ID = process.env.SUPER_MASTER_SHEET_ID;

/**
 * Get authenticated Google Sheets client
 */
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return auth;
}

/**
 * Get institution information from Super Master Sheet
 * Falls back to environment variables if not found
 */
export async function getInstitutionInfo(institutionId?: string): Promise<{
  institutionId: string;
  institutionName: string;
} | null> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // If no ID provided, get from environment
    const targetId = institutionId || process.env.CURRENT_INSTITUTION_ID;
    
    if (!targetId) {
      return {
        institutionId: "LOCAL",
        institutionName: "Local Institution",
      };
    }

    // Get from Super Master Sheet Institutions tab
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: "Institutions!A2:P",
    });

    const rows = response.data.values || [];
    const institution = rows.find((row) => row[0] === targetId);

    if (institution) {
      return {
        institutionId: institution[0],
        institutionName: institution[1],
      };
    }

    // Fallback to environment variables
    return {
      institutionId: process.env.CURRENT_INSTITUTION_ID || "LOCAL",
      institutionName: process.env.CURRENT_INSTITUTION_NAME || "Local Institution",
    };
  } catch (error) {
    console.error("Error getting institution info:", error);
    return {
      institutionId: process.env.CURRENT_INSTITUTION_ID || "LOCAL",
      institutionName: process.env.CURRENT_INSTITUTION_NAME || "Local Institution",
    };
  }
}
