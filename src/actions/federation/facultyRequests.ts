"use server";

import { google } from "googleapis";
import {
  FacultyRequest,
  FacultyRequestMessage,
  RequestStatus,
} from "@/types/facultyRequest";

/**
 * ARCHITECTURE:
 * - Faculty data: Stored in Super Master Sheet (for cross-institution discovery)
 * - Faculty_Requests: Stored in FACULTY'S institution sheet (where faculty can see them)
 * - Faculty_Request_Messages: Stored in FACULTY'S institution sheet
 * 
 * Flow: Student -> Query Faculty from Super Master -> Store Request in Faculty's Institution Sheet
 */
const SUPER_MASTER_SHEET_ID = process.env.SUPER_MASTER_SHEET_ID;
const FACULTY_REQUESTS_SHEET = "Faculty_Requests";
const FACULTY_REQUEST_MESSAGES_SHEET = "Faculty_Request_Messages";

/**
 * Get faculty's institution sheet ID directly from Faculty tab (Column D is the spreadsheet ID)
 */
async function getFacultySheetId(facultyEmail: string): Promise<{ sheetId: string; institutionName: string } | null> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // Query Faculty sheet in Super Master to find faculty by email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: "Faculty!A2:I",
    });

    const rows = response.data.values || [];
    console.log("Searching for faculty email:", facultyEmail);
    
    // Find faculty by email (Column C)
    const facultyRow = rows.find((row) => row[2]?.toLowerCase() === facultyEmail.toLowerCase());
    
    if (!facultyRow) {
      console.error("Faculty not found in Super Master Sheet:", facultyEmail);
      return null;
    }

    const sheetId = facultyRow[3]; // Column D is the spreadsheet ID
    const institutionName = facultyRow[4]; // Column E is institution name

    console.log("Found faculty sheet ID:", { sheetId, institutionName });

    return { sheetId, institutionName };
  } catch (error) {
    console.error("Error getting faculty sheet ID:", error);
    return null;
  }
}

/**
 * Get the current user's institution sheet ID (for reading requests)
 */
function getCurrentInstitutionSheetId(): string {
  return process.env.GOOGLE_SHEETS_ID!;
}

/**
 * Get authenticated Google Sheets client
 */
async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

/**
 * Initialize Faculty Requests sheet if it doesn't exist
 */
async function initializeFacultyRequestsSheet(institutionSheetId: string) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // Check if sheet exists
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: institutionSheetId,
        ranges: [`${FACULTY_REQUESTS_SHEET}!A1`],
      });
    } catch (error) {
      // Create sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: institutionSheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: FACULTY_REQUESTS_SHEET,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: institutionSheetId,
        range: `${FACULTY_REQUESTS_SHEET}!A1:R1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Request ID",
              "Student Email",
              "Student Name",
              "Student Institution ID",
              "Student Institution Name",
              "Faculty Email",
              "Faculty Name",
              "Faculty Institution ID",
              "Faculty Institution Name",
              "Subject",
              "Topic",
              "Description",
              "Preferred Date",
              "Preferred Time",
              "Duration (mins)",
              "Status",
              "Meet Link",
              "Created At",
              "Updated At",
              "Response Message",
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error initializing Faculty Requests sheet:", error);
  }
}

/**
 * Initialize Faculty Request Messages sheet if it doesn't exist
 */
async function initializeFacultyRequestMessagesSheet(institutionSheetId: string) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // Check if sheet exists
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: institutionSheetId,
        ranges: [`${FACULTY_REQUEST_MESSAGES_SHEET}!A1`],
      });
    } catch (error) {
      // Create sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: institutionSheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: FACULTY_REQUEST_MESSAGES_SHEET,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: institutionSheetId,
        range: `${FACULTY_REQUEST_MESSAGES_SHEET}!A1:G1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Message ID",
              "Request ID",
              "Sender Email",
              "Sender Name",
              "Sender Type",
              "Message",
              "Timestamp",
              "Read",
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error initializing Faculty Request Messages sheet:", error);
  }
}

/**
 * Create a new faculty request
 */
