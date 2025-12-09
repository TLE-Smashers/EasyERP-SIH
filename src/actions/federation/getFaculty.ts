"use server";

import { google } from "googleapis";
import { FacultyProfile } from "@/types/facultyRequest";

const SUPER_MASTER_SHEET_ID = process.env.SUPER_MASTER_SHEET_ID;
const FACULTY_SHEET = "Faculty";

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
 * Initialize Faculty sheet in Super Master if it doesn't exist
 */
async function initializeFacultySheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // Check if sheet exists
    try {
      await sheets.spreadsheets.get({
        spreadsheetId: SUPER_MASTER_SHEET_ID,
        ranges: [`${FACULTY_SHEET}!A1`],
      });
    } catch (error) {
      // Create sheet if it doesn't exist
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SUPER_MASTER_SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: FACULTY_SHEET,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SUPER_MASTER_SHEET_ID,
        range: `${FACULTY_SHEET}!A1:I1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Faculty ID",
              "Full Name",
              "Email",
              "Institution ID",
              "Institution Name",
              "Department",
              "Specialization",
              "Designation",
              "Status",
            ],
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error initializing Faculty sheet:", error);
  }
}

/**
 * Get all available faculty from Super Master Sheet
 */
export async function getAvailableFaculty(): Promise<FacultyProfile[]> {
  try {
    await initializeFacultySheet();

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    // Fetch all faculty from Super Master Sheet
    const facultyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${FACULTY_SHEET}!A2:I`,
    });

    const facultyRows = facultyResponse.data.values || [];
    const facultyProfiles: FacultyProfile[] = [];

    facultyRows.forEach((row) => {
      // Faculty sheet structure in Super Master:
      // A: Faculty ID, B: Full Name, C: Email, D: Institution ID, 
      // E: Institution Name, F: Department, G: Specialization, 
      // H: Designation, I: Status
      
      const facultyId = row[0] || "";
      const fullName = row[1] || "";
      const email = row[2] || "";
      const institutionId = row[3] || "";
      const institutionName = row[4] || "";
      const department = row[5] || "";
      const specialization = row[6] || "";
      const designation = row[7] || "";
      const status = row[8] || "";

      // Only include active faculty with email and name
      if (email && fullName && status === "active") {
        facultyProfiles.push({
          email,
          name: fullName,
          institutionId,
          institutionName,
          department,
          specialization,
          designation,
          available: true,
          rating: undefined,
          totalSessions: undefined,
        });
      }
    });

    return facultyProfiles;
  } catch (error) {
    console.error("Error fetching available faculty:", error);
    return [];
  }
}

/**
 * Search faculty by name, department, or specialization
 */
export async function searchFaculty(query: string): Promise<FacultyProfile[]> {
  try {
    const allFaculty = await getAvailableFaculty();
    const lowerQuery = query.toLowerCase();

    return allFaculty.filter(
      (faculty) =>
        faculty.name.toLowerCase().includes(lowerQuery) ||
        faculty.department?.toLowerCase().includes(lowerQuery) ||
        faculty.specialization?.toLowerCase().includes(lowerQuery) ||
        faculty.institutionName.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error("Error searching faculty:", error);
    return [];
  }
}

/**
 * Get faculty from a specific institution
 */
export async function getFacultyByInstitution(
  institutionId: string
): Promise<FacultyProfile[]> {
  try {
    const allFaculty = await getAvailableFaculty();
    return allFaculty.filter(
      (faculty) => faculty.institutionId === institutionId
    );
  } catch (error) {
    console.error("Error fetching faculty by institution:", error);
    return [];
  }
}

/**
 * Add a faculty member to Super Master Sheet
 */
export async function addFaculty(data: {
  facultyId: string;
  fullName: string;
  email: string;
  institutionId: string;
  institutionName: string;
  department: string;
  specialization: string;
  designation: string;
}) {
  try {
    await initializeFacultySheet();

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: (await auth.getClient()) as any });

    const row = [
      data.facultyId,
      data.fullName,
      data.email,
      data.institutionId,
      data.institutionName,
      data.department,
      data.specialization,
      data.designation,
      "active", // Status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SUPER_MASTER_SHEET_ID,
      range: `${FACULTY_SHEET}!A:I`,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return {
      success: true,
      message: "Faculty added successfully",
    };
  } catch (error) {
    console.error("Error adding faculty:", error);
    return {
      success: false,
      message: "Failed to add faculty",
    };
  }
}
