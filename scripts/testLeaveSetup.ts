/**
 * Test Script for Leave Management Setup
 * Checks if the Google Sheets are properly configured
 */

import { google } from "googleapis";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testLeaveSetup() {
    console.log("🔍 Testing Leave Management Setup...\n");

    // Check environment variables
    console.log("1. Checking Environment Variables:");
    const spreadsheetId = process.env.NEXT_PUBLIC_LEAVE_SHEET_ID || process.env.GOOGLE_SHEETS_ID;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    console.log(`   ✓ Spreadsheet ID: ${spreadsheetId ? spreadsheetId.substring(0, 20) + "..." : "❌ MISSING"}`);
    console.log(`   ✓ Client Email: ${clientEmail ? "✓ Found" : "❌ MISSING"}`);
    console.log(`   ✓ Private Key: ${privateKey ? "✓ Found" : "❌ MISSING"}`);

    if (!spreadsheetId || !clientEmail || !privateKey) {
        console.log("\n❌ Missing required environment variables!");
        console.log("Please check your .env.local file.");
        return;
    }

    // Test Google Sheets connection
    console.log("\n2. Testing Google Sheets Connection:");
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Get spreadsheet info
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        console.log(`   ✓ Connected to: "${spreadsheet.data.properties?.title}"`);

        // Check for required sheets
        console.log("\n3. Checking Required Sheets:");
        const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

        const hasLeaveRequests = existingSheets.includes("LeaveRequests");
        const hasLeaveBalance = existingSheets.includes("LeaveBalance");

        console.log(`   ${hasLeaveRequests ? "✓" : "❌"} LeaveRequests sheet ${hasLeaveRequests ? "exists" : "NOT FOUND"}`);
        console.log(`   ${hasLeaveBalance ? "✓" : "❌"} LeaveBalance sheet ${hasLeaveBalance ? "exists" : "NOT FOUND"}`);

        if (!hasLeaveRequests || !hasLeaveBalance) {
            console.log("\n⚠️  Missing required sheets!");
            console.log("   Please run: pnpm run setup:leave");
            return;
        }

        // Test read access to LeaveRequests
        console.log("\n4. Testing Read Access:");
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "LeaveRequests!A1:R1",
            });
            console.log(`   ✓ Can read from LeaveRequests sheet`);
            console.log(`   ✓ Header row has ${response.data.values?.[0]?.length || 0} columns`);
        } catch (error: any) {
            console.log(`   ❌ Cannot read from LeaveRequests: ${error.message}`);
        }

        // Test write access
        console.log("\n5. Testing Write Access:");
        try {
            const testRow = [
                "TEST_ID",
                "test@faculty.com",
                "Test Faculty",
                "EMP001",
                "Test Dept",
                "casual",
                "2025-12-10",
                "2025-12-11",
                "full_day",
                "1",
                "Test reason",
                "pending",
                new Date().toISOString(),
                "",
                "",
                "",
                "",
                new Date().toISOString(),
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "LeaveRequests!A:R",
                valueInputOption: "RAW",
                requestBody: {
                    values: [testRow],
                },
            });
            console.log(`   ✓ Successfully wrote test data to LeaveRequests`);

            // Delete the test row
            console.log(`   ✓ Cleaning up test data...`);
            const getResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "LeaveRequests!A:A",
            });
            const lastRow = getResponse.data.values?.length || 0;

            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `LeaveRequests!A${lastRow}:R${lastRow}`,
            });
            console.log(`   ✓ Test data cleaned up`);

        } catch (error: any) {
            console.log(`   ❌ Cannot write to LeaveRequests: ${error.message}`);
        }

        console.log("\n✅ All tests passed! Leave management system is properly configured.");
        console.log(`\n🔗 Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

    } catch (error: any) {
        console.error("\n❌ Connection Error:", error.message);
        if (error.message.includes("permission")) {
            console.log("\n💡 The service account may not have access to this spreadsheet.");
            console.log(`   Share the spreadsheet with: ${clientEmail}`);
        }
    }
}

// Run the test
testLeaveSetup()
    .then(() => {
        console.log("\n✨ Test completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Test failed:", error.message);
        process.exit(1);
    });
