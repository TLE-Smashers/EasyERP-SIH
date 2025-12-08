/**
 * Complete Admission Action
 * Server action for Step 5: Final Completion and Lock
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { updateApplication } from "@/lib/google/sheets.admission";
import { CompletionDetails, ApiResponse } from "@/types/admission";
import { revalidatePath } from "next/cache";

export async function completeAdmission(
  applicationId: string,
  completionData: CompletionDetails
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Extract row number from application ID
    const rowNumber = parseInt(applicationId.replace("APP-", ""));
    
    if (isNaN(rowNumber)) {
      return {
        success: false,
        error: "Invalid application ID",
      };
    }

    // Update application - mark as completed and locked
    await updateApplication(rowNumber, {
      applicationStatus: "completed",
      completionDetails: completionData,
      locked: true,
      lockedBy: session.user.email,
      lockedDate: new Date().toISOString(),
    });

    // Send final confirmation email
    try {
      const { sendAdmissionCompletionEmail } = await import("@/lib/email/mailer");
      const application = await import("@/lib/google/sheets.admission").then(m => m.fetchApplicationById(applicationId));
      
      if (application) {
        // For now, use placeholder values until email template is updated
        await sendAdmissionCompletionEmail(
          application.personalDetails.email,
          application.personalDetails.fullName,
          applicationId,
          new Date().toISOString(), // Placeholder reporting date
          "TBA", // Placeholder batch
          "TBA"  // Placeholder section
        );
      }
    } catch (emailError) {
      console.error("Failed to send email, but admission completed:", emailError);
      // Don't fail the whole operation if email fails
    }

    revalidatePath("/dashboard/admission/applications");
    revalidatePath(`/dashboard/admission/applications/${applicationId}`);

    return {
      success: true,
      data: { message: "Admission completed and locked successfully" },
    };
  } catch (error) {
    console.error("Error completing admission:", error);
    return {
      success: false,
      error: "Failed to complete admission",
    };
  }
}

/**
 * Unlock Application (Admin only)
 */
export async function unlockApplication(applicationId: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // TODO: Check if user has admin role
    // if (session.user.role !== "admin") {
    //   return {
    //     success: false,
    //     error: "Only admins can unlock applications",
    //   };
    // }

    // Extract row number from application ID
    const rowNumber = parseInt(applicationId.replace("APP-", ""));
    
    if (isNaN(rowNumber)) {
      return {
        success: false,
        error: "Invalid application ID",
      };
    }

    // Unlock the application
    await updateApplication(rowNumber, {
      locked: false,
      lockedBy: undefined,
      lockedDate: undefined,
    });

    revalidatePath("/dashboard/admission/applications");
    revalidatePath(`/dashboard/admission/applications/${applicationId}`);

    return {
      success: true,
      data: { message: "Application unlocked successfully" },
    };
  } catch (error) {
    console.error("Error unlocking application:", error);
    return {
      success: false,
      error: "Failed to unlock application",
    };
  }
}
