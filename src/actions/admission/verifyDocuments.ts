/**
 * Verify Documents Action
 * Server action for Step 3: Document Verification
 */

"use server";

import { auth } from "@/lib/auth/auth";
import { updateApplication, fetchApplicationById } from "@/lib/google/sheets.admission";
import { sendDocumentVerificationEmail } from "@/lib/email/mailer";
import { ApiResponse } from "@/types/admission";
import { revalidatePath } from "next/cache";

export async function verifyDocuments(
  applicationId: string,
  notes?: string
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

    // Get application to retrieve student details
    const application = await fetchApplicationById(applicationId);
    
    if (!application) {
      return {
        success: false,
        error: "Application not found",
      };
    }

    // Update application with verification details
    await updateApplication(rowNumber, {
      applicationStatus: "documents_verified",
      documentsVerified: true,
      verifiedBy: session.user.email,
      verificationDate: new Date().toISOString(),
    });

    // Send email notification
    try {
      await sendDocumentVerificationEmail(
        application.personalDetails.email,
        application.personalDetails.fullName,
        applicationId
      );
      console.log(`📧 Document verification email sent to ${application.personalDetails.email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the verification if email fails
    }

    // Revalidate paths for UI update
    revalidatePath("/dashboard/admission/applications");
    revalidatePath(`/dashboard/admission/applications/${applicationId}`);

    return {
      success: true,
      data: { message: "Documents verified successfully" },
    };
  } catch (error) {
    console.error("Error verifying documents:", error);
    return {
      success: false,
      error: "Failed to verify documents",
    };
  }
}
