/**
 * Setup Script for Leave Management System
 * Creates required sheets and initializes headers in Google Sheets
 */

import { google } from "googleapis";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_LEAVE_SHEET_ID;

async function getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

async function setupLeaveManagement() {
    try {
        console.log("🚀 Setting up Leave Management System...\n");

        if (!SPREADSHEET_ID) {
            throw new Error("NEXT_PUBLIC_LEAVE_SHEET_ID not found in environment variables");
        }

        const sheets = await getSheetsClient();

        // Check existing sheets
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];
        console.log("📋 Existing sheets:", existingSheets.join(", "));

        // Create LeaveRequests sheet if it doesn't exist
        if (!existingSheets.includes("LeaveRequests")) {
            console.log("\n📝 Creating LeaveRequests sheet...");
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: "LeaveRequests",
                                },
                            },
                        },
                    ],
                },
            });

            // Add headers
            const leaveHeaders = [
                "ID",
                "Faculty ID",
                "Faculty Name",
                "Employee ID",
                "Department",
                "Leave Type",
                "Start Date",
                "End Date",
                "Duration",
                "Total Days",
                "Reason",
                "Status",
                "Applied On",
                "Approved By",
                "Approved On",
                "Rejection Reason",
                "Supporting Document",
                "Timestamp",
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "LeaveRequests!A1:R1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [leaveHeaders],
                },
            });

            // Format header row
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: (await getSheetId(sheets, SPREADSHEET_ID!, "LeaveRequests")),
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
                                        textFormat: {
                                            foregroundColor: { red: 1, green: 1, blue: 1 },
                                            fontSize: 11,
                                            bold: true,
                                        },
                                        horizontalAlignment: "CENTER",
                                    },
                                },
                                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
                            },
                        },
                    ],
                },
            });

            console.log("✅ LeaveRequests sheet created with headers");
        } else {
            console.log("✅ LeaveRequests sheet already exists");
        }

        // Create LeaveBalance sheet if it doesn't exist
        if (!existingSheets.includes("LeaveBalance")) {
            console.log("\n📝 Creating LeaveBalance sheet...");
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: "LeaveBalance",
                                },
                            },
                        },
                    ],
                },
            });

            // Add headers
            const balanceHeaders = [
                "Faculty ID",
                "Employee ID",
                "Academic Year",
                "Casual Allocated",
                "Casual Used",
                "Casual Remaining",
                "Sick Allocated",
                "Sick Used",
                "Sick Remaining",
                "Earned Allocated",
                "Earned Used",
                "Earned Remaining",
                "Total Allocated",
                "Total Used",
                "Total Remaining",
                "Last Updated",
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "LeaveBalance!A1:P1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [balanceHeaders],
                },
            });

            // Format header row
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: (await getSheetId(sheets, SPREADSHEET_ID!, "LeaveBalance")),
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.2, green: 0.8, blue: 0.6 },
                                        textFormat: {
                                            foregroundColor: { red: 1, green: 1, blue: 1 },
                                            fontSize: 11,
                                            bold: true,
                                        },
                                        horizontalAlignment: "CENTER",
                                    },
                                },
                                fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
                            },
                        },
                    ],
                },
            });

            console.log("✅ LeaveBalance sheet created with headers");
        } else {
            console.log("✅ LeaveBalance sheet already exists");
        }

        console.log("\n✅ Leave Management System setup completed!");
        console.log("\n📊 Sheet Structure:");
        console.log("  - LeaveRequests: 18 columns (A-R)");
        console.log("  - LeaveBalance: 16 columns (A-P)");
        console.log("\n🔗 Access your spreadsheet at:");
        console.log(`   https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
    } catch (error) {
        console.error("❌ Error setting up leave management:", error);
        throw error;
    }
}

async function getSheetId(
    sheets: any,
    spreadsheetId: string,
    sheetName: string
): Promise<number> {
    const response = await sheets.spreadsheets.get({
        spreadsheetId,
    });

    const sheet = response.data.sheets?.find(
        (s: any) => s.properties?.title === sheetName
    );

    return sheet?.properties?.sheetId || 0;
}

// Run the setup
setupLeaveManagement()
    .then(() => {
        console.log("\n🎉 Setup completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Setup failed:", error.message);
        process.exit(1);
    });
