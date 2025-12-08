"use server";

import { google } from "googleapis";
import { revalidatePath } from "next/cache";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

export interface ReferralSubmission {
    alumniEmail: string;
    alumniName: string;
    companyName: string;
    jobTitle: string;
    jobLocation: string;
    experienceRequired: string;
    skillsRequired: string;
    numberOfPositions: string;
    salary: string;
    jobDescription: string;
    applicationDeadline: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    referralLink: string;
    additionalNotes: string;
}

export async function submitReferral(data: ReferralSubmission) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Create AlumniReferrals sheet if it doesn't exist
        try {
            await sheets.spreadsheets.get({
                spreadsheetId: SPREADSHEET_ID,
                ranges: ["AlumniReferrals!A1"],
            });
        } catch (error) {
            // Sheet doesn't exist, create it
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: "AlumniReferrals",
                                },
                            },
                        },
                    ],
                },
            });

            // Add headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "AlumniReferrals!A1:R1",
                valueInputOption: "RAW",
                requestBody: {
                    values: [
                        [
                            "Timestamp",
                            "Status",
                            "Alumni Email",
                            "Alumni Name",
                            "Company Name",
                            "Job Title",
                            "Location",
                            "Experience Required",
                            "Skills Required",
                            "Number of Positions",
                            "Salary",
                            "Job Description",
                            "Application Deadline",
                            "Contact Person",
                            "Contact Email",
                            "Contact Phone",
                            "Referral Link",
                            "Additional Notes",
                        ],
                    ],
                },
            });
        }

        // Append the referral data
        const timestamp = new Date().toISOString();
        const row = [
            timestamp,
            "approved", // Status: approved (auto-approved, directly visible to students)
            data.alumniEmail,
            data.alumniName,
            data.companyName,
            data.jobTitle,
            data.jobLocation,
            data.experienceRequired,
            data.skillsRequired,
            data.numberOfPositions,
            data.salary,
            data.jobDescription,
            data.applicationDeadline,
            data.contactPerson,
            data.contactEmail,
            data.contactPhone,
            data.referralLink,
            data.additionalNotes,
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniReferrals!A:R",
            valueInputOption: "RAW",
            requestBody: {
                values: [row],
            },
        });

        // Revalidate student dashboard to show new referral immediately
        revalidatePath("/dashboard/student");

        return {
            success: true,
            message: "Referral submitted successfully and is now visible to students",
        };
    } catch (error) {
        console.error("Error submitting referral:", error);
        return {
            success: false,
            message: "Failed to submit referral. Please try again.",
        };
    }
}

export interface ApprovedReferral {
    id: string;
    timestamp: string;
    alumniName: string;
    companyName: string;
    jobTitle: string;
    jobLocation: string;
    experienceRequired: string;
    skillsRequired: string;
    numberOfPositions: string;
    salary: string;
    jobDescription: string;
    applicationDeadline: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    referralLink: string;
}

export async function getApprovedReferrals(): Promise<ApprovedReferral[]> {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniReferrals!A2:R",
        });

        const rows = response.data.values || [];

        console.log("[getApprovedReferrals] Fetched rows:", rows.length);
        console.log("[getApprovedReferrals] Sample rows:", JSON.stringify(rows.slice(0, 2), null, 2));

        // Filter only approved referrals
        const approvedReferrals = rows
            .filter((row) => {
                const status = row[1]?.toLowerCase()?.trim();
                const isApproved = row.length > 1 && status === "approved";
                if (row.length > 1) {
                    console.log(`[getApprovedReferrals] Row filter - Status: "${row[1]}" -> "${status}" -> Approved: ${isApproved}`);
                }
                return isApproved;
            })
            .map((row, index) => ({
                id: `REF-${index + 1}`,
                timestamp: row[0] || "",
                alumniName: row[3] || "",
                companyName: row[4] || "",
                jobTitle: row[5] || "",
                jobLocation: row[6] || "",
                experienceRequired: row[7] || "",
                skillsRequired: row[8] || "",
                numberOfPositions: row[9] || "",
                salary: row[10] || "",
                jobDescription: row[11] || "",
                applicationDeadline: row[12] || "",
                contactPerson: row[13] || "",
                contactEmail: row[14] || "",
                contactPhone: row[15] || "",
                referralLink: row[16] || "",
            }));

        console.log("[getApprovedReferrals] Total approved referrals:", approvedReferrals.length);
        console.log("[getApprovedReferrals] Referrals:", JSON.stringify(approvedReferrals, null, 2));

        return approvedReferrals;
    } catch (error) {
        console.error("Error fetching approved referrals:", error);
        return [];
    }
}

export async function getAllReferrals() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniReferrals!A2:R",
        });

        const rows = response.data.values || [];

        return rows.map((row, index) => ({
            rowNumber: index + 2,
            timestamp: row[0] || "",
            status: row[1] || "approved",
            alumniEmail: row[2] || "",
            alumniName: row[3] || "",
            companyName: row[4] || "",
            jobTitle: row[5] || "",
            jobLocation: row[6] || "",
            experienceRequired: row[7] || "",
            skillsRequired: row[8] || "",
            numberOfPositions: row[9] || "",
            salary: row[10] || "",
            jobDescription: row[11] || "",
            applicationDeadline: row[12] || "",
            contactPerson: row[13] || "",
            contactEmail: row[14] || "",
            contactPhone: row[15] || "",
            referralLink: row[16] || "",
            additionalNotes: row[17] || "",
        }));
    } catch (error) {
        console.error("Error fetching referrals:", error);
        return [];
    }
}

export async function getUserReferrals(alumniEmail: string) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "AlumniReferrals!A2:R",
        });

        const rows = response.data.values || [];

        // Filter referrals by alumni email
        return rows
            .filter((row) => row[2]?.toLowerCase()?.trim() === alumniEmail.toLowerCase().trim())
            .map((row, index) => ({
                id: `REF-${index + 1}`,
                timestamp: row[0] || "",
                status: row[1] || "approved",
                alumniEmail: row[2] || "",
                alumniName: row[3] || "",
                companyName: row[4] || "",
                jobTitle: row[5] || "",
                jobLocation: row[6] || "",
                experienceRequired: row[7] || "",
                skillsRequired: row[8] || "",
                numberOfPositions: row[9] || "",
                salary: row[10] || "",
                jobDescription: row[11] || "",
                applicationDeadline: row[12] || "",
                contactPerson: row[13] || "",
                contactEmail: row[14] || "",
                contactPhone: row[15] || "",
                referralLink: row[16] || "",
                additionalNotes: row[17] || "",
            }))
            .reverse(); // Most recent first
    } catch (error) {
        console.error("Error fetching user referrals:", error);
        return [];
    }
}
