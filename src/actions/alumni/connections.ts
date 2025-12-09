"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

export interface ConnectionRequest {
    id: string;
    requesterEmail: string;
    requesterName: string;
    receiverEmail: string;
    receiverName: string;
    status: "pending" | "accepted" | "rejected";
    timestamp: string;
    message?: string;
}

export interface Connection {
    id: string;
    userEmail: string;
    connectedEmail: string;
    connectedName: string;
    connectedAt: string;
}

// Send connection request
export async function sendConnectionRequest(data: {
    requesterEmail: string;
    requesterName: string;
    receiverEmail: string;
    receiverName: string;
    message?: string;
}) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Create AlumniConnections sheet if it doesn't exist
        try {
            await sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
                ranges: ["AlumniConnections!A1"],
            });
        } catch (error) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: "AlumniConnections",
                                },
                            },
                        },
                    ],
                },
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "AlumniConnections!A1:G1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [
                        [
                            "ID",
                            "Requester Email",
                            "Requester Name",
                            "Receiver Email",
                            "Receiver Name",
                            "Status",
                            "Timestamp",
                            "Message",
                        ],
                    ],
                },
            });
        }

        // Check if connection already exists or pending
        const existingResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A2:G",
        });

        const existingRows = existingResponse.data.values || [];
        const existingConnection = existingRows.find(
            (row) =>
                (row[1] === data.requesterEmail && row[3] === data.receiverEmail) ||
                (row[1] === data.receiverEmail && row[3] === data.requesterEmail)
        );

        if (existingConnection) {
            const status = existingConnection[5];
            if (status === "accepted") {
                return {
                    success: false,
                    message: "You are already connected with this alumni",
                };
            } else if (status === "pending") {
                return {
                    success: false,
                    message: "Connection request is already pending",
                };
            }
        }

        const id = `CONN-${Date.now()}`;
        const timestamp = new Date().toISOString();
        const row = [
            id,
            data.requesterEmail,
            data.requesterName,
            data.receiverEmail,
            data.receiverName,
            "pending",
            timestamp,
            data.message || "",
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A:H",
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });

        return {
            success: true,
            message: "Connection request sent successfully",
        };
    } catch (error) {
        console.error("Error sending connection request:", error);
        return {
            success: false,
            message: "Failed to send connection request",
        };
    }
}

// Get pending connection requests (received by user)
export async function getPendingRequests(userEmail: string): Promise<ConnectionRequest[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A2:H",
        });

        const rows = response.data.values || [];

        return rows
            .filter((row) => row[3] === userEmail && row[5] === "pending")
            .map((row) => ({
                id: row[0] || "",
                requesterEmail: row[1] || "",
                requesterName: row[2] || "",
                receiverEmail: row[3] || "",
                receiverName: row[4] || "",
                status: "pending" as const,
                timestamp: row[6] || "",
                message: row[7] || "",
            }));
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
    }
}

// Get user's connections (accepted)
export async function getUserConnections(userEmail: string): Promise<Connection[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A2:H",
        });

        const rows = response.data.values || [];

        return rows
            .filter(
                (row) =>
                    row[5] === "accepted" &&
                    (row[1] === userEmail || row[3] === userEmail)
            )
            .map((row) => {
                const isRequester = row[1] === userEmail;
                return {
                    id: row[0] || "",
                    userEmail: userEmail,
                    connectedEmail: isRequester ? row[3] : row[1],
                    connectedName: isRequester ? row[4] : row[2],
                    connectedAt: row[6] || "",
                };
            });
    } catch (error) {
        console.error("Error fetching user connections:", error);
        return [];
    }
}

// Accept/Reject connection request
export async function respondToConnectionRequest(
    requestId: string,
    action: "accepted" | "rejected"
) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A2:H",
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0] === requestId);

        if (rowIndex === -1) {
            return {
                success: false,
                message: "Connection request not found",
            };
        }

        const actualRowNumber = rowIndex + 2; // +2 because array is 0-indexed and sheet starts at row 2

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `AlumniConnections!F${actualRowNumber}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[action]],
            },
        });

        return {
            success: true,
            message: `Connection request ${action}`,
        };
    } catch (error) {
        console.error("Error responding to connection request:", error);
        return {
            success: false,
            message: "Failed to respond to connection request",
        };
    }
}

// Check connection status
export async function checkConnectionStatus(
    userEmail: string,
    otherEmail: string
): Promise<"none" | "pending" | "connected"> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniConnections!A2:H",
        });

        const rows = response.data.values || [];
        const connection = rows.find(
            (row) =>
                (row[1] === userEmail && row[3] === otherEmail) ||
                (row[1] === otherEmail && row[3] === userEmail)
        );

        if (!connection) return "none";

        const status = connection[5];
        if (status === "accepted") return "connected";
        if (status === "pending") return "pending";

        return "none";
    } catch (error) {
        console.error("Error checking connection status:", error);
        return "none";
    }
}
