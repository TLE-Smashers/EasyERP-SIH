/**
 * Confirm payment for hostel application and update status
 */
export async function confirmHostelPayment(
  studentId: string
): Promise<boolean> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    // Find the application row
    const appSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_SHEET_NAME}!A2:P`,
    });
    const appRows = appSheetRes.data.values || [];
    const appRowIdx = appRows.findIndex(row => row[1] === studentId);
    if (appRowIdx === -1) {
      console.warn('[DEBUG] No hostel application found for studentId:', studentId);
      return false;
    }
    const applicationRow = appRows[appRowIdx];
    console.log('[DEBUG] applicationRow:', applicationRow);
    const updates = [
      { range: `${HOSTEL_SHEET_NAME}!I${appRowIdx + 2}`, values: [["confirmed"]] }, // status
      { range: `${HOSTEL_SHEET_NAME}!L${appRowIdx + 2}`, values: [["TRUE"]] }, // paymentConfirmed
    ];
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });

    // Debug: Check if payment should be pushed to Payments sheet
    console.log('[DEBUG] Checking if payment should be added to Payments sheet...');
    try {
      const { createPaymentRecord } = await import('./sheets.payment');
      // Build payment object from hostel application row
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const createdDate = timestamp;
      const paymentObj = {
        paymentType: 'hostel' as import('@/types/payment').PaymentType,
        studentInfo: {
          applicationId: applicationRow[1] || '',
          studentId: applicationRow[1] || '',
          studentName: applicationRow[2] || '',
          email: applicationRow[3] || '',
          mobile: applicationRow[4] || '',
          fatherName: '',
          course: '',
          branch: '',
          category: applicationRow[6] || '',
        },
        feeBreakdown: {
          roomFee: 0,
          messFee: 0,
          tuitionFee: 0,
          amalgamatedFund: 0,
          sportsFeeUniversityShare: 0,
          cautionMoney: 0,
          transferCertificateFee: 0,
          libraryCardReissueFee: 0,
          penaltyFee: 0,
          otherFees: 0,
          transactionCharges: 0,
        },
        paymentMethod: 'razorpay' as import('@/types/payment').PaymentMethod,
        createdBy: 'system',
        notes: 'Hostel payment auto-added',
        remarks: '',
        totalAmount: 0,
        amountInWords: '',
        timestamp,
        paymentStatus: 'paid' as import('@/types/payment').PaymentStatus,
        createdDate,
      };
      console.log('[DEBUG] Payment object to push:', paymentObj);
      await createPaymentRecord(paymentObj);
      console.log('[DEBUG] Payment record pushed to Payments sheet');
    } catch (err) {
      console.error('[DEBUG] Error pushing payment to Payments sheet:', err);
    }
    return true;
  } catch (error) {
    console.error("Error confirming hostel payment:", error);
    return false;
  }
}
/**
 * Google Sheets - Hostel Module Helper
 * Handles all Sheet operations for hostel applications and allocations
 */

import { google } from "googleapis";
import { HostelApplication, HostelRoom } from "@/types/hostel";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const HOSTEL_SHEET_NAME = process.env.HOSTEL_SHEET_NAME || "HostelApplications";
const HOSTEL_ROOM_SHEET_NAME = process.env.HOSTEL_ROOM_SHEET_NAME || "HostelRooms";

function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }
  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_ID environment variable is not set");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

function parseHostelApplicationRow(row: any[], rowNumber: number): HostelApplication {
  return {
    timestamp: row[0] || "",
    studentId: row[1] || "",
    fullName: row[2] || "",
    email: row[3] || "",
    contactNumber: row[4] || "",
    gender: row[5] || "",
    category: row[6] || "",
    entrancePercentage: parseFloat(row[7]) || 0,
    status: (row[8] || "pending") as any,
    roomNumber: row[9] || undefined,
    allocationTimestamp: row[10] || undefined,
    paymentConfirmed: row[11] === "TRUE" || row[11] === true,
    // allocationEmailSent and confirmationEmailSent are not part of HostelApplication type
    currentYear: row[14] ? Number(row[14]) : undefined,
    session: row[15] || undefined,
  };
}

/**
 * Column name mapping for hostel applications
 */
export const HOSTEL_COLUMN_MAP = {
  timestamp: 'A',
  studentId: 'B',
  fullName: 'C',
  email: 'D',
  contactNumber: 'E',
  gender: 'F',
  category: 'G',
  entrancePercentage: 'H',
  status: 'I',
  roomNumber: 'J',
  allocationTimestamp: 'K',
  paymentConfirmed: 'L',
};

/**
 * Fetch all hostel applications from the sheet
 */
export async function fetchHostelApplications(): Promise<HostelApplication[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_SHEET_NAME}!A2:P`, // skip header, columns A-P (includes currentYear and session)
    });
    const rows = response.data.values || [];
    console.log('[DEBUG] Raw sheet rows:', rows);
    const applications = rows.map((row, idx) => parseHostelApplicationRow(row, idx + 2));
    console.log('[DEBUG] Parsed applications:', applications);
    return applications;
  } catch (error) {
    console.error("Error fetching hostel applications:", error);
    throw error;
  }
}

