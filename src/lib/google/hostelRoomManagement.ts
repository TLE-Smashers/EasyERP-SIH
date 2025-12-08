/**
 * Hostel Room Management Functions
 * Handles CRUD operations for hostel rooms in Google Sheets
 */

import { google } from "googleapis";
import { HostelRoom } from "@/types/hostel";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
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

/**
 * Add a new hostel room to the sheet
 */
export async function addHostelRoom(
    hostel: "male" | "female",
    roomNumber: string,
    maxOccupancy: number = 2
): Promise<boolean> {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: "v4", auth: auth as any });

        // Check if room number already exists
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`,
        });
        const rows = response.data.values || [];
        const existingRoom = rows.find(row => row[1] === roomNumber);

        if (existingRoom) {
            throw new Error(`Room ${roomNumber} already exists`);
        }

        // Add new room
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${HOSTEL_ROOM_SHEET_NAME}!A:D`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[hostel, roomNumber, "", maxOccupancy]],
            },
        });

        return true;
    } catch (error) {
        console.error("Error adding hostel room:", error);
        throw error;
    }
}

/**
 * Update an existing hostel room
 */
export async function updateHostelRoom(
    oldRoomNumber: string,
    newRoomNumber: string,
    hostel: "male" | "female",
    maxOccupancy: number
): Promise<boolean> {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: "v4", auth: auth as any });

        // Find the room
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`,
        });
        const rows = response.data.values || [];
        const roomRowIdx = rows.findIndex(row => row[1] === oldRoomNumber);

        if (roomRowIdx === -1) {
            throw new Error(`Room ${oldRoomNumber} not found`);
        }

        // Check if new room number conflicts with existing rooms (if room number is being changed)
        if (oldRoomNumber !== newRoomNumber) {
            const existingRoom = rows.find(row => row[1] === newRoomNumber);
            if (existingRoom) {
                throw new Error(`Room ${newRoomNumber} already exists`);
            }
        }

        // Get current occupants
        const currentOccupants = rows[roomRowIdx][2] || "";

        // Update the room
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${HOSTEL_ROOM_SHEET_NAME}!A${roomRowIdx + 2}:D${roomRowIdx + 2}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[hostel, newRoomNumber, currentOccupants, maxOccupancy]],
            },
        });

        // If room number changed, update all applications with this room number
        if (oldRoomNumber !== newRoomNumber) {
            const HOSTEL_SHEET_NAME = process.env.HOSTEL_SHEET_NAME || "HostelApplications";
            const appResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${HOSTEL_SHEET_NAME}!A2:P`,
            });
            const appRows = appResponse.data.values || [];
            const updates: Array<{ range: string; values: string[][] }> = [];

            appRows.forEach((row, idx) => {
                if (row[9] === oldRoomNumber) { // Column J (index 9) is roomNumber
                    updates.push({
                        range: `${HOSTEL_SHEET_NAME}!J${idx + 2}`,
                        values: [[newRoomNumber]],
                    });
                }
            });

            if (updates.length > 0) {
                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    requestBody: {
                        valueInputOption: "RAW",
                        data: updates,
                    },
                });
            }
        }

        return true;
    } catch (error) {
        console.error("Error updating hostel room:", error);
        throw error;
    }
}

/**
 * Delete a hostel room
 */
export async function deleteHostelRoom(roomNumber: string): Promise<boolean> {
    try {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: "v4", auth: auth as any });

        // Find the room
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${HOSTEL_ROOM_SHEET_NAME}!A2:D`,
        });
        const rows = response.data.values || [];
        const roomRowIdx = rows.findIndex(row => row[1] === roomNumber);

        if (roomRowIdx === -1) {
            throw new Error(`Room ${roomNumber} not found`);
        }

        // Check if room has occupants
        const occupants = rows[roomRowIdx][2] || "";
        if (occupants.trim()) {
            throw new Error(`Cannot delete room ${roomNumber} - it has occupants. Deallocate students first.`);
        }

        // Get the spreadsheet to delete the row
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        // Find the sheet ID
        const sheet = spreadsheet.data.sheets?.find(
            s => s.properties?.title === HOSTEL_ROOM_SHEET_NAME
        );

        if (!sheet || !sheet.properties?.sheetId) {
            throw new Error(`Sheet ${HOSTEL_ROOM_SHEET_NAME} not found`);
        }

        // Delete the row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties.sheetId,
                                dimension: "ROWS",
                                startIndex: roomRowIdx + 1, // +1 because header is row 0
                                endIndex: roomRowIdx + 2,
                            },
                        },
                    },
                ],
            },
        });

        return true;
    } catch (error) {
        console.error("Error deleting hostel room:", error);
        throw error;
    }
}
