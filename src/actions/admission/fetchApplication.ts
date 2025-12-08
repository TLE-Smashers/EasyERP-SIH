/**
 * Fetch Single Application Action
 * Server action to get application details by ID
 */

"use server";

import { fetchApplicationById } from "@/lib/google/sheets.admission";
import { Application, ApiResponse } from "@/types/admission";

export async function fetchApplication(
  applicationId: string
): Promise<ApiResponse<Application>> {
  try {
    const application = await fetchApplicationById(applicationId);

    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error("Error fetching application:", error);
    return {
      success: false,
      error: "Failed to fetch application details",
    };
  }
}