/**
 * Fetch all hostel rooms and their occupants
 */
export async function fetchHostelRooms(): Promise<HostelRoom[]> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`, // skip header, columns A-D
    });
    const rows = response.data.values || [];
    // Expected columns: hostel, roomNumber, occupants (comma-separated), maxOccupancy
    return rows.map((row) => ({
      hostel: (row[0] || "male") as "male" | "female",
      roomNumber: row[1] || "",
      occupants: row[2] ? row[2].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      maxOccupancy: row[3] ? parseInt(row[3], 10) : 2,
    }));
  } catch (error) {
    console.error("Error fetching hostel rooms:", error);
    throw error;
  }
}

/**
 * Allocate room to a student (by studentId)
 */
export async function allocateRoom(
  studentId: string,
  gender: "male" | "female"
): Promise<HostelRoom | null> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Normalize gender to lowercase
    const normalizedGender = gender.toLowerCase() as "male" | "female";
    // Fetch all applications and rooms
    const [applications, rooms] = await Promise.all([
      fetchHostelApplications(),
      fetchHostelRooms(),
    ]);

    // Find the student application (case-insensitive studentId)
    const studentApp = applications.find(app => app.studentId.toLowerCase() === studentId.toLowerCase() && app.gender === normalizedGender);
    console.log("[allocateRoom] studentId:", studentId, "gender:", normalizedGender);
    if (!studentApp) {
      console.log("[allocateRoom] No application found for studentId and gender", studentId, gender);
      return null;
    }
    console.log("[allocateRoom] Found application:", studentApp);

    // Only allocate if status is pending or deallocated
    if (studentApp.status !== "pending" && studentApp.status !== "deallocated") {
      console.log("[allocateRoom] Status is not allocatable:", studentApp.status);
      return null;
    }

    // Debug: Show all rooms and their occupancy before allocation
    console.log('[allocateRoom] Available rooms for gender', normalizedGender, rooms.filter(r => r.hostel === normalizedGender));
    rooms.filter(r => r.hostel === normalizedGender).forEach(room => {
      console.log(`[allocateRoom] Room ${room.roomNumber}: occupants=${room.occupants.length}, maxOccupancy=${room.maxOccupancy}, occupantsList=${room.occupants}`);
    });

    // Linearly traverse rooms and allocate to first with available slot
    let roomToAllocate: HostelRoom | null = null;
    let newOccupants: string[] = [];
    for (const room of rooms) {
      if (room.hostel === normalizedGender && room.occupants.length < room.maxOccupancy) {
        roomToAllocate = room;
        newOccupants = [...room.occupants, studentId];
        break;
      }
    }
    if (!roomToAllocate) {
      console.log("[allocateRoom] No available rooms for gender", normalizedGender);
      return null;
    }

    // Find the row number for the room (assuming roomNumber is unique and in col B)
    const roomSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`,
    });
    const roomRows = roomSheetRes.data.values || [];
    const roomRowIdx = roomRows.findIndex(row => row[1] === roomToAllocate.roomNumber);
    if (roomRowIdx === -1) return null;
    const updateRoomRange = `${HOSTEL_ROOM_SHEET_NAME}!C${roomRowIdx + 2}`; // Occupants col C

    // Find the application row
    const appSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_SHEET_NAME}!A2:P`,
    });
    const appRows = appSheetRes.data.values || [];
    const appRowIdx = appRows.findIndex(row => row[1] === studentId);
    if (appRowIdx === -1) return null;
    const now = new Date().toISOString();

    // Atomically update both room occupants and application row
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: updateRoomRange, values: [[newOccupants.join(",")]] },
          { range: `${HOSTEL_SHEET_NAME}!J${appRowIdx + 2}`, values: [[roomToAllocate.roomNumber]] },
          { range: `${HOSTEL_SHEET_NAME}!I${appRowIdx + 2}`, values: [["allocated"]] },
          { range: `${HOSTEL_SHEET_NAME}!K${appRowIdx + 2}`, values: [[now]] },
        ],
      },
    });

    // Return the updated room
    return { ...roomToAllocate, occupants: newOccupants };
  } catch (error) {
    console.error("Error allocating hostel room:", error);
    return null;
  }
}


/**
 * Deallocate a room from a student
 */
export async function deallocateRoom(studentId: string): Promise<boolean> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Fetch applications and rooms
    const [applications, rooms] = await Promise.all([
      fetchHostelApplications(),
      fetchHostelRooms(),
    ]);

    // Find the student's application
    const app = applications.find(a => a.studentId === studentId);
    if (!app || !app.roomNumber) return false;

    // Find the room
    const room = rooms.find(r => r.roomNumber === app.roomNumber);
    if (!room) return false;

    // Remove student from occupants and filter out empty strings
    const newOccupants = room.occupants.filter(id => id !== studentId).map(id => id.trim()).filter(Boolean);

    // Update the room in the sheet
    const roomSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`,
    });
    const roomRows = roomSheetRes.data.values || [];
    const roomRowIdx = roomRows.findIndex(row => row[1] === room.roomNumber);
    if (roomRowIdx === -1) return false;
    const updateRoomRange = `${HOSTEL_ROOM_SHEET_NAME}!C${roomRowIdx + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRoomRange,
      valueInputOption: "RAW",
      requestBody: { values: [[newOccupants.length > 0 ? newOccupants.join(",") : ""]] },
    });

    // Update the application: remove room, set status to 'deallocated', clear allocationTimestamp
    const appSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_SHEET_NAME}!A2:P`,
    });
    const appRows = appSheetRes.data.values || [];
    const appRowIdx = appRows.findIndex(row => row[1] === studentId);
    if (appRowIdx === -1) return false;
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: `${HOSTEL_SHEET_NAME}!J${appRowIdx + 2}`, values: [[""]] }, // roomNumber
          { range: `${HOSTEL_SHEET_NAME}!I${appRowIdx + 2}`, values: [["deallocated"]] }, // status
          { range: `${HOSTEL_SHEET_NAME}!K${appRowIdx + 2}`, values: [[""]] }, // allocationTimestamp
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deallocating hostel room:", error);
    return false;
  }
}

/**
 * Update hostel application status
 */
export async function updateHostelApplicationStatus(
  studentId: string,
  status: string,
  roomNumber?: string
): Promise<boolean> {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: auth as any });
    // Find the application row
    const appSheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${HOSTEL_SHEET_NAME}!A2:P`,
    });
    const appRows = appSheetRes.data.values || [];
    const appRowIdx = appRows.findIndex(row => row[1] === studentId);
    if (appRowIdx === -1) return false;
    const updates = [
      { range: `${HOSTEL_SHEET_NAME}!I${appRowIdx + 2}`, values: [[status]] },
    ];
    if (roomNumber !== undefined) {
      updates.push({ range: `${HOSTEL_SHEET_NAME}!J${appRowIdx + 2}`, values: [[roomNumber]] });
    }
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: "RAW",
        data: updates,
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating hostel application status:", error);
    return false;
  }
}
