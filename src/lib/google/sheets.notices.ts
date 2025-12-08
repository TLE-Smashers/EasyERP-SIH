"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const NOTICES_SHEET_NAME = "Notices";

export interface Notice {
  noticeId: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: "Holiday" | "Result" | "Event" | "Exam" | "General";
  priority: "High" | "Medium" | "Low";
  targetAudience: "Students" | "Faculty" | "All";
  publishedBy: string;
  publishedByName: string;
  publishedDate: string;
  expiryDate: string;
  status: "Active" | "Expired";
  createdAt: string;
}

async function getSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_ID not set");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function rowToNotice(row: string[]): Notice {
  return {
    noticeId: row[0] || "",
    title: row[1] || "",
    description: row[2] || "",
    imageUrl: row[3] || undefined,
    category: (row[4] || "General") as Notice["category"],
    priority: (row[5] || "Medium") as Notice["priority"],
    targetAudience: (row[6] || "All") as Notice["targetAudience"],
    publishedBy: row[7] || "",
    publishedByName: row[8] || "",
    publishedDate: row[9] || "",
    expiryDate: row[10] || "",
    status: (row[11] || "Active") as Notice["status"],
    createdAt: row[12] || "",
  };
}

function noticeToRow(notice: Notice): string[] {
  return [
    notice.noticeId,
    notice.title,
    notice.description,
    notice.imageUrl || "",
    notice.category,
    notice.priority,
    notice.targetAudience,
    notice.publishedBy,
    notice.publishedByName,
    notice.publishedDate,
    notice.expiryDate,
    notice.status,
    notice.createdAt,
  ];
}

/**
 * Create a new notice
 */
export async function createNotice(
  noticeData: Omit<Notice, "noticeId" | "createdAt" | "status">
): Promise<{ success: boolean; message: string; noticeId?: string }> {
  try {
    const sheets = await getSheetsClient();

    const noticeId = `NOTICE-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const status = "Active";

    const notice: Notice = {
      ...noticeData,
      noticeId,
      createdAt,
      status,
    };

    const row = noticeToRow(notice);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

    return {
      success: true,
      message: "Notice published successfully",
      noticeId,
    };
  } catch (error) {
    console.error("Error creating notice:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create notice",
    };
  }
}

/**
 * Delete expired notices automatically
 */
async function deleteExpiredNotices(): Promise<void> {
  try {
    const sheets = await getSheetsClient();

    // Get spreadsheet metadata to find the correct sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const noticesSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === NOTICES_SHEET_NAME
    );

    if (!noticesSheet || noticesSheet.properties?.sheetId === undefined) {
      console.error("Notices sheet not found");
      return;
    }

    const sheetId = noticesSheet.properties.sheetId;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    const now = new Date();
    
    // Find all expired notices (check both status and expiry date)
    const expiredIndices: number[] = [];
    rows.forEach((row, index) => {
      const status = row[11] || "Active";
      const expiryDate = new Date(row[10] || "");
      
      if (status === "Expired" || expiryDate < now) {
        expiredIndices.push(index);
      }
    });

    if (expiredIndices.length === 0) {
      return; // No expired notices to delete
    }

    // Delete rows in reverse order to maintain correct indices
    const deleteRequests = expiredIndices.reverse().map((index) => ({
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: "ROWS" as const,
          startIndex: index + 1, // +1 because row 1 is header
          endIndex: index + 2,   // endIndex is exclusive
        },
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: deleteRequests,
      },
    });

    console.log(`Deleted ${expiredIndices.length} expired notice(s)`);
  } catch (error) {
    console.error("Error deleting expired notices:", error);
  }
}

/**
 * Get all active notices
 */
export async function getActiveNotices(
  targetAudience?: "Students" | "Faculty" | "All"
): Promise<{ success: boolean; data?: Notice[]; message?: string }> {
  try {
    // Delete expired notices first
    await deleteExpiredNotices();

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    let notices = rows.map(rowToNotice);

    // Filter by status and expiry
    const now = new Date();
    notices = notices.filter((notice) => {
      if (notice.status !== "Active") return false;
      
      const expiryDate = new Date(notice.expiryDate);
      if (expiryDate < now) return false;

      if (targetAudience && targetAudience !== "All") {
        return notice.targetAudience === targetAudience || notice.targetAudience === "All";
      }

      return true;
    });

    // Sort by priority (High > Medium > Low) and date (newest first)
    notices.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    return {
      success: true,
      data: notices,
    };
  } catch (error) {
    console.error("Error fetching notices:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch notices",
    };
  }
}

/**
 * Get all notices (for admin)
 */
export async function getAllNotices(): Promise<{
  success: boolean;
  data?: Notice[];
  message?: string;
}> {
  try {
    // Delete expired notices first
    await deleteExpiredNotices();

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    const notices = rows.map(rowToNotice);

    // Sort by date (newest first)
    notices.sort((a, b) => {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    return {
      success: true,
      data: notices,
    };
  } catch (error) {
    console.error("Error fetching all notices:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch notices",
    };
  }
}

/**
 * Update notice status (mark as expired)
 */
export async function updateNoticeStatus(
  noticeId: string,
  status: "Active" | "Expired"
): Promise<{ success: boolean; message: string }> {
  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === noticeId);

    if (rowIndex === -1) {
      return {
        success: false,
        message: "Notice not found",
      };
    }

    // Update status (column L, index 11)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!L${rowIndex + 2}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[status]],
      },
    });

    return {
      success: true,
      message: "Notice status updated",
    };
  } catch (error) {
    console.error("Error updating notice status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update notice",
    };
  }
}

/**
 * Delete a notice
 */
export async function deleteNotice(
  noticeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const sheets = await getSheetsClient();

    // First, get the sheet metadata to find the correct sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const noticesSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === NOTICES_SHEET_NAME
    );

    if (!noticesSheet || noticesSheet.properties?.sheetId === undefined) {
      return {
        success: false,
        message: "Notices sheet not found",
      };
    }

    const sheetId = noticesSheet.properties.sheetId;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${NOTICES_SHEET_NAME}!A2:M`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === noticeId);

    if (rowIndex === -1) {
      return {
        success: false,
        message: "Notice not found",
      };
    }

    // Delete the row (rowIndex + 1 because we start from row 2, +1 for header)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex + 1, // +1 because row 1 is header
                endIndex: rowIndex + 2,   // endIndex is exclusive
              },
            },
          },
        ],
      },
    });

    return {
      success: true,
      message: "Notice deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting notice:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete notice",
    };
  }
}
