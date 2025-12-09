"use server";

import { Backup } from "@/types/backup";
import { fetchAllApplications } from "@/lib/google/sheets.admission";

/**
 * Simple Backup Actions for Prototype
 * Following SOLID principles - Single Responsibility
 */

// Mock storage for prototype (replace with Google Sheets/Drive in production)
const mockBackups: Backup[] = [];

/**
 * Create a new backup
 * Fetches actual data from Google Sheets and creates backup
 */
export async function createBackup(
  type: string,
  modules?: string[]
): Promise<Backup> {
  try {
    let backupData: any = {};
    let dataSize = 0;

    // Fetch actual data based on backup type
    if (type === "Full System" || type === "Admission Data") {
      const admissionData = await fetchAllApplications();
      backupData.admissions = admissionData;
      dataSize += JSON.stringify(admissionData).length;
    }

    if (type === "Full System" || type === "Student Records") {
      // Add student data when available
      backupData.students = [];
    }

    if (type === "Full System") {
      // Add other modules when available
      backupData.faculty = [];
      backupData.library = [];
      backupData.hostel = [];
      backupData.payments = [];
    }

    // Calculate actual size
    const sizeInBytes = JSON.stringify(backupData).length;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;
    const formattedSize = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(2)} MB` 
      : `${sizeInKB.toFixed(2)} KB`;

    // Create backup object
    const backup: Backup = {
      id: Date.now().toString(),
      name: `${type} Backup - ${new Date().toLocaleDateString()}`,
      type,
      status: "completed",
      createdAt: new Date().toISOString(),
      size: formattedSize,
      downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`,
    };

    mockBackups.unshift(backup);

    return backup;
  } catch (error) {
    console.error("Error creating backup:", error);
    throw new Error("Failed to create backup");
  }
}

/**
 * Get all backups
 */
export async function getBackups(): Promise<Backup[]> {
  try {
    return mockBackups;
  } catch (error) {
    console.error("Error fetching backups:", error);
    throw new Error("Failed to fetch backups");
  }
}

/**
 * Delete a backup
 */
export async function deleteBackup(id: string): Promise<void> {
  try {
    const index = mockBackups.findIndex((b) => b.id === id);
    if (index !== -1) {
      mockBackups.splice(index, 1);
    }
  } catch (error) {
    console.error("Error deleting backup:", error);
    throw new Error("Failed to delete backup");
  }
}

/**
 * Export data as JSON (simple implementation for prototype)
 */
export async function exportDataAsJSON(data: any[]): Promise<string> {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Error exporting data:", error);
    throw new Error("Failed to export data");
  }
}

/**
 * Restore backup to Google Sheets
 * Converts JSON backup back to Sheet format and writes data
 */
export async function restoreBackup(backupData: any): Promise<void> {
  try {
    console.log("🔄 Starting backup restore...");
    
    // Validate backup data
    if (!backupData || !backupData.admissions) {
      throw new Error("Invalid backup format");
    }

    const { google } = await import("googleapis");
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Admissions";

    if (!SPREADSHEET_ID) {
      throw new Error("GOOGLE_SHEETS_ID not configured");
    }

    // Get auth client
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentials) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: auth as any });

    // Convert Application objects back to Sheet rows
    const rows = backupData.admissions.map((app: any) => {
      return [
        app.timestamp || "",
        app.personalDetails?.fullName || "",
        app.personalDetails?.email || "",
        app.personalDetails?.mobileNumber || "",
        app.personalDetails?.dateOfBirth || "",
        app.personalDetails?.address || "",
        app.personalDetails?.guardianName || "",
        app.personalDetails?.guardianContact || "",
        app.academicDetails?.school10th || "",
        app.academicDetails?.board10th || "",
        app.academicDetails?.marks10th || "",
        app.academicDetails?.yearOfPassing10th || "",
        app.academicDetails?.school12th || "",
        app.academicDetails?.board12th || "",
        app.academicDetails?.marks12th || "",
        app.academicDetails?.yearOfPassing12th || "",
        app.academicDetails?.course || "",
        app.academicDetails?.branch || "",
        app.documents?.marksheet10th || "",
        app.documents?.marksheet12th || "",
        app.documents?.entranceExamMarksheet || "",
        app.documents?.allotmentLetter || "",
        app.documents?.transferCertificate || "",
        app.documents?.characterCertificate || "",
        app.documents?.domicileCertificate || "",
        app.documents?.casteCertificate || "",
        app.documents?.idProof || "",
        app.documents?.photo || "",
        app.documents?.gapCertificate || "",
        app.applicationStatus || "",
        app.documentsVerified ? "TRUE" : "FALSE",
        app.verifiedBy || "",
        app.verifiedDate || "",
        app.completionDetails?.finalRemarks || "",
        app.locked ? "TRUE" : "FALSE",
        app.lockedBy || "",
        app.lockedDate || "",
      ];
    });

    console.log(`📝 Restoring ${rows.length} records...`);

    // Clear existing data (except header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:AK`,
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    // Clear cache after restore
    const { cache } = await import("@/lib/cache/simple-cache");
    cache.clear('admission_applications');

    console.log(`✅ Restored ${rows.length} records successfully`);
  } catch (error) {
    console.error("Error restoring backup:", error);
    throw new Error("Failed to restore backup");
  }
}
