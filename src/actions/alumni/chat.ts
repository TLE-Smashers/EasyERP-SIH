"use server";

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

export interface ChatMessage {
    id: string;
    senderEmail: string;
    senderName: string;
    receiverEmail: string;
    receiverName: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// Send a message
export async function sendMessage(data: {
    senderEmail: string;
    senderName: string;
    receiverEmail: string;
    receiverName: string;
    message: string;
}) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Create AlumniMessages sheet if it doesn't exist
        try {
            await sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
                ranges: ["AlumniMessages!A1"],
            });
        } catch (error) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: "AlumniMessages",
                                },
                            },
                        },
                    ],
                },
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "AlumniMessages!A1:H1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [
                        [
                            "ID",
                            "Sender Email",
                            "Sender Name",
                            "Receiver Email",
                            "Receiver Name",
                            "Message",
                            "Timestamp",
                            "Read",
                        ],
                    ],
                },
            });
        }

        const id = `MSG-${Date.now()}`;
        const timestamp = new Date().toISOString();
        const row = [
            id,
            data.senderEmail,
            data.senderName,
            data.receiverEmail,
            data.receiverName,
            data.message,
            timestamp,
            "false",
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniMessages!A:H",
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

// Get messages between two users
export async function getMessages(
    userEmail: string,
    otherEmail: string
): Promise<ChatMessage[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniMessages!A2:H",
        });

        const rows = response.data.values || [];

        return rows
            .filter(
                (row) =>
                    (row[1] === userEmail && row[3] === otherEmail) ||
                    (row[1] === otherEmail && row[3] === userEmail)
            )
            .map((row) => ({
                id: row[0] || "",
                senderEmail: row[1] || "",
                senderName: row[2] || "",
                receiverEmail: row[3] || "",
                receiverName: row[4] || "",
                message: row[5] || "",
                timestamp: row[6] || "",
                read: row[7] === "true",
            }))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

// Get chat list (all users the current user has chatted with)
export async function getChatList(userEmail: string): Promise<{
    email: string;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniMessages!A2:H",
        });

        const rows = response.data.values || [];
        const userMessages = rows.filter(
            (row) => row[1] === userEmail || row[3] === userEmail
        );

        // Group messages by conversation partner
        const conversationMap = new Map<string, any>();

        userMessages.forEach((row) => {
            const otherEmail = row[1] === userEmail ? row[3] : row[1];
            const otherName = row[1] === userEmail ? row[4] : row[2];
            const timestamp = new Date(row[6] || "");
            const isUnread = row[3] === userEmail && row[7] === "false";

            if (!conversationMap.has(otherEmail)) {
                conversationMap.set(otherEmail, {
                    email: otherEmail,
                    name: otherName,
                    lastMessage: row[5],
                    lastMessageTime: row[6],
                    unreadCount: isUnread ? 1 : 0,
                });
            } else {
                const existing = conversationMap.get(otherEmail);
                const existingTime = new Date(existing.lastMessageTime);

                if (timestamp > existingTime) {
                    existing.lastMessage = row[5];
                    existing.lastMessageTime = row[6];
                }

                if (isUnread) {
                    existing.unreadCount++;
                }
            }
        });

        return Array.from(conversationMap.values()).sort(
            (a, b) =>
                new Date(b.lastMessageTime).getTime() -
                new Date(a.lastMessageTime).getTime()
        );
    } catch (error) {
        console.error("Error fetching chat list:", error);
        return [];
    }
}

// Mark messages as read
export async function markMessagesAsRead(
    userEmail: string,
    otherEmail: string
) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniMessages!A2:H",
        });

        const rows = response.data.values || [];

        // Find all unread messages from otherEmail to userEmail
        const updates: any[] = [];
        rows.forEach((row, index) => {
            if (
                row[1] === otherEmail &&
                row[3] === userEmail &&
                row[7] === "false"
            ) {
                const actualRowNumber = index + 2;
                updates.push({
                    range: `AlumniMessages!H${actualRowNumber}`,
                    values: [["true"]],
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

// Get unread message count
export async function getUnreadMessageCount(userEmail: string): Promise<number> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniMessages!A2:H",
        });

        const rows = response.data.values || [];

        return rows.filter(
            (row) => row[3] === userEmail && row[7] === "false"
        ).length;
    } catch (error) {
        console.error("Error getting unread count:", error);
        return 0;
    }
}