export async function createFacultyRequest(data: {
  studentEmail: string;
  studentName: string;
  studentInstitutionId: string;
  studentInstitutionName: string;
  facultyEmail: string;
  facultyName: string;
  facultyInstitutionId: string;
  facultyInstitutionName: string;
  subject: string;
  topic: string;
  description: string;
  preferredDate?: string;
  preferredTime?: string;
  duration?: string;
}) {
  try {
    // Get faculty's spreadsheet ID directly by querying faculty email in Super Master Sheet
    const facultyInfo = await getFacultySheetId(data.facultyEmail);
    
    // Get student's institution sheet ID from environment (current logged-in institution)
    const studentSheetId = getCurrentInstitutionSheetId();
    
    if (!facultyInfo) {
      console.error("Faculty not found. Email:", data.facultyEmail);
      return {
        success: false,
        message: `Faculty not found. Please ensure faculty email (${data.facultyEmail}) exists in Super Master Sheet > Faculty tab with valid spreadsheet ID in Column D.`,
      };
    }

    const facultySheetId = facultyInfo.sheetId;

    // Initialize Faculty_Requests sheet in faculty's institution
    await initializeFacultyRequestsSheet(facultySheetId);
    
    // Also initialize in student's institution if different
    if (studentSheetId !== facultySheetId) {
      await initializeFacultyRequestsSheet(studentSheetId);
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const requestId = `REQ-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const row = [
      requestId,
      data.studentEmail,
      data.studentName,
      data.studentInstitutionId,
      data.studentInstitutionName,
      data.facultyEmail,
      data.facultyName,
      facultySheetId, // Faculty's spreadsheet ID
      facultyInfo.institutionName,
      data.subject,
      data.topic,
      data.description,
      data.preferredDate || "",
      data.preferredTime || "",
      data.duration || "",
      RequestStatus.PENDING,
      "", // Meet Link
      timestamp,
      "", // Updated At
      "", // Response Message
    ];

    // Store request in faculty's institution sheet (primary location)
    await sheets.spreadsheets.values.append({
      spreadsheetId: facultySheetId,
      range: `${FACULTY_REQUESTS_SHEET}!A:T`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    // Also store in student's institution sheet if different (for student visibility)
    if (studentSheetId !== facultySheetId) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: studentSheetId,
        range: `${FACULTY_REQUESTS_SHEET}!A:T`,
        valueInputOption: "RAW",
        requestBody: {
          values: [row],
        },
      });
    }

    return {
      success: true,
      message: "Faculty request created successfully",
      requestId,
    };
  } catch (error) {
    console.error("Error creating faculty request:", error);
    return {
      success: false,
      message: "Failed to create faculty request",
    };
  }
}

/**
 * Get all faculty requests for a user (student or faculty)
 * Reads from the current logged-in user's institution sheet
 */
export async function getFacultyRequests(
  userEmail: string,
  userType: "student" | "faculty"
): Promise<FacultyRequest[]> {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    await initializeFacultyRequestsSheet(institutionSheetId);

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUESTS_SHEET}!A2:T`,
    });

    const rows = response.data.values || [];

    const requests = rows
      .map((row, index) => ({
        requestId: row[0] || "",
        studentEmail: row[1] || "",
        studentName: row[2] || "",
        studentInstitutionId: row[3] || "",
        studentInstitutionName: row[4] || "",
        facultyEmail: row[5] || "",
        facultyName: row[6] || "",
        facultyInstitutionId: row[7] || "",
        facultyInstitutionName: row[8] || "",
        subject: row[9] || "",
        topic: row[10] || "",
        description: row[11] || "",
        preferredDate: row[12] || "",
        preferredTime: row[13] || "",
        duration: row[14] || "",
        status: (row[15] || RequestStatus.PENDING) as RequestStatus,
        meetLink: row[16] || undefined,
        createdAt: row[17] || "",
        updatedAt: row[18] || undefined,
        responseMessage: row[19] || undefined,
        unreadCount: 0, // Will be calculated separately
        rowNumber: index + 2,
      }))
      .filter((request) => {
        if (userType === "student") {
          return request.studentEmail === userEmail;
        } else {
          return request.facultyEmail === userEmail;
        }
      });

    // Get unread message counts
    for (const request of requests) {
      const unreadCount = await getUnreadMessageCount(request.requestId, userEmail);
      request.unreadCount = unreadCount;
    }

    return requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching faculty requests:", error);
    return [];
  }
}

/**
 * Get a single faculty request by ID
 */
