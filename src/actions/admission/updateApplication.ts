/**
 * Update Application Action
 * Server action to update application data
 */

"use server";

import { google } from "googleapis";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { updateApplication as updateApplicationSheet } from "@/lib/google/sheets.admission";
import { ApplicationUpdateData, ApiResponse } from "@/types/admission";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Admissions";

async function getAuthClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set");
  }

  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_ID environment variable is not set");
  }

  const authClient = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return authClient;
}

/**
 * Update Application - New Implementation
 */
export async function updateApplication(
  applicationId: string,
  data: ApplicationUpdateData
): Promise<ApiResponse> {
  try {
    // Extract row number from application ID
    const rowNumber = parseInt(applicationId.replace("APP-", ""));
    
    if (isNaN(rowNumber)) {
      return {
        success: false,
        error: "Invalid application ID",
      };
    }

    await updateApplicationSheet(rowNumber, data);

    // Revalidate pages
    revalidatePath("/dashboard/admission/applications");
    revalidatePath("/dashboard/admission");

    return {
      success: true,
      data: { message: "Application updated successfully" },
    };
  } catch (error) {
    console.error("Error updating application:", error);
    return {
      success: false,
      error: "Failed to update application",
    };
  }
}

export async function verifyApplication(rowIndex: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!F${rowIndex}:I${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["verified", "paid", session.user.email, now]],
      },
    });

    // Revalidate the cache
    revalidatePath("/dashboard/admission/applications");
    revalidatePath("/dashboard/admission");

    return { success: true };
  } catch (error) {
    console.error("Error verifying application:", error);
    throw new Error("Failed to verify application");
  }
}

export async function rejectApplication(rowIndex: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!F${rowIndex}:I${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["rejected", "failed", session.user.email, now]],
      },
    });

    // Revalidate the cache
    revalidatePath("/dashboard/admission/applications");
    revalidatePath("/dashboard/admission");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting application:", error);
    throw new Error("Failed to reject application");
  }
}

export async function updateApplicationStatus(rowIndex: string, status: string) {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!F${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    throw new Error("Failed to update application status");
  }
}

/**
 * @deprecated Use the main payment system instead. This function is kept for backwards compatibility.
 * Payment tracking is now handled by src/actions/payment/paymentActions.ts
 */
export async function updatePaymentInfo(
  rowIndex: string,
  paymentStatus: string,
  paymentID?: string,
  amount?: string
) {
  console.warn("updatePaymentInfo is deprecated. Use the payment system instead.");
  throw new Error("This function is deprecated. Use the payment system in src/actions/payment/ instead.");
}

/**
 * @deprecated This function updates fields using old column structure.
 * Use updateApplication() with ApplicationUpdateData instead.
 */
export async function updateApplicationFields(
  rowIndex: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    course?: string;
    status?: string;
  }
) {
  console.warn("updateApplicationFields is deprecated. Use updateApplication() instead.");
  
  // Convert to new format and use main update function
  const applicationId = `APP-${rowIndex}`;
  const updateData: ApplicationUpdateData = {};
  
  if (data.name || data.email || data.phone) {
    updateData.personalDetails = {
      ...(data.name && { fullName: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.phone && { mobileNumber: data.phone }),
    };
  }
  
  if (data.course) {
    updateData.academicDetails = { course: data.course };
  }
  
  if (data.status) {
    updateData.applicationStatus = data.status as any;
  }
  
  return updateApplication(applicationId, updateData);
}