export async function getFacultyRequestById(
  requestId: string
): Promise<FacultyRequest | null> {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    await initializeFacultyRequestsSheet(institutionSheetId);

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUESTS_SHEET}!A2:T`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === requestId);

    if (rowIndex === -1) {
      return null;
    }

    const row = rows[rowIndex];
    return {
      requestId: row[0] || "",
      studentEmail: row[1] || "",
      studentName: row[2] || "",
      studentInstitutionId: row[3] || "",
      studentInstitutionName: row[4] || "",
      facultyEmail: row[5] || "",
      facultyName: row[6] || "",
      facultyInstitutionId: row[7] || "",
      facultyInstitutionName: row[8] || "",
      subject: row[9] || "",
      topic: row[10] || "",
      description: row[11] || "",
      preferredDate: row[12] || "",
      preferredTime: row[13] || "",
      duration: row[14] || "",
      status: (row[15] || RequestStatus.PENDING) as RequestStatus,
      meetLink: row[16] || undefined,
      createdAt: row[17] || "",
      updatedAt: row[18] || undefined,
      responseMessage: row[19] || undefined,
      unreadCount: 0,
      rowNumber: rowIndex + 2,
    };
  } catch (error) {
    console.error("Error fetching faculty request:", error);
    return null;
  }
}

/**
 * Update faculty request status (accept, reject, complete, cancel)
 */
export async function updateFacultyRequestStatus(
  requestId: string,
  status: RequestStatus,
  responseMessage?: string,
  meetLink?: string,
  preferredDate?: string,
  preferredTime?: string,
  duration?: string
) {
  try {
    const request = await getFacultyRequestById(requestId);
    if (!request || !request.rowNumber) {
      return {
        success: false,
        message: "Request not found",
      };
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });
    const institutionSheetId = getCurrentInstitutionSheetId();

    const timestamp = new Date().toISOString();
    const updates: any[] = [
      {
        range: `${FACULTY_REQUESTS_SHEET}!P${request.rowNumber}`,
        values: [[status]],
      },
      {
        range: `${FACULTY_REQUESTS_SHEET}!S${request.rowNumber}`,
        values: [[timestamp]],
      },
    ];

    if (responseMessage) {
      updates.push({
        range: `${FACULTY_REQUESTS_SHEET}!T${request.rowNumber}`,
        values: [[responseMessage]],
      });
    }

    if (meetLink) {
      updates.push({
        range: `${FACULTY_REQUESTS_SHEET}!Q${request.rowNumber}`,
        values: [[meetLink]],
      });
    }

    if (preferredDate) {
      updates.push({
        range: `${FACULTY_REQUESTS_SHEET}!M${request.rowNumber}`,
        values: [[preferredDate]],
      });
    }

    if (preferredTime) {
      updates.push({
        range: `${FACULTY_REQUESTS_SHEET}!N${request.rowNumber}`,
        values: [[preferredTime]],
      });
    }

    if (duration) {
      updates.push({
        range: `${FACULTY_REQUESTS_SHEET}!O${request.rowNumber}`,
        values: [[duration]],
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: institutionSheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    return {
      success: true,
      message: `Request ${status} successfully`,
    };
  } catch (error) {
    console.error("Error updating faculty request:", error);
    return {
      success: false,
      message: "Failed to update request status",
    };
  }
}

/**
 * Send a message in a faculty request chat
 */
export async function sendFacultyRequestMessage(data: {
  requestId: string;
  senderEmail: string;
  senderName: string;
  senderType: "student" | "faculty";
  message: string;
}) {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    await initializeFacultyRequestMessagesSheet(institutionSheetId);

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const messageId = `MSG-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const row = [
      messageId,
      data.requestId,
      data.senderEmail,
      data.senderName,
      data.senderType,
      data.message,
      timestamp,
      "false", // Read status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUEST_MESSAGES_SHEET}!A:H`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return {
      success: true,
      message: "Message sent successfully",
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: "Failed to send message",
    };
  }
}

/**
 * Get all messages for a faculty request
 */
export async function getFacultyRequestMessages(
  requestId: string
): Promise<FacultyRequestMessage[]> {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    await initializeFacultyRequestMessagesSheet(institutionSheetId);

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUEST_MESSAGES_SHEET}!A2:H`,
    });

    const rows = response.data.values || [];

    return rows
      .filter((row) => row[1] === requestId)
      .map((row, index) => ({
        messageId: row[0] || "",
        requestId: row[1] || "",
        senderEmail: row[2] || "",
        senderName: row[3] || "",
        senderType: (row[4] || "student") as "student" | "faculty",
        message: row[5] || "",
        timestamp: row[6] || "",
        read: row[7] === "true",
        rowNumber: rows.findIndex((r) => r[0] === row[0]) + 2,
      }))
      .sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Mark messages as read
 */
export async function markFacultyRequestMessagesAsRead(
  requestId: string,
  userEmail: string
) {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUEST_MESSAGES_SHEET}!A2:H`,
    });

    const rows = response.data.values || [];

    // Find all unread messages for this request where user is NOT the sender
    const updates: any[] = [];
    rows.forEach((row, index) => {
      if (
        row[1] === requestId &&
        row[2] !== userEmail &&
        row[7] === "false"
      ) {
        const actualRowNumber = index + 2;
        updates.push({
          range: `${FACULTY_REQUEST_MESSAGES_SHEET}!H${actualRowNumber}`,
          values: [["true"]],
        });
      }
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: institutionSheetId,
        requestBody: {
          valueInputOption: "RAW",
          data: updates,
        },
      });
    }

    return {
      success: true,
      message: "Messages marked as read",
    };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      message: "Failed to mark messages as read",
    };
  }
}

/**
 * Get unread message count for a request
 */
async function getUnreadMessageCount(
  requestId: string,
  userEmail: string
): Promise<number> {
  try {
    const institutionSheetId = getCurrentInstitutionSheetId();
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: institutionSheetId,
      range: `${FACULTY_REQUEST_MESSAGES_SHEET}!A2:H`,
    });

    const rows = response.data.values || [];

    return rows.filter(
      (row) =>
        row[1] === requestId &&
        row[2] !== userEmail &&
        row[7] === "false"
    ).length;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
